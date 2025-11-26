export interface RequestMetadata {
  ipAddress: string | null
  userAgent: string | null
}

const IP_HEADER_CANDIDATES = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-real-ip',
  'x-forwarded-for',
  'forwarded',
] as const

function normalizeForwarded(value: string | null): string | null {
  if (!value) {
    return null
  }

  // Forwarded headers can contain multiple, comma-separated entries.
  let firstEntry = value.split(',')[0]?.trim()
  if (!firstEntry) {
    return null
  }

  // Drop anything after the first semicolon (Forwarded header attributes).
  const semicolonIndex = firstEntry.indexOf(';')
  if (semicolonIndex !== -1) {
    firstEntry = firstEntry.slice(0, semicolonIndex)
  }

  if (firstEntry.toLowerCase().startsWith('for=')) {
    const forwardedValue = firstEntry.slice(4).trim()
    return forwardedValue.replace(/^"|"$/g, '')
  }

  return firstEntry
}

export function extractRequestMetadata(
  request?: Request | null,
): RequestMetadata {
  if (!request) {
    return {
      ipAddress: null,
      userAgent: null,
    }
  }

  const headers = request.headers
  let ipAddress: string | null = null

  for (const header of IP_HEADER_CANDIDATES) {
    const rawValue = headers.get(header)
    const normalized = normalizeForwarded(rawValue)
    if (normalized) {
      ipAddress = normalized
      break
    }
  }

  // Fallback to remote address encoded via Bun (non-standard)
  if (!ipAddress) {
    const bunRemoteAddr = headers.get('x-bun-remote-addr')
    ipAddress = normalizeForwarded(bunRemoteAddr)
  }

  const userAgent = headers.get('user-agent')

  return {
    ipAddress,
    userAgent,
  }
}
