import { createAuthClient } from 'better-auth/react'
import { ssoClient } from '@better-auth/sso/client'

export const authClient = createAuthClient({
  plugins: [ssoClient()],
  baseURL: import.meta.env.SSR
    ? process.env.SERVER_URL || 'http://localhost:3000'
    : window.location.origin,
  basePath: '/api/auth',
})

const baseUseSession = authClient.useSession
type BaseUseSessionReturn = ReturnType<typeof baseUseSession>
type BaseSessionData = NonNullable<BaseUseSessionReturn['data']>
type SessionWithOrg = BaseSessionData['session'] & {
  activeOrgId?: string | null
}
type EnhancedSessionData = Omit<BaseSessionData, 'session'> & {
  activeOrgId: string | null
  session: BaseSessionData['session'] & {
    activeOrgId: string | null
  }
}
type EnhancedUseSessionReturn = Omit<BaseUseSessionReturn, 'data'> & {
  data: EnhancedSessionData | null
}

export const useSession = (): EnhancedUseSessionReturn => {
  const result = baseUseSession()
  const rawSession = result.data?.session as SessionWithOrg | undefined
  const activeOrgId =
    typeof rawSession?.activeOrgId === 'string' ? rawSession.activeOrgId : null

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
