import { vi } from 'vitest'

// Mock mais robusto do IntersectionObserver
const mockIntersectionObserver = vi.fn().mockImplementation((callback, options) => {
  const instance = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: options?.thresholds || [0],
  }
  
  // Simular callback imediato para elementos visíveis
  setTimeout(() => {
    if (callback && typeof callback === 'function') {
      callback([
        {
          isIntersecting: true,
          target: document.createElement('div'),
          intersectionRatio: 1,
          boundingClientRect: {
            bottom: 100,
            height: 100,
            left: 0,
            right: 100,
            top: 0,
            width: 100,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          intersectionRect: {
            bottom: 100,
            height: 100,
            left: 0,
            right: 100,
            top: 0,
            width: 100,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          rootBounds: {
            bottom: 100,
            height: 100,
            left: 0,
            right: 100,
            top: 0,
            width: 100,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          time: Date.now(),
        },
      ])
    }
  }, 0)
  
  return instance
})

// Aplicar mock globalmente
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})

// Mock do ResizeObserver
const mockResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: mockResizeObserver,
})

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: mockResizeObserver,
})

// Mock do scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

// Mock do scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock do getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
}))

// Mock do getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  configurable: true,
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(() => ''),
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
  })),
})

// Mock do requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: vi.fn((callback) => {
    setTimeout(callback, 16)
    return 1
  }),
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

// Mock do Image constructor
Object.defineProperty(window, 'Image', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    src: '',
    alt: '',
    width: 0,
    height: 0,
  })),
})

// Mock do URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  configurable: true,
  value: vi.fn(() => 'mock-object-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

// Mock do FileReader
Object.defineProperty(window, 'FileReader', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    result: null,
    error: null,
  })),
})

// Mock do Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
})

// Mock do crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
  writable: true,
  configurable: true,
  value: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
})

// Mock do performance.now
Object.defineProperty(performance, 'now', {
  writable: true,
  configurable: true,
  value: vi.fn(() => Date.now()),
})

// Mock do MutationObserver
Object.defineProperty(window, 'MutationObserver', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  })),
})

// Mock do CustomEvent
Object.defineProperty(window, 'CustomEvent', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((type, options) => ({
    type,
    detail: options?.detail,
    bubbles: options?.bubbles || false,
    cancelable: options?.cancelable || false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  })),
})

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks()
  mockIntersectionObserver.mockClear()
  mockResizeObserver.mockClear()
})

export {
  mockIntersectionObserver,
  mockResizeObserver,
}
