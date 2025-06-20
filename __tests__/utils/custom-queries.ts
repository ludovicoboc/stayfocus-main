import { queryHelpers, buildQueries, Matcher, MatcherOptions } from '@testing-library/react'

// Query customizada para encontrar elementos por data-testid com prefixo
const queryAllByTestIdPrefix = (
  container: HTMLElement,
  prefix: Matcher,
  options?: MatcherOptions
) => {
  return queryHelpers.queryAllByAttribute(
    'data-testid',
    container,
    (content, element) => {
      if (typeof prefix === 'string') {
        return content?.startsWith(prefix) || false
      }
      return false
    },
    options
  )
}

const getMultipleError = (container: HTMLElement, prefix: string) =>
  `Found multiple elements with data-testid starting with: ${prefix}`

const getMissingError = (container: HTMLElement, prefix: string) =>
  `Unable to find an element with data-testid starting with: ${prefix}`

const [
  queryByTestIdPrefix,
  getAllByTestIdPrefix,
  getByTestIdPrefix,
  findAllByTestIdPrefix,
  findByTestIdPrefix,
] = buildQueries(queryAllByTestIdPrefix, getMultipleError, getMissingError)

// Query customizada para encontrar botões por texto e estado
const queryAllByButtonText = (
  container: HTMLElement,
  text: Matcher,
  options?: MatcherOptions & { disabled?: boolean }
) => {
  const buttons = container.querySelectorAll('button')
  return Array.from(buttons).filter(button => {
    const textMatch = typeof text === 'string' 
      ? button.textContent?.includes(text)
      : text instanceof RegExp
      ? text.test(button.textContent || '')
      : false
    
    if (options?.disabled !== undefined) {
      return textMatch && button.disabled === options.disabled
    }
    
    return textMatch
  })
}

const getButtonMultipleError = (container: HTMLElement, text: string) =>
  `Found multiple buttons with text: ${text}`

const getButtonMissingError = (container: HTMLElement, text: string) =>
  `Unable to find a button with text: ${text}`

const [
  queryByButtonText,
  getAllByButtonText,
  getByButtonText,
  findAllByButtonText,
  findByButtonText,
] = buildQueries(queryAllByButtonText, getButtonMultipleError, getButtonMissingError)

// Query customizada para encontrar elementos com classes específicas
const queryAllByClassName = (
  container: HTMLElement,
  className: string,
  options?: MatcherOptions
) => {
  return container.querySelectorAll(`.${className}`)
}

const getClassMultipleError = (container: HTMLElement, className: string) =>
  `Found multiple elements with class: ${className}`

const getClassMissingError = (container: HTMLElement, className: string) =>
  `Unable to find an element with class: ${className}`

const [
  queryByClassName,
  getAllByClassName,
  getByClassName,
  findAllByClassName,
  findByClassName,
] = buildQueries(queryAllByClassName, getClassMultipleError, getClassMissingError)

// Query customizada para encontrar elementos de loading/skeleton
const queryAllByLoadingState = (container: HTMLElement) => {
  const loadingSelectors = [
    '[data-testid*="loading"]',
    '[data-testid*="skeleton"]',
    '.animate-pulse',
    '.animate-spin',
    '[aria-label*="loading"]',
    '[aria-label*="carregando"]',
  ]
  
  const elements: Element[] = []
  loadingSelectors.forEach(selector => {
    elements.push(...Array.from(container.querySelectorAll(selector)))
  })
  
  return elements
}

const getLoadingMultipleError = (container: HTMLElement) =>
  `Found multiple loading elements`

const getLoadingMissingError = (container: HTMLElement) =>
  `Unable to find any loading elements`

const [
  queryByLoadingState,
  getAllByLoadingState,
  getByLoadingState,
  findAllByLoadingState,
  findByLoadingState,
] = buildQueries(queryAllByLoadingState, getLoadingMultipleError, getLoadingMissingError)

// Query customizada para encontrar elementos de erro
const queryAllByErrorState = (container: HTMLElement) => {
  const errorSelectors = [
    '[data-testid*="error"]',
    '[role="alert"]',
    '.text-red-500',
    '.text-red-600',
    '.text-red-700',
    '.bg-red-50',
    '.bg-red-100',
    '[aria-label*="error"]',
    '[aria-label*="erro"]',
  ]
  
  const elements: Element[] = []
  errorSelectors.forEach(selector => {
    elements.push(...Array.from(container.querySelectorAll(selector)))
  })
  
  return elements
}

const getErrorMultipleError = (container: HTMLElement) =>
  `Found multiple error elements`

const getErrorMissingError = (container: HTMLElement) =>
  `Unable to find any error elements`

const [
  queryByErrorState,
  getAllByErrorState,
  getByErrorState,
  findAllByErrorState,
  findByErrorState,
] = buildQueries(queryAllByErrorState, getErrorMultipleError, getErrorMissingError)

// Query customizada para encontrar elementos de formulário por label
const queryAllByFormField = (
  container: HTMLElement,
  labelText: Matcher,
  options?: MatcherOptions
) => {
  const labels = container.querySelectorAll('label')
  const fields: Element[] = []
  
  Array.from(labels).forEach(label => {
    const textMatch = typeof labelText === 'string'
      ? label.textContent?.includes(labelText)
      : labelText instanceof RegExp
      ? labelText.test(label.textContent || '')
      : false
    
    if (textMatch) {
      const forAttr = label.getAttribute('for')
      if (forAttr) {
        const field = container.querySelector(`#${forAttr}`)
        if (field) fields.push(field)
      } else {
        const field = label.querySelector('input, select, textarea')
        if (field) fields.push(field)
      }
    }
  })
  
  return fields
}

const getFormFieldMultipleError = (container: HTMLElement, labelText: string) =>
  `Found multiple form fields with label: ${labelText}`

const getFormFieldMissingError = (container: HTMLElement, labelText: string) =>
  `Unable to find a form field with label: ${labelText}`

const [
  queryByFormField,
  getAllByFormField,
  getByFormField,
  findAllByFormField,
  findByFormField,
] = buildQueries(queryAllByFormField, getFormFieldMultipleError, getFormFieldMissingError)

// Exportar todas as queries customizadas
export const customQueries = {
  // Queries por prefixo de test-id
  queryByTestIdPrefix,
  queryAllByTestIdPrefix,
  getByTestIdPrefix,
  getAllByTestIdPrefix,
  findByTestIdPrefix,
  findAllByTestIdPrefix,
  
  // Queries por texto de botão
  queryByButtonText,
  queryAllByButtonText,
  getByButtonText,
  getAllByButtonText,
  findByButtonText,
  findAllByButtonText,
  
  // Queries por classe CSS
  queryByClassName,
  queryAllByClassName,
  getByClassName,
  getAllByClassName,
  findByClassName,
  findAllByClassName,
  
  // Queries para estados de loading
  queryByLoadingState,
  queryAllByLoadingState,
  getByLoadingState,
  getAllByLoadingState,
  findByLoadingState,
  findAllByLoadingState,
  
  // Queries para estados de erro
  queryByErrorState,
  queryAllByErrorState,
  getByErrorState,
  getAllByErrorState,
  findByErrorState,
  findAllByErrorState,
  
  // Queries para campos de formulário
  queryByFormField,
  queryAllByFormField,
  getByFormField,
  getAllByFormField,
  findByFormField,
  findAllByFormField,
}

export type CustomQueries = typeof customQueries
