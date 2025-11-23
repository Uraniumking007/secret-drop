import { createAuthClient } from 'better-auth/react'
import { ssoClient } from '@better-auth/sso/client'

export const authClient = createAuthClient({
  plugins: [ssoClient()],
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.SERVER_URL || 'http://localhost:3000',
  basePath: '/api/auth',
})

const baseUseSession = authClient.useSession
type BaseUseSessionReturn = ReturnType<typeof baseUseSession>
type BaseSessionData = NonNullable<BaseUseSessionReturn['data']>
type SessionWithOrg = BaseSessionData['session'] & {
  activeOrgId?: number | null
}
type EnhancedSessionData = Omit<BaseSessionData, 'session'> & {
  activeOrgId: number | null
  session: BaseSessionData['session'] & {
    activeOrgId: number | null
  }
}
type EnhancedUseSessionReturn = Omit<BaseUseSessionReturn, 'data'> & {
  data: EnhancedSessionData | null
}

export const useSession = (): EnhancedUseSessionReturn => {
  const result = baseUseSession()
  const rawSession = result.data?.session as SessionWithOrg | undefined
  const activeOrgId =
    typeof rawSession?.activeOrgId === 'number' ? rawSession.activeOrgId : null

  const enhancedData = result.data
    ? {
      ...result.data,
      activeOrgId,
      session: {
        ...(rawSession ?? result.data.session),
        activeOrgId,
      },
    }
    : null

  return {
    ...result,
    data: enhancedData,
  }
}

export type SessionData = EnhancedSessionData

export const { signIn, signOut, signUp, getSession } = authClient
