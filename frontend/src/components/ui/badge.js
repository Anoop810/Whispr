import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { spinnerHtml } from '@/components/ui/spinner'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function badgeClass({ variant, className } = {}) {
  return cn(badgeVariants({ variant }), className)
}

export function statusBadgeClass(status) {
  if (status === 'Resolved') return badgeClass({ variant: 'secondary' })
  if (status === 'Issue Escalated') return badgeClass({ variant: 'destructive' })
  if (status === 'In Review') return badgeClass({ variant: 'default' })
  if (status === 'Pending') return badgeClass({ variant: 'outline' })
  return badgeClass()
}

export const COMPLAINT_STATUSES = ['Pending', 'In Review', 'Issue Escalated', 'Resolved']

export const ACTIVE_STATUS_OPTIONS = ['Pending', 'In Review', 'Issue Escalated']

export function priorityBadgeClass(priority) {
  if (priority === 'High') return badgeClass({ variant: 'destructive' })
  if (priority === 'Low') return badgeClass({ variant: 'secondary' })
  return badgeClass({ variant: 'outline' })
}

export function spinnerBadgeHtml({ variant = 'outline', label = 'Loading' } = {}) {
  return `<span class="${badgeClass({ variant })}">${spinnerHtml({ className: 'size-3', attrs: 'data-icon="inline-start"' })}${label}</span>`
}
