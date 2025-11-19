import { cn } from '@/lib/utils'

type MaxWidthPreset = 'sm' | 'md' | 'lg'
type MaxWidthOption = MaxWidthPreset | string

const maxWidthClassMap: Record<MaxWidthPreset, string> = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-7xl',
}

const isPreset = (value: MaxWidthOption): value is MaxWidthPreset =>
  value === 'sm' || value === 'md' || value === 'lg'

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: MaxWidthOption
}

export function PageContainer({
  maxWidth = 'lg',
  className,
  ...props
}: PageContainerProps) {
  const resolvedMaxWidth = isPreset(maxWidth)
    ? maxWidthClassMap[maxWidth]
    : maxWidth

  return (
    <div
      className={cn(
        'container mx-auto p-4 md:p-6',
        resolvedMaxWidth,
        className,
      )}
      {...props}
    />
  )
}
