import { waitFor, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Helper para aguardar que elementos de loading desapareçam
export const waitForLoadingToFinish = async (timeout = 5000) => {
  await waitFor(
    () => {
      const loadingElements = document.querySelectorAll(
        '[data-testid*="loading"], [data-testid*="skeleton"], .animate-pulse, .animate-spin'
      )
      expect(loadingElements).toHaveLength(0)
    },
    { timeout }
  )
}

// Helper para aguardar que elementos apareçam
export const waitForElementToAppear = async (selector: string, timeout = 5000) => {
  await waitFor(
    () => {
      const element = document.querySelector(selector)
      expect(element).toBeInTheDocument()
    },
    { timeout }
  )
}

// Helper para aguardar que elementos desapareçam
export const waitForElementToDisappear = async (selector: string, timeout = 5000) => {
  await waitFor(
    () => {
      const element = document.querySelector(selector)
      expect(element).not.toBeInTheDocument()
    },
    { timeout }
  )
}

// Helper para preencher formulários
export const fillForm = async (fields: Record<string, string>) => {
  const user = userEvent.setup()
  
  for (const [label, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(label, 'i'))
    await user.clear(field)
    await user.type(field, value)
  }
}

// Helper para submeter formulários
export const submitForm = async (buttonText = /submit|enviar|salvar|criar/i) => {
  const user = userEvent.setup()
  const submitButton = screen.getByRole('button', { name: buttonText })
  await user.click(submitButton)
}

// Helper para testar drag and drop
export const dragAndDrop = async (
  sourceSelector: string,
  targetSelector: string
) => {
  const source = document.querySelector(sourceSelector)
  const target = document.querySelector(targetSelector)
  
  if (!source || !target) {
    throw new Error('Source or target element not found for drag and drop')
  }
  
  // Simular eventos de drag and drop
  fireEvent.dragStart(source)
  fireEvent.dragEnter(target)
  fireEvent.dragOver(target)
  fireEvent.drop(target)
  fireEvent.dragEnd(source)
}

// Helper para testar notificações/toasts
export const waitForNotification = async (
  message: string | RegExp,
  timeout = 3000
) => {
  await waitFor(
    () => {
      const notification = screen.getByText(message)
      expect(notification).toBeInTheDocument()
    },
    { timeout }
  )
}

// Helper para aguardar que notificações desapareçam
export const waitForNotificationToDisappear = async (
  message: string | RegExp,
  timeout = 5000
) => {
  await waitFor(
    () => {
      expect(screen.queryByText(message)).not.toBeInTheDocument()
    },
    { timeout }
  )
}

// Helper para testar modais
export const expectModalToBeOpen = () => {
  const modal = document.querySelector('[role="dialog"], .modal, [data-testid*="modal"]')
  expect(modal).toBeInTheDocument()
}

export const expectModalToBeClosed = () => {
  const modal = document.querySelector('[role="dialog"], .modal, [data-testid*="modal"]')
  expect(modal).not.toBeInTheDocument()
}

// Helper para fechar modais
export const closeModal = async () => {
  const user = userEvent.setup()
  
  // Tentar fechar por botão de fechar
  const closeButton = document.querySelector(
    '[aria-label*="close"], [aria-label*="fechar"], [data-testid*="close"]'
  )
  
  if (closeButton) {
    await user.click(closeButton as HTMLElement)
    return
  }
  
  // Tentar fechar por ESC
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
}

// Helper para testar estados de loading
export const expectLoadingState = () => {
  const loadingElement = document.querySelector(
    '[data-testid*="loading"], [data-testid*="skeleton"], .animate-pulse, .animate-spin'
  )
  expect(loadingElement).toBeInTheDocument()
}

export const expectNoLoadingState = () => {
  const loadingElement = document.querySelector(
    '[data-testid*="loading"], [data-testid*="skeleton"], .animate-pulse, .animate-spin'
  )
  expect(loadingElement).not.toBeInTheDocument()
}

// Helper para testar estados de erro
export const expectErrorState = (message?: string | RegExp) => {
  const errorElement = document.querySelector(
    '[data-testid*="error"], [role="alert"], .text-red-500, .text-red-600'
  )
  expect(errorElement).toBeInTheDocument()
  
  if (message) {
    expect(screen.getByText(message)).toBeInTheDocument()
  }
}

export const expectNoErrorState = () => {
  const errorElement = document.querySelector(
    '[data-testid*="error"], [role="alert"], .text-red-500, .text-red-600'
  )
  expect(errorElement).not.toBeInTheDocument()
}

// Helper para testar listas vazias
export const expectEmptyState = (message?: string | RegExp) => {
  const emptyElement = document.querySelector(
    '[data-testid*="empty"], [data-testid*="no-data"]'
  )
  expect(emptyElement).toBeInTheDocument()
  
  if (message) {
    expect(screen.getByText(message)).toBeInTheDocument()
  }
}

// Helper para simular conexão online/offline
export const simulateOnlineStatus = (isOnline: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: isOnline,
  })
  
  const event = new Event(isOnline ? 'online' : 'offline')
  window.dispatchEvent(event)
}

// Helper para simular mudanças de viewport
export const simulateViewportChange = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  
  fireEvent(window, new Event('resize'))
}

// Helper para aguardar animações CSS
export const waitForAnimation = async (duration = 300) => {
  await new Promise(resolve => setTimeout(resolve, duration))
}

// Helper para testar acessibilidade básica
export const expectAccessibleButton = (button: HTMLElement) => {
  expect(button).toHaveAttribute('type')
  expect(button).not.toHaveAttribute('aria-disabled', 'true')
  
  // Verificar se tem texto ou aria-label
  const hasText = button.textContent && button.textContent.trim().length > 0
  const hasAriaLabel = button.hasAttribute('aria-label')
  expect(hasText || hasAriaLabel).toBe(true)
}

export const expectAccessibleForm = (form: HTMLElement) => {
  const inputs = form.querySelectorAll('input, select, textarea')
  
  inputs.forEach(input => {
    // Cada input deve ter label ou aria-label
    const hasLabel = input.hasAttribute('aria-label') || 
                    input.hasAttribute('aria-labelledby') ||
                    form.querySelector(`label[for="${input.id}"]`)
    
    expect(hasLabel).toBe(true)
  })
}

// Helper para debug de elementos
export const debugElement = (selector: string) => {
  const element = document.querySelector(selector)
  if (element) {
    console.log('Element found:', element)
    console.log('Element HTML:', element.outerHTML)
    console.log('Element text:', element.textContent)
  } else {
    console.log('Element not found:', selector)
    console.log('Available elements:', document.body.innerHTML)
  }
}

// Helper para aguardar múltiplas condições
export const waitForAll = async (conditions: (() => void)[], timeout = 5000) => {
  await waitFor(
    () => {
      conditions.forEach(condition => condition())
    },
    { timeout }
  )
}

// Helper para criar delays controlados em testes
export const createDelay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
