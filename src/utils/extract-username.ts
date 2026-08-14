export function extractUsername(email: string) {
  return email.split("@")[0]?.toLocaleLowerCase()
}
