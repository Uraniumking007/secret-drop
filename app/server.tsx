/// <reference types="vinxi/types/server" />
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { getRouter } from '../src/router'

export default createStartHandler({
  createRouter: getRouter,
  getRouterManifest,
})(defaultStreamHandler)
