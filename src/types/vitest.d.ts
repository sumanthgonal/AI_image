declare module 'vitest' {
  export * from '@types/jest'
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function expect(value: unknown): {
    toBeTruthy(): void
    toBe(expected: unknown): void
    toBeInTheDocument(): void
    toHaveAttribute(attr: string, value?: string): void
    toBeGreaterThan(num: number): void
    toBeLessThan(num: number): void
    toThrow(message?: string): void
    rejects: {
      toThrow(message?: string): Promise<void>
    }
  }
  export function beforeEach(fn: () => void | Promise<void>): void
  export function afterEach(fn: () => void | Promise<void>): void
  export function beforeAll(fn: () => void | Promise<void>): void
  export function afterAll(fn: () => void | Promise<void>): void
}