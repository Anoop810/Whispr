import { logoHtml } from '@/components/brand'
import { api } from '@/lib/api'
import { buttonClass } from '@/components/ui/button'
import {
  ACTIVE_STATUS_OPTIONS,
  priorityBadgeClass,
  spinnerBadgeHtml,
  statusBadgeClass,
} from '@/components/ui/badge'
import {
  cardClass,
  cardContentClass,
  cardDescriptionClass,
  cardHeaderClass,
  cardTitleClass,
} from '@/components/ui/card'
import { inputClass, labelClass, textareaClass, fieldClass } from '@/components/ui/input'
import { setButtonLoading } from '@/components/ui/spinner'
import { createDropdownMenu } from '@/components/ui/dropdown-menu'

const ADMIN_KEY = 'whispr_admin'

export function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function renderAdmin(navigate) {
  const container = document.createElement('div')
  container.className = 'page-container max-w-6xl'

  if (!isAdminLoggedIn()) {
    container.appendChild(renderLoginForm(navigate))
    return container
  }

  container.appendChild(renderDashboard(navigate))
  return container
}

function renderLoginForm(navigate) {
  const wrapper = document.createElement('div')
  wrapper.className = 'mx-auto w-full max-w-3xl'
  wrapper.innerHTML = `
    <div class="${cardClass()}">
      <div class="${cardHeaderClass('items-center pb-4 text-center md:text-left')}">
        <div class="mb-2 flex justify-center md:justify-start">
          ${logoHtml({ height: 'h-10' })}
        </div>
        <h1 class="${cardTitleClass()}">Admin login</h1>
        <p class="${cardDescriptionClass()}">Sign in with your staff credentials to manage complaints.</p>
      </div>
      <form class="${cardContentClass('space-y-4')}" id="admin-login-form">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div class="${fieldClass()}">
            <label class="${labelClass()}" for="username">Username</label>
            <input class="${inputClass()}" id="username" name="username" required autocomplete="username" />
          </div>
          <div class="${fieldClass()}">
            <label class="${labelClass()}" for="password">Password</label>
            <input class="${inputClass()}" id="password" name="password" type="password" required autocomplete="current-password" />
          </div>
        </div>
        <p id="login-error" class="hidden text-sm text-destructive"></p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <button type="button" data-back class="${buttonClass({ variant: 'outline', className: 'w-full sm:w-auto' })}">Back</button>
          <button type="submit" class="${buttonClass({ className: 'w-full flex-1' })}">Sign in</button>
        </div>
      </form>
    </div>
  `

  wrapper.querySelector('[data-back]').addEventListener('click', () => navigate('home'))

  const form = wrapper.querySelector('#admin-login-form')
  const errorEl = wrapper.querySelector('#login-error')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')

    const formData = new FormData(form)
    const submitButton = form.querySelector('[type="submit"]')
    setButtonLoading(submitButton, { loading: true, label: 'Sign in', loadingLabel: 'Signing in' })

    try {
      await api.adminLogin(formData.get('username'), formData.get('password'))
      sessionStorage.setItem(ADMIN_KEY, 'true')
      navigate('admin')
    } catch (error) {
      const isNetworkError = error.message === 'Request failed' || error.message.includes('fetch')
      errorEl.textContent = isNetworkError
        ? 'Cannot reach the server. Make sure Django is running on port 8000.'
        : 'Invalid credentials or insufficient permissions.'
      errorEl.classList.remove('hidden')
    } finally {
      setButtonLoading(submitButton, { loading: false, label: 'Sign in' })
    }
  })

  return wrapper
}

function renderDashboard(navigate) {
  const wrapper = document.createElement('div')
  wrapper.className = 'space-y-6'
  wrapper.dataset.adminView = 'active'

  wrapper.innerHTML = `
    <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Admin dashboard</h1>
        <p class="text-sm text-muted-foreground sm:text-base">Manage complaint status, feedback, and resolution</p>
      </div>
      <div id="admin-actions" class="w-full sm:w-auto"></div>
    </div>

    <div class="flex gap-2 overflow-x-auto border-b pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button type="button" data-tab="active" class="${buttonClass({ variant: 'default', size: 'default', className: 'shrink-0' })}">Active</button>
      <button type="button" data-tab="resolved" class="${buttonClass({ variant: 'ghost', size: 'default', className: 'shrink-0' })}">Resolved</button>
    </div>

    <p id="admin-success" class="hidden text-sm text-muted-foreground"></p>
    <p id="admin-error" class="hidden text-sm text-destructive"></p>
    <div id="complaints-list" class="min-h-48 space-y-4">
      <div class="flex min-h-48 items-center justify-center">
        ${spinnerBadgeHtml({ variant: 'secondary', label: 'Loading complaints' })}
      </div>
    </div>
  `

  wrapper.querySelector('#admin-actions').appendChild(
    createDropdownMenu({
      triggerLabel: 'Actions',
      triggerVariant: 'outline',
      triggerSize: 'default',
      fullWidth: true,
      align: 'end',
      width: 'w-44',
      groups: [
        {
          label: 'Dashboard',
          items: [
            { label: 'Home', onSelect: () => navigate('home') },
            { label: 'Active tickets', onSelect: () => switchTab(wrapper, 'active') },
            { label: 'Resolved tickets', onSelect: () => switchTab(wrapper, 'resolved') },
          ],
        },
        {
          items: [
            {
              label: 'Sign out',
              onSelect: () => {
                sessionStorage.removeItem(ADMIN_KEY)
                navigate('admin')
              },
            },
          ],
        },
      ],
    }),
  )

  wrapper.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(wrapper, tab.dataset.tab))
  })

  loadComplaints(wrapper)
  return wrapper
}

function switchTab(wrapper, view) {
  wrapper.dataset.adminView = view
  wrapper.querySelectorAll('[data-tab]').forEach((btn) => {
    const isActive = btn.dataset.tab === view
    btn.className = buttonClass({
      variant: isActive ? 'default' : 'ghost',
      size: 'default',
      className: 'shrink-0',
    })
  })
  loadComplaints(wrapper)
}

function getFeedbackValue(wrapper, id) {
  return wrapper.querySelector(`[data-feedback-input="${id}"]`)?.value ?? ''
}

function showSuccess(wrapper, message) {
  const successEl = wrapper.querySelector('#admin-success')
  const errorEl = wrapper.querySelector('#admin-error')
  errorEl.classList.add('hidden')
  successEl.textContent = message
  successEl.classList.remove('hidden')
  setTimeout(() => successEl.classList.add('hidden'), 3000)
}

function showError(wrapper, message) {
  const errorEl = wrapper.querySelector('#admin-error')
  const successEl = wrapper.querySelector('#admin-success')
  successEl.classList.add('hidden')
  errorEl.textContent = message
  errorEl.classList.remove('hidden')
}

async function loadComplaints(wrapper) {
  const listEl = wrapper.querySelector('#complaints-list')
  const view = wrapper.dataset.adminView || 'active'
  const isResolvedView = view === 'resolved'

  listEl.innerHTML = `
    <div class="flex min-h-48 items-center justify-center">
      ${spinnerBadgeHtml({ variant: 'secondary', label: 'Loading complaints' })}
    </div>
  `

  try {
    const complaints = isResolvedView
      ? await api.listResolvedComplaints()
      : await api.listActiveComplaints()

    if (complaints.length === 0) {
      listEl.innerHTML = `
        <div class="${cardClass('p-8 text-center')}">
          <p class="text-muted-foreground">${
            isResolvedView
              ? 'No resolved complaints yet.'
              : 'No active complaints. Check the Resolved tab for closed cases.'
          }</p>
        </div>
      `
      return
    }

    listEl.innerHTML = complaints
      .map((complaint) => complaintCard(complaint, { resolved: isResolvedView }))
      .join('')

    if (!isResolvedView) {
      complaints.forEach((complaint) => {
        const mount = listEl.querySelector(`[data-status-dropdown="${complaint.id}"]`)
        if (mount) {
          mount.appendChild(createStatusDropdown(wrapper, complaint))
        }
      })
      bindActiveCardActions(wrapper, listEl)
    }
  } catch (error) {
    listEl.innerHTML = ''
    showError(wrapper, error.message)
  }
}

function bindActiveCardActions(wrapper, listEl) {
  listEl.querySelectorAll('[data-save-feedback]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.saveFeedback
      const feedback = getFeedbackValue(wrapper, id)

      if (!feedback.trim()) {
        showError(wrapper, 'Please enter feedback before saving.')
        return
      }

      setButtonLoading(button, { loading: true, label: 'Save feedback', loadingLabel: 'Saving' })

      try {
        await api.saveFeedback(id, feedback)
        showSuccess(wrapper, `Feedback saved for complaint #${id}.`)
        await loadComplaints(wrapper)
      } catch (error) {
        showError(wrapper, error.message)
        setButtonLoading(button, { loading: false, label: 'Save feedback' })
      }
    })
  })
}

async function updateComplaintStatus(wrapper, id, newStatus) {
  const feedback = getFeedbackValue(wrapper, id)

  try {
    await api.updateComplaintStatus(id, newStatus, feedback)
    showSuccess(wrapper, `Complaint #${id} marked as "${newStatus}".`)
    await loadComplaints(wrapper)
  } catch (error) {
    showError(wrapper, error.message)
  }
}

function createStatusDropdown(wrapper, complaint) {
  const statusOptions = [...ACTIVE_STATUS_OPTIONS, 'Resolved']

  return createDropdownMenu({
    triggerLabel: 'Update status',
    triggerVariant: 'outline',
    triggerSize: 'default',
    fullWidth: true,
    align: 'start',
    width: 'w-48',
    groups: [
      {
        label: 'Status',
        items: statusOptions.map((status) => ({
          label: status,
          disabled: complaint.status === status,
          shortcut: complaint.status === status ? '✓' : '',
          onSelect: () => updateComplaintStatus(wrapper, complaint.id, status),
        })),
      },
    ],
  })
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function statusDropdownMount(complaint) {
  return `<div data-status-dropdown="${complaint.id}"></div>`
}

function complaintCard(complaint, { resolved = false } = {}) {
  const date = new Date(complaint.submission_date).toLocaleString()
  const existingFeedback = complaint.feedback
    ? `<div class="rounded-lg border bg-muted/40 p-3 text-sm">
         <p class="font-medium">Admin feedback</p>
         <p class="mt-1 whitespace-pre-wrap text-muted-foreground">${escapeHtml(complaint.feedback)}</p>
       </div>`
    : ''

  const feedbackSection = resolved
    ? existingFeedback || '<p class="text-sm text-muted-foreground">No feedback was recorded.</p>'
    : `
        <div class="space-y-3 rounded-lg border p-4">
          <label class="${labelClass()}" for="feedback-${complaint.id}">Admin feedback</label>
          <p class="text-xs text-muted-foreground">Visible to the submitter when they track their complaint.</p>
          <textarea
            id="feedback-${complaint.id}"
            data-feedback-input="${complaint.id}"
            class="${textareaClass()}"
            rows="3"
            placeholder="e.g. Issue has been escalated to facilities. Expected resolution by Friday."
          >${complaint.feedback ? escapeHtml(complaint.feedback) : ''}</textarea>
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" data-save-feedback="${complaint.id}" class="${buttonClass({ variant: 'outline', size: 'default', className: 'w-full sm:w-auto' })}">
              Save feedback
            </button>
          </div>
        </div>
      `

  const statusSection = resolved
    ? `<span class="${statusBadgeClass(complaint.status)}">${complaint.status}</span>`
    : `
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">Update status</p>
          ${statusDropdownMount(complaint)}
        </div>
      `

  return `
    <div class="${cardClass()}">
      <div class="${cardHeaderClass('pb-3')}">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold">${escapeHtml(complaint.title)}</h2>
              <span class="${statusBadgeClass(complaint.status)}">${complaint.status}</span>
            </div>
            <p class="text-sm text-muted-foreground">#${complaint.id} · ${date}</p>
          </div>
          <span class="${priorityBadgeClass(complaint.priority)}">${complaint.priority}</span>
        </div>
      </div>
      <div class="${cardContentClass('space-y-4')}">
        ${complaint.department ? `<p class="text-sm"><span class="text-muted-foreground">Department:</span> ${escapeHtml(complaint.department)}</p>` : ''}
        <p class="whitespace-pre-wrap text-sm">${escapeHtml(complaint.description)}</p>
        <p class="font-mono text-xs text-muted-foreground">Token: ${complaint.token}</p>
        ${resolved ? '' : statusSection}
        ${feedbackSection}
      </div>
    </div>
  `
}
