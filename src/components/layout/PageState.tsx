import type { HTMLAttributes, ReactNode } from 'react'
import type { PageContainerProps } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/layout/PageContainer'

interface PageStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  maxWidth?: PageContainerProps['maxWidth']
  align?: 'left' | 'center'
  contentClassName?: string
}

export function PageState({
  title,
  description,
  action,
  icon,
  maxWidth = 'sm',
  align = 'center',
  className,
  contentClassName,
  children,
}: PageStateProps) {
  const alignmentClasses =
    align === 'center' ? 'text-center space-y-4' : 'space-y-4'

  return (
    <PageContainer maxWidth={maxWidth} className={className}>
      <Card>
        <CardContent
          className={cn('py-12', alignmentClasses, contentClassName)}
        >
          <div className="space-y-3">
            {icon}
            {typeof title === 'string' ? (
              <h2 className="text-2xl font-semibold">{title}</h2>
            ) : (
              title
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {children}
          {action}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
