import { db } from '@/db'
import { secretAccessLogs, secrets } from '@/db/schema'

async function run() {
  await db.delete(secretAccessLogs)
  await db.delete(secrets)
  console.log('Deleted all existing secrets and access logs.')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
