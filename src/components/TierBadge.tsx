import { Badge } from '@/components/ui/badge'
import { Crown, Users, Building2 } from 'lucide-react'
import type { SubscriptionTier } from '@/lib/subscription'

interface TierBadgeProps {
  tier: SubscriptionTier
  className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = {
    free: {
      label: 'Free',
      icon: null,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
    pro_team: {
      label: 'Pro Team',
      icon: <Users className="h-3 w-3 mr-1" />,
      variant: 'default' as const,
      className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    },
    business: {
      label: 'Business',
      icon: <Crown className="h-3 w-3 mr-1" />,
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
  }

  const tierConfig = config[tier]

  return (
    <Badge
      variant={tierConfig.variant}
      className={`flex items-center gap-1 ${tierConfig.className} ${className || ''}`}
    >
      {tierConfig.icon}
      {tierConfig.label}
    </Badge>
  )
}

