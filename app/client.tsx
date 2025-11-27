/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { getRouter } from '../src/router'

const router = getRouter()

hydrateRoot(document, <StartClient router={router} />)
