import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  Building2,
  Check,
  CreditCard,
  Loader2,
  Package,
  Shield,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/dashboard/settings/billing')({
  component: BillingPage,
})

const PLANS = [
  {
    id: 'free',
    name: 'The Developer',
    description: 'For individual developers and hobbyists.',
    price: { monthly: '$0', yearly: '$0' },
    period: '/month',
    icon: Package,
    features: [
      'Personal Workspace',
      'Standard End-to-End Encryption',
      'Time-Based Expiration (1h, 1d, 7d)',
      'Password Protection',
      '10 Views Limit per Secret',
      '24-Hour Activity Log',
    ],
    current: true,
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'pro',
    name: 'The Collaborator',
    description: 'For startups and agile teams.',
    price: { monthly: '$15', yearly: '$12' },
    period: '/user/month',
    icon: Zap,
    features: [
      'Organization Workspaces',
      'Team Management',
      'Scoped Sharing',
      'Burn-on-Read',
      '30-Day Audit Trail',
      'Instant Revocation',
      'Role-Based Access Control',
    ],
    popular: true,
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
  },
  {
    id: 'business',
    name: 'The Enterprise',
    description: 'For scale-ups with compliance needs.',
    price: { monthly: 'Custom', yearly: 'Custom' },
    period: '',
    icon: Building2,
    features: [
      'Permanent Compliance Logs',
      'Single Sign-On (SSO)',
      'IP Allow-listing',
      'Secret Recovery (Trash Bin)',
      'Priority Support',
      'SLA',
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
  },
]

function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { data: session } = useSession()
  const trpc = useTRPC()
  const activeOrgId = session?.activeOrgId

  const checkoutMutation = useMutation(
    trpc.billing.createCheckout.mutationOptions(),
  )

  const handleUpgrade = (planId: string) => {
    if (!activeOrgId) {
      toast.error('Please select an organization to upgrade.')
      return
    }

    if (planId === 'business') {
      // Handle contact sales or business tier if self-serve
      // For now, let's assume business is also self-serve or just a contact link
      // If it's contact sales, we might want to open a mailto or a form
      window.location.href = 'mailto:sales@secretdrop.com'
      return
    }

    const tier = planId === 'pro' ? 'pro_team' : null

    if (tier) {
      checkoutMutation.mutate(
        {
          orgId: activeOrgId,
          tier,
        },
        {
          onSuccess: (data) => {
            window.location.href = data.url
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to start checkout')
          },
        },
      )
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Plans & Pricing</h1>
        <p className="text-muted-foreground max-w-2xl">
          Choose the plan that fits your needs. Upgrade or downgrade at any
          time.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Label
            htmlFor="billing-period"
            className={cn('cursor-pointer', !isAnnual && 'font-semibold')}
          >
            Monthly
          </Label>
          <Switch
            id="billing-period"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label
            htmlFor="billing-period"
            className={cn('cursor-pointer', isAnnual && 'font-semibold')}
          >
            Yearly{' '}
            <Badge variant="secondary" className="ml-1 text-xs text-primary">
              Save 20%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn(
              'relative flex flex-col h-full',
              plan.popular && 'lg:-mt-4 lg:mb-4 z-10',
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 text-sm shadow-lg">
                  Most Popular
                </Badge>
              </div>
            )}
            <Card
              className={cn(
                'flex flex-col h-full transition-all duration-200',
                plan.popular
                  ? 'border-primary shadow-lg ring-1 ring-primary/20'
                  : 'hover:border-primary/50 hover:shadow-md',
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      plan.popular
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <plan.icon className="h-5 w-5" />
                  </div>
                  {plan.current && (
                    <Badge variant="secondary" className="font-medium">
                      Current
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {isAnnual ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {isAnnual && plan.id === 'pro' && (
                    <p className="text-xs text-muted-foreground">
                      Billed $144 yearly
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">
                    Includes:
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant={plan.buttonVariant}
                  className={cn(
                    'w-full',
                    plan.popular &&
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                  disabled={
                    plan.current ||
                    (plan.id === 'pro' && checkoutMutation.isPending)
                  }
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.id === 'pro' && checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plan.current ? (
                    'Current Plan'
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-8">
        {/* Payment Method Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment details</CardDescription>
              </div>
              <div className="rounded-full bg-muted p-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-muted p-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-medium">No payment method</div>
                  <div className="text-sm text-muted-foreground">
                    Add a card to upgrade your plan
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground flex gap-2">
              <Shield className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Your payment information is securely handled by Dodo Payments.
                We do not store your card details on our servers.
              </p>
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </CardFooter>
        </Card>

        {/* Billing History Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your recent invoices</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-3 mb-4">
                <AlertCircle className="h-6 w-6 opacity-50" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                No invoices found
              </h3>
              <p className="text-sm max-w-xs mx-auto">
                You haven't been billed yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
