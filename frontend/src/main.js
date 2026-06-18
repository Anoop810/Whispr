import './style.css'
import { buttonClass } from '@/components/ui/button'
import { createDropdownMenu } from '@/components/ui/dropdown-menu'
import { logoHtml } from '@/components/brand'
import { renderHome } from '@/pages/home'
import { renderSubmit } from '@/pages/submit'
import { renderTrack } from '@/pages/track'
import { renderAdmin, isAdminLoggedIn, clearAdminSession } from '@/pages/admin'

const routes = {
  home: renderHome,
  submit: renderSubmit,
  track: renderTrack,
  admin: renderAdmin,
}

let routeParams = {}
let mainEl = null
let headerMenuEl = null
let lastAdminLoggedIn = null

function navigate(route, params = {}) {
  routeParams = params
  const nextHash = route === 'home' ? '' : `#${route}`

  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash
  } else {
    renderPage()
  }
}

function buildHeaderMenu(navigate) {
  const menuGroups = [
    {
      label: 'Navigate',
      items: [
        { label: 'Submit complaint', onSelect: () => navigate('submit') },
        { label: 'Track complaint', onSelect: () => navigate('track') },
        { label: 'Admin', onSelect: () => navigate('admin') },
      ],
    },
  ]

  if (isAdminLoggedIn()) {
    menuGroups.push({
      items: [
        {
          label: 'Sign out',
          onSelect: () => {
            clearAdminSession()
            navigate('home')
          },
        },
      ],
    })
  }

  return createDropdownMenu({
    triggerLabel: 'Menu',
    triggerVariant: 'outline',
    triggerSize: 'default',
    align: 'end',
    width: 'w-52',
    groups: menuGroups,
  })
}

function ensureShell(navigate) {
  const app = document.querySelector('#app')
  if (mainEl) return

  app.innerHTML = `
    <div class="flex min-h-svh flex-col">
      <header class="app-header shrink-0 border-b">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-8">
          <button type="button" data-brand class="${buttonClass({ variant: 'ghost', className: 'h-11 min-h-11 shrink-0 px-1 sm:h-14 sm:min-h-0' })}">
            ${logoHtml({ height: 'h-9 sm:h-12' })}
          </button>
          <div id="header-menu" class="shrink-0"></div>
        </div>
      </header>
      <main id="page-main" class="page-main flex-1"></main>
      <footer class="app-footer shrink-0 border-t">
        <div class="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground sm:px-8">
          Developed by Anoop Sonawane
        </div>
      </footer>
    </div>
  `

  mainEl = app.querySelector('#page-main')
  headerMenuEl = app.querySelector('#header-menu')

  app.querySelector('[data-brand]').addEventListener('click', () => navigate('home'))
}

function updateHeaderMenu(navigate) {
  const adminLoggedIn = isAdminLoggedIn()
  if (adminLoggedIn === lastAdminLoggedIn && headerMenuEl.childElementCount > 0) return

  lastAdminLoggedIn = adminLoggedIn
  headerMenuEl.replaceChildren(buildHeaderMenu(navigate))
}

function renderPage() {
  ensureShell(navigate)
  updateHeaderMenu(navigate)

  const route = window.location.hash.replace('#', '') || 'home'
  const renderPageFn = routes[route] || routes.home

  mainEl.replaceChildren(renderPageFn(navigate, routeParams))
  routeParams = {}
}

window.addEventListener('hashchange', renderPage)
renderPage()
