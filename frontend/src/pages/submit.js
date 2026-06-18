import { api } from '@/lib/api'
import { buttonClass } from '@/components/ui/button'
import { createDropdownMenu } from '@/components/ui/dropdown-menu'
import {
  cardClass,
  cardContentClass,
  cardDescriptionClass,
  cardHeaderClass,
  cardTitleClass,
} from '@/components/ui/card'
import { fieldClass, inputClass, labelClass, textareaClass } from '@/components/ui/input'
import { setButtonLoading } from '@/components/ui/spinner'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

function createPriorityDropdown(hiddenInput) {
  let selected = hiddenInput.value || 'Medium'

  const dropdown = createDropdownMenu({
    triggerLabel: selected,
    triggerVariant: 'outline',
    triggerSize: 'default',
    fullWidth: true,
    align: 'start',
    groups: [
      {
        label: 'Priority',
        items: PRIORITY_OPTIONS.map((priority) => ({
          label: priority,
          onSelect: () => {
            selected = priority
            hiddenInput.value = priority
            dropdown.updateTriggerLabel(priority)
          },
        })),
      },
    ],
  })

  dropdown.querySelector('button').id = 'priority-trigger'

  return dropdown
}

export function renderSubmit(navigate) {
  const container = document.createElement('div')
  container.className = 'page-container max-w-5xl'

  container.innerHTML = `
    <div class="${cardClass()}">
      <div class="${cardHeaderClass('pb-4')}">
        <h1 class="${cardTitleClass()}">Submit a complaint</h1>
        <p class="${cardDescriptionClass()}">
          All submissions are encrypted. Save the token you receive — it is the only way to track your case.
        </p>
      </div>
      <form class="${cardContentClass('space-y-4')}" id="submit-form">
        <div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <div class="grid content-start gap-4">
            <div class="${fieldClass()}">
              <label class="${labelClass()}" for="title">Title</label>
              <input class="${inputClass()}" id="title" name="title" required placeholder="Brief summary" />
            </div>
            <div class="${fieldClass()}">
              <label class="${labelClass()}" for="department">Department</label>
              <input class="${inputClass()}" id="department" name="department" placeholder="e.g. HR, Facilities" />
            </div>
            <div class="${fieldClass()}">
              <label class="${labelClass()}" for="priority-trigger">Priority</label>
              <input type="hidden" id="priority" name="priority" value="Medium" />
              <div id="priority-dropdown"></div>
            </div>
          </div>
          <div class="${fieldClass('flex min-h-[12rem] flex-col')}">
            <label class="${labelClass()}" for="description">Description</label>
            <textarea class="${textareaClass('min-h-[12rem] flex-1 resize-y')}" id="description" name="description" required rows="6" placeholder="Describe the issue in detail"></textarea>
          </div>
        </div>
        <p id="submit-error" class="hidden text-sm text-destructive"></p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <button type="button" data-back class="${buttonClass({ variant: 'outline', className: 'w-full sm:w-auto' })}">Back</button>
          <button type="submit" class="${buttonClass({ className: 'w-full flex-1' })}">Submit complaint</button>
        </div>
      </form>
      <div id="submit-success" class="${cardContentClass('hidden space-y-3 border-t pt-6')}"></div>
    </div>
  `

  container.querySelector('[data-back]').addEventListener('click', () => navigate('home'))

  const form = container.querySelector('#submit-form')
  const errorEl = container.querySelector('#submit-error')
  const successEl = container.querySelector('#submit-success')
  const priorityInput = form.querySelector('#priority')

  form.querySelector('#priority-dropdown').appendChild(createPriorityDropdown(priorityInput))

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')

    const formData = new FormData(form)
    const submitButton = form.querySelector('[type="submit"]')
    setButtonLoading(submitButton, { loading: true, label: 'Submit complaint', loadingLabel: 'Submitting' })

    try {
      const result = await api.createComplaint({
        title: formData.get('title'),
        department: formData.get('department') || '',
        priority: formData.get('priority'),
        description: formData.get('description'),
      })

      form.classList.add('hidden')
      successEl.classList.remove('hidden')
      successEl.innerHTML = `
        <div class="grid gap-4 md:grid-cols-2 md:items-center">
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">Complaint submitted successfully.</p>
            <p class="text-sm text-muted-foreground">Store this token somewhere safe. You will need it to check status updates.</p>
          </div>
          <div class="rounded-lg border bg-muted/40 p-4">
            <p class="text-sm font-medium">Your tracking token</p>
            <p class="mt-1 font-mono text-3xl font-bold tracking-widest sm:text-2xl">${result.token}</p>
          </div>
        </div>
        <button type="button" data-track class="${buttonClass({ className: 'w-full sm:w-auto' })}">Track this complaint</button>
      `

      successEl.querySelector('[data-track]').addEventListener('click', () => {
        navigate('track', { token: result.token })
      })
    } catch (error) {
      errorEl.textContent = error.message
      errorEl.classList.remove('hidden')
    } finally {
      setButtonLoading(submitButton, { loading: false, label: 'Submit complaint' })
    }
  })

  return container
}
