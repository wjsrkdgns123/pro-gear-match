import { Router } from "express";
import axios from "axios";
import { errMsg } from "../../utils/errors";
import { ExcelQuery, MsCallbackQuery, parseOr400 } from "../validators";

// Microsoft OAuth + OneDrive Excel read.
// Needs client credentials and a redirect URI — endpoint 500s when missing.
export function createMicrosoftRouter(opts: {
  clientId?: string;
  clientSecret?: string;
  redirectUri: string;
}): Router {
  const router = Router();
  const { clientId, clientSecret, redirectUri } = opts;

  router.get("/auth/microsoft/url", (_req, res) => {
    if (!clientId) {
      return res.status(500).json({ error: "MICROSOFT_CLIENT_ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "offline_access Files.Read Files.Read.All",
      response_mode: "query",
    });
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
    res.json({ url: authUrl });
  });

  router.get("/auth/microsoft/callback", async (req, res) => {
    const parsed = parseOr400(MsCallbackQuery, req.query, res);
    if (!parsed) return;
    const { code } = parsed;

    try {
      const response = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      req.session!.microsoftToken = response.data.access_token;

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'MICROSOFT_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: unknown) {
      const axiosData = (error as { response?: { data?: unknown } })?.response?.data;
      console.error("Microsoft Auth Error:", axiosData ?? errMsg(error));
      res.status(500).send("Authentication failed");
    }
  });

  router.get("/excel/data", async (req, res) => {
    const token = req.session!.microsoftToken;
    if (!token) return res.status(401).json({ error: "Not authenticated with Microsoft" });
    const parsed = parseOr400(ExcelQuery, req.query, res);
    if (!parsed) return;
    const shareUrl = parsed.url;

    try {
      const base64Url = Buffer.from(shareUrl)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const shareId = `u!${base64Url}`;

      const driveItemResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const driveId = driveItemResponse.data.parentReference.driveId;
      const itemId = driveItemResponse.data.id;

      const worksheetsResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const firstSheetName = worksheetsResponse.data.value[0].name;

      const rangeResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${firstSheetName}/usedRange`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      res.json({
        fileName: driveItemResponse.data.name,
        data: rangeResponse.data.values,
      });
    } catch (error: unknown) {
      const axiosData = (error as { response?: { data?: unknown } })?.response?.data;
      console.error("Excel Data Error:", axiosData ?? errMsg(error));
      res.status(500).json({ error: "Failed to fetch Excel data" });
    }
  });

  return router;
}
