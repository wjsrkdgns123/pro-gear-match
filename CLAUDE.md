# Pro Gear Match — Claude Code Guide

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion (`motion/react`)
- **Backend**: Node.js + Express + tsx, port 3001 (dev: 3010)
- **Database/Auth**: Firebase Firestore + Google Auth
- **AI**: Claude AI only (Anthropic SDK) — no Gemini/GenAI

## Dev Workflow
```bash
npm run dev      # Start Express + Vite (port 3010)
npm run lint     # tsc --noEmit — run after EVERY code change
```
**Always run lint after editing .ts/.tsx files.**

## AI Rules
- Claude AI only — all Gemini code has been removed
- Admin-only features: pro scraping, gear suggestions, YouTube highlights
- Regular users: NO AI intervention (data integrity)

## Admin
- Admin email: `wjsrkdgns123a@gmail.com`

## Key Files
| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component (single-file SPA) |
| `server.ts` | Express server + all API endpoints |
| `src/services/geminiService.ts` | All business logic (misnamed, keep as-is) |
| `src/firebase.ts` | Firestore + Auth setup |
| `src/types.ts` | Shared TypeScript types |
| `src/translations.ts` | i18n strings (EN + KO) |
| `src/constants.ts` | PRO_MICE, PRO_KEYBOARDS, etc. |

## UI Rules
- Dark/Light mode via `theme` state (localStorage)
- i18n: Korean (KO) + English (EN), `translations[lang]`
- Primary color: `emerald-500` (#10b981)
- Background (dark): `#050507`
- Form cards (dark): `#0c0c0e`
- **Do NOT add stats strip** (4 GAMES · PROS · LIVE boxes) to hero — removed intentionally

## Firestore
- Default deny for unauthenticated writes
- Schema validation via `isValidProGamer` on add
- Delete/bulk edit: admin only

## Games
Valorant · CS2 · Overwatch 2 · Apex Legends
Each game has its own color in `GAME_COLORS` constant.
