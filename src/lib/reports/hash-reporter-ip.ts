import { generateTokenAndHashedToken } from "@/helpers/token.helper"

export function hashReporterIp(ip: string): string {
  return generateTokenAndHashedToken(ip).hashedToken
}
