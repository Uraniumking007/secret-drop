#!/usr/bin/env node

/**
 * SecretDrop CLI
 * Command-line interface for managing secrets
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { config } from 'dotenv'
import { Command } from 'commander'

config()

const CONFIG_FILE = join(homedir(), '.secretdrop', 'config.json')
const API_BASE_URL = process.env.SECRETDROP_API_URL || 'http://localhost:3000'

interface Config {
  apiToken?: string
  apiUrl?: string
}

function loadConfig(): Config {
  if (existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
    } catch {
      return {}
    }
  }
  return {}
}

function saveConfig(config: Config) {
  const configDir = join(homedir(), '.secretdrop')
  if (!existsSync(configDir)) {
    require('node:fs').mkdirSync(configDir, { recursive: true })
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const config = loadConfig()
  const token = process.env.SECRETDROP_TOKEN || config.apiToken

  if (!token) {
    throw new Error('API token not found. Run "secretdrop auth" first.')
  }

  const url = `${config.apiUrl || API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API error: ${response.statusText}`)
  }

  return response.json()
}

const program = new Command()

program
  .name('secretdrop')
  .description('SecretDrop CLI - Manage secrets from the command line')
  .version('1.0.0')

program
  .command('auth')
  .description('Authenticate with SecretDrop API')
  .option('-t, --token <token>', 'API token')
  .option('-u, --url <url>', 'API base URL')
  .action((options) => {
    const config: Config = {}
    if (options.token) config.apiToken = options.token
    if (options.url) config.apiUrl = options.url
    saveConfig(config)
    console.log('Configuration saved!')
  })

program
  .command('get <name>')
  .description('Get a secret by name')
  .option('-o, --org <orgId>', 'Organization ID')
  .action(async (name, options) => {
    try {
      // TODO: Implement get secret by name
      console.log(`Getting secret: ${name}`)
    } catch (error: any) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program
  .command('set <name> <value>')
  .description('Create or update a secret')
  .option('-o, --org <orgId>', 'Organization ID')
  .option('-e, --expires <duration>', 'Expiration (1h, 1d, 7d, 30d)')
  .action(async (name, value, options) => {
    try {
      // TODO: Implement set secret
      console.log(`Setting secret: ${name}`)
    } catch (error: any) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('List all secrets')
  .option('-o, --org <orgId>', 'Organization ID')
  .action(async (options) => {
    try {
      // TODO: Implement list secrets
      console.log('Listing secrets...')
    } catch (error: any) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program
  .command('delete <name>')
  .description('Delete a secret')
  .option('-o, --org <orgId>', 'Organization ID')
  .action(async (name, options) => {
    try {
      // TODO: Implement delete secret
      console.log(`Deleting secret: ${name}`)
    } catch (error: any) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
