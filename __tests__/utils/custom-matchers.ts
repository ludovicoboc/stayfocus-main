import { expect } from 'vitest'

// Matcher customizado para verificar se um elemento tem classes de loading
expect.extend({
  toBeLoading(received: HTMLElement) {
    const loadingClasses = [
      'animate-pulse',
      'animate-spin',
      'loading',
      'skeleton'
    ]
    
    const hasLoadingClass = loadingClasses.some(className => 
      received.classList.contains(className)
    )
    
    const hasLoadingTestId = received.getAttribute('data-testid')?.includes('loading') || false
    const hasLoadingAriaLabel = received.getAttribute('aria-label')?.toLowerCase().includes('loading') || false
    
    const isLoading = hasLoadingClass || hasLoadingTestId || hasLoadingAriaLabel
    
    return {
      message: () => 
        isLoading 
          ? `Expected element not to be in loading state`
          : `Expected element to be in loading state`,
      pass: isLoading,
    }
  },
})

// Matcher customizado para verificar se um elemento tem estado de erro
expect.extend({
  toHaveErrorState(received: HTMLElement) {
    const errorClasses = [
      'text-red-500',
      'text-red-600',
      'text-red-700',
      'bg-red-50',
      'bg-red-100',
      'border-red-500',
      'error'
    ]
    
    const hasErrorClass = errorClasses.some(className => 
      received.classList.contains(className)
    )
    
    const hasErrorRole = received.getAttribute('role') === 'alert'
    const hasErrorTestId = received.getAttribute('data-testid')?.includes('error') || false
    const hasErrorAriaLabel = received.getAttribute('aria-label')?.toLowerCase().includes('error') || false
    
    const hasError = hasErrorClass || hasErrorRole || hasErrorTestId || hasErrorAriaLabel
    
    return {
      message: () => 
        hasError 
          ? `Expected element not to have error state`
          : `Expected element to have error state`,
      pass: hasError,
    }
  },
})

// Matcher customizado para verificar se um formulário é válido
expect.extend({
  toBeValidForm(received: HTMLFormElement) {
    const inputs = received.querySelectorAll('input, select, textarea')
    let isValid = true
    const invalidFields: string[] = []
    
    inputs.forEach((input: Element) => {
      const htmlInput = input as HTMLInputElement
      if (!htmlInput.checkValidity()) {
        isValid = false
        const label = received.querySelector(`label[for="${htmlInput.id}"]`)?.textContent || htmlInput.name || 'Unknown field'
        invalidFields.push(label)
      }
    })
    
    return {
      message: () => 
        isValid 
          ? `Expected form to be invalid`
          : `Expected form to be valid. Invalid fields: ${invalidFields.join(', ')}`,
      pass: isValid,
    }
  },
})

// Matcher customizado para verificar acessibilidade básica
expect.extend({
  toBeAccessible(received: HTMLElement) {
    const issues: string[] = []
    
    // Verificar se botões têm texto ou aria-label
    if (received.tagName === 'BUTTON') {
      const hasText = received.textContent && received.textContent.trim().length > 0
      const hasAriaLabel = received.hasAttribute('aria-label')
      const hasAriaLabelledBy = received.hasAttribute('aria-labelledby')
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push('Button must have text content or aria-label')
      }
    }
    
    // Verificar se inputs têm labels
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(received.tagName)) {
      const hasLabel = received.hasAttribute('aria-label') || 
                     received.hasAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${received.id}"]`)
      
      if (!hasLabel) {
        issues.push('Form control must have associated label')
      }
    }
    
    // Verificar se imagens têm alt text
    if (received.tagName === 'IMG') {
      const hasAlt = received.hasAttribute('alt')
      if (!hasAlt) {
        issues.push('Image must have alt attribute')
      }
    }
    
    // Verificar se links têm texto descritivo
    if (received.tagName === 'A') {
      const hasText = received.textContent && received.textContent.trim().length > 0
      const hasAriaLabel = received.hasAttribute('aria-label')
      
      if (!hasText && !hasAriaLabel) {
        issues.push('Link must have descriptive text or aria-label')
      }
    }
    
    const isAccessible = issues.length === 0
    
    return {
      message: () => 
        isAccessible 
          ? `Expected element to have accessibility issues`
          : `Expected element to be accessible. Issues found: ${issues.join(', ')}`,
      pass: isAccessible,
    }
  },
})

// Matcher customizado para verificar se um elemento está visível na viewport
expect.extend({
  toBeInViewport(received: HTMLElement) {
    const rect = received.getBoundingClientRect()
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
    
    return {
      message: () => 
        isInViewport 
          ? `Expected element not to be in viewport`
          : `Expected element to be in viewport`,
      pass: isInViewport,
    }
  },
})

// Matcher customizado para verificar se um elemento tem foco
expect.extend({
  toBeFocused(received: HTMLElement) {
    const isFocused = document.activeElement === received
    
    return {
      message: () => 
        isFocused 
          ? `Expected element not to be focused`
          : `Expected element to be focused`,
      pass: isFocused,
    }
  },
})

// Matcher customizado para verificar se um elemento tem atributos ARIA específicos
expect.extend({
  toHaveAriaAttribute(received: HTMLElement, attribute: string, value?: string) {
    const hasAttribute = received.hasAttribute(attribute)
    
    if (!hasAttribute) {
      return {
        message: () => `Expected element to have aria attribute: ${attribute}`,
        pass: false,
      }
    }
    
    if (value !== undefined) {
      const actualValue = received.getAttribute(attribute)
      const hasCorrectValue = actualValue === value
      
      return {
        message: () => 
          hasCorrectValue 
            ? `Expected element not to have ${attribute}="${value}"`
            : `Expected element to have ${attribute}="${value}", but got "${actualValue}"`,
        pass: hasCorrectValue,
      }
    }
    
    return {
      message: () => `Expected element not to have aria attribute: ${attribute}`,
      pass: true,
    }
  },
})

// Matcher customizado para verificar se um elemento está animando
expect.extend({
  toBeAnimating(received: HTMLElement) {
    const animationClasses = [
      'animate-pulse',
      'animate-spin',
      'animate-bounce',
      'animate-ping',
      'transition',
      'duration-',
      'ease-'
    ]
    
    const hasAnimationClass = animationClasses.some(className => 
      Array.from(received.classList).some(cls => cls.includes(className))
    )
    
    const computedStyle = window.getComputedStyle(received)
    const hasTransition = computedStyle.transition !== 'none'
    const hasAnimation = computedStyle.animation !== 'none'
    
    const isAnimating = hasAnimationClass || hasTransition || hasAnimation
    
    return {
      message: () => 
        isAnimating 
          ? `Expected element not to be animating`
          : `Expected element to be animating`,
      pass: isAnimating,
    }
  },
})

// Declarações de tipos para TypeScript
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeLoading(): any
      toHaveErrorState(): any
      toBeValidForm(): any
      toBeAccessible(): any
      toBeInViewport(): any
      toBeFocused(): any
      toHaveAriaAttribute(attribute: string, value?: string): any
      toBeAnimating(): any
    }
  }
}
