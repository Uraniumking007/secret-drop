import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

const searchSchema = z.object({
  session_id: z.string().optional(),
  subscription_id: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/billing/success')({
  component: BillingSuccessPage,
  validateSearch: (search) => searchSchema.parse(search),
})

function BillingSuccessPage() {
  const search = useSearch({ from: '/billing/success' })
  const navigate = useNavigate()
  const trpc = useTRPC()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const verifyMutation = useMutation(
    trpc.billing.verifySession.mutationOptions({
      onSuccess: () => {
        setIsProcessing(false)
      },
      onError: (err) => {
        setIsProcessing(false)
        setError(err.message || 'Failed to verify subscription')
      },
    }),
  )

  useEffect(() => {
    if (search.session_id) {
      verifyMutation.mutate({ sessionId: search.session_id })
    } else {
      setIsProcessing(false)
      setError('No session ID found')
    }
  }, [search.session_id])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : error ? (
              <XCircle className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            )}
          </div>
          <CardTitle>
            {isProcessing
              ? 'Processing Payment...'
              : error
                ? 'Payment Failed'
                : 'Payment Successful!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          {isProcessing ? (
            <p>Please wait while we verify your subscription...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p>
              Your subscription has been activated successfully. You now have
              access to all Pro features.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => navigate({ to: '/dashboard/settings/billing' })}
            disabled={isProcessing}
          >
            Return to Billing
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
