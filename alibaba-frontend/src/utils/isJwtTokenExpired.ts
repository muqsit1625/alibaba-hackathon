export default function isJwtTokenExpired(token: string) {
  if (token === '') {
    return false;
  }

  const expiry = JSON.parse(atob(token.split('.')[1])).exp;
  return Math.floor(new Date().getTime() / 1000) >= expiry;
}
