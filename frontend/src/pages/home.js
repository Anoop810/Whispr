import { buttonClass } from '@/components/ui/button'
import {
  cardClass,
  cardContentClass,
  cardDescriptionClass,
  cardHeaderClass,
  cardTitleClass,
} from '@/components/ui/card'

export function renderHome(navigate) {
  const container = document.createElement('div')
  container.className = 'mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12'

  container.innerHTML = `
    <div class="space-y-4 text-center">
      <p class="text-base font-medium uppercase tracking-widest text-muted-foreground">Anonymous reporting</p>
      <p class="mx-auto max-w-2xl text-base text-muted-foreground">
        Submit concerns safely and track progress with a private token. Your identity stays protected.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      ${actionCard({
        title: 'Submit',
        description: 'File a new anonymous complaint with department and priority.',
        action: 'Submit complaint',
        route: 'submit',
      })}
      ${actionCard({
        title: 'Track',
        description: 'Use your 6-character token to check status and feedback.',
        action: 'Track complaint',
        route: 'track',
      })}
      ${actionCard({
        title: 'Admin',
        description: 'Staff dashboard to review and resolve pending complaints.',
        action: 'Admin login',
        route: 'admin',
      })}
    </div>
  `

  container.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.route))
  })

  return container
}

function actionCard({ title, description, action, route }) {
  return `
    <div class="${cardClass('flex flex-col')}">
      <div class="${cardHeaderClass()}">
        <h2 class="${cardTitleClass('text-lg')}">${title}</h2>
        <p class="${cardDescriptionClass()}">${description}</p>
      </div>
      <div class="${cardContentClass('mt-auto')}">
        <button type="button" data-route="${route}" class="${buttonClass({ className: 'w-full' })}">
          ${action}
        </button>
      </div>
    </div>
  `
}
