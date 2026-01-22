import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock crypto.randomUUID for consistent test IDs
let uuidCounter = 0
vi.stubGlobal("crypto", {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
})

// Reset UUID counter before each test
beforeEach(() => {
  uuidCounter = 0
})

// Mock ResizeObserver (used by ReactFlow)
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock)

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock)

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock requestAnimationFrame
vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
  return setTimeout(() => fn(Date.now()), 0)
})

vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  clearTimeout(id)
})
