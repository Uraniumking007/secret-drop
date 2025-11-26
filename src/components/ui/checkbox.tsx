import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center justify-center align-middle">
      <input
        type="checkbox"
        className={cn(
          'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-primary shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground',
          className,
        )}
        ref={ref}
        {...props}
      />
      <Check className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
    </div>
  )
})
Checkbox.displayName = 'Checkbox'

export { Checkbox }
