import { cn } from '@/lib/utils'

export function cardClass(className) {
  return cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)
}

export function cardHeaderClass(className) {
  return cn('flex flex-col space-y-1.5 p-6', className)
}

export function cardTitleClass(className) {
  return cn('text-2xl font-semibold leading-none tracking-tight', className)
}

export function cardDescriptionClass(className) {
  return cn('text-sm text-muted-foreground', className)
}

export function cardContentClass(className) {
  return cn('p-6 pt-0', className)
}

export function cardFooterClass(className) {
  return cn('flex items-center p-6 pt-0', className)
}
