/**
 * Generic OAuth 2.0 implementation for SSO
 */

export interface OAuth2Config {
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
  redirectUri: string
  scopes: Array<string>
}

export interface OAuth2TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

export interface OAuth2UserInfo {
  id: string
  email: string
  name?: string
  picture?: string
}

/**
 * Generate OAuth 2.0 authorization URL
 */
export function generateAuthorizationUrl(config: OAuth2Config): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: generateState(), // Should be stored and verified
  })

  return `${config.authorizationUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  config: OAuth2Config,
  code: string,
): Promise<OAuth2TokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Get user info from OAuth 2.0 provider
 */
export async function getUserInfo(
  config: OAuth2Config,
  accessToken: string,
): Promise<OAuth2UserInfo> {
  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`)
  }

  const data = await response.json()

  // Map common OAuth 2.0 user info fields
  return {
    id: data.sub || data.id || data.user_id,
    email: data.email,
    name: data.name || data.display_name,
    picture: data.picture || data.avatar_url,
  }
}

/**
 * Generate random state for OAuth 2.0 flow
 */
function generateState(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    const crypto = require('node:crypto')
    const randomBytes = crypto.randomBytes(32)
    array.set(randomBytes)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

/**
 * Provider-specific configurations
 */
export const providerConfigs = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    defaultScopes: ['openid', 'email', 'profile'],
  },
  okta: {
    authorizationUrl: '', // Must be provided per-org
    tokenUrl: '', // Must be provided per-org
    userInfoUrl: '', // Must be provided per-org
    defaultScopes: ['openid', 'email', 'profile'],
  },
  azure: {
    authorizationUrl:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    defaultScopes: ['openid', 'email', 'profile'],
  },
}
