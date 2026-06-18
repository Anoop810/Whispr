export const LOGO_SRC = '/whispr-logo.png'

export function logoHtml({ height = 'h-8', className = '', alt = 'Whispr' } = {}) {
  return `<img src="${LOGO_SRC}" alt="${alt}" class="${height} w-auto object-contain ${className}" />`
}
