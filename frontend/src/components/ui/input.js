import { cn } from '@/lib/utils'

export function inputClass(className) {
  return cn(
    'block h-11 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
    className,
  )
}

export function fieldClass(className) {
  return cn('grid gap-2', className)
}

export function labelClass(className) {
  return cn('block text-sm font-medium leading-none', className)
}

export function textareaClass(className) {
  return cn(
    'flex min-h-[5.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[5rem] sm:text-sm',
    className,
  )
}

export function selectClass(className) {
  return cn(
    'block h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )
}
