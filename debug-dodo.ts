import { dodo } from './src/lib/dodopayments'

async function checkWebhookMethods() {
  if (!dodo) {
    console.log('Dodo Payments not initialized')
    return
  }

  // @ts-ignore
  console.log('dodo.webhooks keys:', Object.keys(dodo.webhooks || {}))
  // @ts-ignore
  console.log('dodo keys:', Object.keys(dodo))
}

checkWebhookMethods()
