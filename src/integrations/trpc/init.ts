import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { auth } from '@/lib/auth'

export interface Context {
  session: Awaited<ReturnType<typeof auth.api.getSession>> | null
  request: Request | null
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Authenticated procedure - requires valid session
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})
