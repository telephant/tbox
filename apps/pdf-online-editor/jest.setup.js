import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock ResizeObserver (only in jsdom environment)
if (typeof global !== 'undefined') {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock File and FileReader
global.File = class MockFile {
  constructor(parts, filename, properties = {}) {
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = properties.type || ''
    this.lastModified = properties.lastModified || Date.now()
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.readyState = 0
    this.result = null
    this.error = null
  }
  
  readAsDataURL() {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'data:application/pdf;base64,test'
      this.onload?.()
    }, 0)
  }
  
  readAsText() {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'test content'
      this.onload?.()
    }, 0)
  }
}

// Suppress console errors during tests
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalError.call(console, ...args)
}