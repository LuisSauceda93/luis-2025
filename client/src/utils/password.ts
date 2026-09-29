export async function hashPassword(password: string): Promise<string> {
  const passwordBytes = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes)
  const hashBytes = new Uint8Array(hashBuffer)

  return Array.from(hashBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(
  password: string,
  expectedHash: string,
): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === expectedHash
}
