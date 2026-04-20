// Extract a string message from an unknown thrown value.
// Prefer Error.message; fall back to String(err) for plain throws.
export function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return String(err);
  } catch {
    return 'Unknown error';
  }
}
