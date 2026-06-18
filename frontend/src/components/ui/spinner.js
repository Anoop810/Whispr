import { cn } from '@/lib/utils'

export function spinnerClass(className) {
  return cn('size-4 animate-spin', className)
}

/** shadcn-style LoaderIcon SVG */
export function spinnerHtml({ className = 'size-4', attrs = '' } = {}) {
  return `<svg role="status" aria-label="Loading" class="${spinnerClass(className)}" ${attrs} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>`
}

export function setButtonLoading(button, { loading, label, loadingLabel }) {
  if (loading) {
    if (!button.dataset.originalHtml) {
      button.dataset.originalHtml = button.innerHTML
      button.style.minWidth = `${button.offsetWidth}px`
    }
    button.disabled = true
    button.innerHTML = `${spinnerHtml({ className: 'size-4 shrink-0', attrs: 'data-icon="inline-start"' })}<span>${loadingLabel || label}</span>`
    return
  }

  button.disabled = false
  button.innerHTML = button.dataset.originalHtml || label
  button.style.minWidth = ''
  delete button.dataset.originalHtml
}
