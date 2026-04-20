export function getAuthorToken(): string {
  let token = localStorage.getItem('commentAuthorToken');
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('commentAuthorToken', token);
  }
  return token;
}
