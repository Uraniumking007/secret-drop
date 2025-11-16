import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'
import { secretsRouter } from './routers/secrets'
import { organizationsRouter } from './routers/organizations'
import { teamsRouter } from './routers/teams'
import { billingRouter } from './routers/billing'
import { apiTokensRouter } from './routers/api-tokens'

import type { TRPCRouterRecord } from '@trpc/server'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: publicProcedure.query(() => todos),
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  secrets: secretsRouter,
  organizations: organizationsRouter,
  teams: teamsRouter,
  billing: billingRouter,
  apiTokens: apiTokensRouter,
})
export type TRPCRouter = typeof trpcRouter
