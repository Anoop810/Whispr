import { api } from '@/lib/api'
import { buttonClass } from '@/components/ui/button'
import { priorityBadgeClass, statusBadgeClass, spinnerBadgeHtml } from '@/components/ui/badge'
import {
  cardClass,
  cardContentClass,
  cardDescriptionClass,
  cardHeaderClass,
  cardTitleClass,
} from '@/components/ui/card'
import { fieldClass, inputClass, labelClass } from '@/components/ui/input'
import { setButtonLoading } from '@/components/ui/spinner'

export function renderTrack(navigate, params = {}) {
  const container = document.createElement('div')
  container.className = 'mx-auto w-full max-w-5xl px-6 py-6'

  container.innerHTML = `
    <div class="${cardClass()}">
      <div class="${cardHeaderClass('pb-4')}">
        <h1 class="${cardTitleClass()}">Track complaint</h1>
        <p class="${cardDescriptionClass()}">Enter the 6-character token you received when you submitted.</p>
      </div>
      <form class="${cardContentClass('space-y-4')}" id="track-form">
        <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
          <div class="${fieldClass()}">
            <label class="${labelClass()}" for="token">Tracking token</label>
            <input
              class="${inputClass('font-mono uppercase tracking-widest')}"
              id="token"
              name="token"
              required
              maxlength="6"
              placeholder="ABC123"
              value="${params.token || ''}"
            />
          </div>
          <div class="flex gap-3">
            <button type="button" data-back class="${buttonClass({ variant: 'outline' })}">Back</button>
            <button type="submit" class="${buttonClass()}">Look up</button>
          </div>
        </div>
        <p id="track-error" class="hidden text-sm text-destructive"></p>
      </form>
      <div id="track-result" class="${cardContentClass('hidden min-h-32 space-y-4 border-t pt-6')}"></div>
    </div>
  `

  container.querySelector('[data-back]').addEventListener('click', () => navigate('home'))

  const form = container.querySelector('#track-form')
  const errorEl = container.querySelector('#track-error')
  const resultEl = container.querySelector('#track-result')
  const submitButton = form.querySelector('[type="submit"]')

  async function lookup(token) {
    errorEl.classList.add('hidden')
    resultEl.classList.remove('hidden')
    resultEl.innerHTML = `
      <div class="flex min-h-24 items-center justify-center">
        ${spinnerBadgeHtml({ variant: 'outline', label: 'Looking up complaint' })}
      </div>
    `

    try {
      const complaint = await api.getComplaintByToken(token.trim().toUpperCase())
      resultEl.innerHTML = renderComplaintDetails(complaint)
    } catch (error) {
      resultEl.classList.add('hidden')
      errorEl.textContent = error.message
      errorEl.classList.remove('hidden')
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const token = new FormData(form).get('token')
    setButtonLoading(submitButton, { loading: true, label: 'Look up', loadingLabel: 'Looking up' })
    await lookup(token)
    setButtonLoading(submitButton, { loading: false, label: 'Look up' })
  })

  if (params.token) {
    lookup(params.token)
  }

  return container
}

function renderComplaintDetails(complaint) {
  const date = new Date(complaint.submission_date).toLocaleString()

  return `
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-3">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold">${complaint.title}</h2>
          <div class="flex flex-wrap gap-2">
            <span class="${statusBadgeClass(complaint.status)}">${complaint.status}</span>
            <span class="${priorityBadgeClass(complaint.priority)}">${complaint.priority} priority</span>
          </div>
        </div>
        <dl class="grid gap-3 text-sm">
          <div>
            <dt class="text-muted-foreground">Submitted</dt>
            <dd>${date}</dd>
          </div>
          ${complaint.department ? `
            <div>
              <dt class="text-muted-foreground">Department</dt>
              <dd>${complaint.department}</dd>
            </div>
          ` : ''}
        </dl>
      </div>
      <div class="space-y-3 text-sm">
        <div>
          <p class="text-muted-foreground">Description</p>
          <p class="mt-1 whitespace-pre-wrap">${complaint.description}</p>
        </div>
        ${complaint.feedback ? `
          <div class="rounded-lg border bg-muted/40 p-3">
            <p class="font-medium">Admin feedback</p>
            <p class="mt-1 whitespace-pre-wrap text-muted-foreground">${complaint.feedback}</p>
          </div>
        ` : `
          <p class="text-muted-foreground">No feedback yet. Check back later.</p>
        `}
      </div>
    </div>
  `
}
