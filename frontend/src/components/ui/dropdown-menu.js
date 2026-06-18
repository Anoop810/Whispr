import { cn } from '@/lib/utils'
import { buttonClass } from '@/components/ui/button'

let openDropdown = null

export function dropdownContentClass(className) {
  return cn(
    'absolute z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
    className,
  )
}

export function dropdownItemClass({ disabled = false, className } = {}) {
  return cn(
    'relative flex min-h-11 w-full cursor-pointer select-none items-center rounded-sm px-3 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground sm:min-h-0 sm:px-2 sm:py-1.5',
    disabled && 'pointer-events-none opacity-50',
    className,
  )
}

export function dropdownLabelClass(className) {
  return cn('px-2 py-1.5 text-sm font-semibold', className)
}

export function dropdownSeparatorClass() {
  return 'bg-border -mx-1 my-1 h-px'
}

export function dropdownShortcutClass() {
  return 'ml-auto text-xs tracking-widest opacity-60'
}

function closeOpenDropdown() {
  if (!openDropdown) return
  openDropdown.content.classList.add('hidden')
  openDropdown.trigger.setAttribute('aria-expanded', 'false')
  openDropdown = null
}

function handleDocumentClick(event) {
  if (!openDropdown) return
  if (openDropdown.root.contains(event.target)) return
  closeOpenDropdown()
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') closeOpenDropdown()
}

document.addEventListener('click', handleDocumentClick)
document.addEventListener('keydown', handleDocumentKeydown)

/**
 * @param {{
 *   triggerLabel: string,
 *   triggerVariant?: string,
 *   triggerSize?: string,
 *   fullWidth?: boolean,
 *   align?: 'start' | 'end',
 *   width?: string,
 *   groups: Array<{
 *     label?: string,
 *     items: Array<{
 *       label: string,
 *       shortcut?: string,
 *       disabled?: boolean,
 *       onSelect?: () => void,
 *     }>,
 *   }>,
 * }} config
 */
export function createDropdownMenu(config) {
  const {
    triggerLabel,
    triggerVariant = 'outline',
    triggerSize = 'sm',
    fullWidth = false,
    align = 'start',
    width = 'w-48',
    groups,
  } = config

  const root = document.createElement('div')
  root.className = fullWidth ? 'relative w-full text-left' : 'relative inline-block text-left'
  root.dataset.dropdownRoot = 'true'

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = buttonClass({
    variant: triggerVariant,
    size: triggerSize,
    className: fullWidth ? 'w-full justify-between font-normal' : '',
  })
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-haspopup', 'menu')

  function renderTriggerLabel(label) {
    trigger.innerHTML = `${label}<span class="ml-1 opacity-60" aria-hidden="true">▾</span>`
  }

  renderTriggerLabel(triggerLabel)

  const content = document.createElement('div')
  content.className = dropdownContentClass(
    cn(
      fullWidth ? 'w-full min-w-full' : width,
      'top-full mt-1 hidden',
      align === 'end' ? 'right-0' : 'left-0',
    ),
  )
  content.setAttribute('role', 'menu')

  groups.forEach((group, groupIndex) => {
    if (group.label) {
      const label = document.createElement('div')
      label.className = dropdownLabelClass()
      label.textContent = group.label
      content.appendChild(label)
    }

    const groupEl = document.createElement('div')
    groupEl.setAttribute('role', 'group')

    group.items.forEach((item) => {
      const itemEl = document.createElement('button')
      itemEl.type = 'button'
      itemEl.className = dropdownItemClass({ disabled: item.disabled })
      itemEl.setAttribute('role', 'menuitem')
      itemEl.disabled = Boolean(item.disabled)
      itemEl.innerHTML = `
        <span>${item.label}</span>
        ${item.shortcut ? `<span class="${dropdownShortcutClass()}">${item.shortcut}</span>` : ''}
      `

      if (!item.disabled && item.onSelect) {
        itemEl.addEventListener('click', (event) => {
          event.stopPropagation()
          closeOpenDropdown()
          item.onSelect()
        })
      }

      groupEl.appendChild(itemEl)
    })

    content.appendChild(groupEl)

    if (groupIndex < groups.length - 1) {
      const separator = document.createElement('div')
      separator.className = dropdownSeparatorClass()
      separator.setAttribute('role', 'separator')
      content.appendChild(separator)
    }
  })

  trigger.addEventListener('click', (event) => {
    event.stopPropagation()
    if (openDropdown?.root === root) {
      closeOpenDropdown()
      return
    }
    closeOpenDropdown()
    content.classList.remove('hidden')
    trigger.setAttribute('aria-expanded', 'true')
    openDropdown = { root, trigger, content }
  })

  root.appendChild(trigger)
  root.appendChild(content)

  root.updateTriggerLabel = renderTriggerLabel

  return root
}

export function closeAllDropdowns() {
  closeOpenDropdown()
}
