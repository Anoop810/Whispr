import { buttonClass } from '@/components/ui/button'
import { fieldClass, inputClass, labelClass } from '@/components/ui/input'

const eyeOpenSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
`

const eyeClosedSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
`

function bindPasswordToggle(field) {
  const input = field.querySelector('input')
  const toggle = field.querySelector('[data-password-toggle]')

  toggle.addEventListener('click', () => {
    const show = input.type === 'password'
    input.type = show ? 'text' : 'password'
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password')
    toggle.setAttribute('aria-pressed', String(show))
    toggle.innerHTML = show ? eyeClosedSvg : eyeOpenSvg
  })
}

export function createPasswordField({
  id,
  name,
  label = 'Password',
  required = false,
  autocomplete = 'current-password',
  className,
} = {}) {
  const field = document.createElement('div')
  field.className = fieldClass(className)
  field.innerHTML = `
    <label class="${labelClass()}" for="${id}">${label}</label>
    <div class="relative">
      <input
        class="${inputClass('pr-11')}"
        id="${id}"
        name="${name}"
        type="password"
        ${required ? 'required' : ''}
        autocomplete="${autocomplete}"
      />
      <button
        type="button"
        data-password-toggle
        class="${buttonClass({
          variant: 'ghost',
          size: 'sm',
          className: 'absolute top-1/2 right-1 h-9 min-h-9 w-9 -translate-y-1/2 px-0 text-muted-foreground hover:text-foreground sm:h-8 sm:min-h-8 sm:w-8',
        })}"
        aria-label="Show password"
        aria-pressed="false"
      >
        ${eyeOpenSvg}
      </button>
    </div>
  `

  bindPasswordToggle(field)
  return field
}

export function passwordFieldHtml({
  id,
  name,
  label = 'Password',
  required = false,
  autocomplete = 'current-password',
  className,
} = {}) {
  return `
    <div class="${fieldClass(className)}" data-password-field>
      <label class="${labelClass()}" for="${id}">${label}</label>
      <div class="relative">
        <input
          class="${inputClass('pr-11')}"
          id="${id}"
          name="${name}"
          type="password"
          ${required ? 'required' : ''}
          autocomplete="${autocomplete}"
        />
        <button
          type="button"
          data-password-toggle
          class="${buttonClass({
            variant: 'ghost',
            size: 'sm',
            className: 'absolute top-1/2 right-1 h-9 min-h-9 w-9 -translate-y-1/2 px-0 text-muted-foreground hover:text-foreground sm:h-8 sm:min-h-8 sm:w-8',
          })}"
          aria-label="Show password"
          aria-pressed="false"
        >
          ${eyeOpenSvg}
        </button>
      </div>
    </div>
  `
}

export function initPasswordFields(root) {
  root.querySelectorAll('[data-password-field]').forEach(bindPasswordToggle)
}
