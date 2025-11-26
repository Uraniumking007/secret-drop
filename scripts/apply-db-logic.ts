import { db } from '../src/db'
import { deleteExpiredSecretsFunc } from '../src/db/functions'
import {
    deleteExpiredSecretsTrigger,
    deleteExpiredSecretsOnInsertTrigger,
    populateSecretDetailsTrigger,
    populateShareDetailsTrigger
} from '../src/db/triggers'

async function applyLogic() {
    console.log('Applying database functions and triggers...')

    try {
        // Apply functions
        console.log('Applying delete_expired_secrets function...')
        await db.execute(deleteExpiredSecretsFunc)

        // Apply triggers
        console.log('Applying delete_expired_secrets trigger...')
        await db.execute(deleteExpiredSecretsTrigger)

        console.log('Applying delete_expired_secrets_insert trigger...')
        await db.execute(deleteExpiredSecretsOnInsertTrigger)

        console.log('Applying populate_secret_details trigger...')
        await db.execute(populateSecretDetailsTrigger)

        console.log('Applying populate_share_details trigger...')
        await db.execute(populateShareDetailsTrigger)

        console.log('Successfully applied all database logic!')
    } catch (error) {
        console.error('Error applying database logic:', error)
        process.exit(1)
    }
}

applyLogic()
