import { vi } from 'vitest'

// Mock Zustand persist
// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => config,
}))

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  }
})