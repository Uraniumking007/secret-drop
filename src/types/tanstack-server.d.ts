import type { AnyRoute } from '@tanstack/router-core'
import type { RouteServerOptions } from '@tanstack/start-client-core'
import '@tanstack/start-client-core'

declare module '@tanstack/router-core' {
  interface FilebaseRouteOptionsInterface<
    TRegister,
    TParentRoute extends AnyRoute,
    TId extends string,
    TPath extends string,
    TSearchValidator,
    TParams,
    TLoaderDeps extends Record<string, any>,
    TLoaderFn,
    TRouterContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TRemountDepsFn,
    TSSR,
    TServerMiddlewares,
    THandlers,
  > {
    server?: RouteServerOptions<
      TRegister,
      TParentRoute,
      TPath,
      TParams,
      TLoaderDeps,
      TLoaderFn,
      TRouterContext,
      TRouteContextFn,
      TBeforeLoadFn,
      TServerMiddlewares,
      THandlers
    >
  }
}
