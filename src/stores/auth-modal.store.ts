// stores/auth-modal.store.ts
// Zustand store for the auth-modal UI state — which form (if any) is open.
// This is UI-only client state (per docs/tech-stack-decisions.md: Zustand for
// UI-only state, TanStack Query for anything from the API/DB). The Supabase
// SESSION never lives here — it's in the auth cookie, read server-side via
// getClaims() on every request.
import { create } from 'zustand'

export type AuthView = 'sign-in' | 'sign-up' | 'forgot-password'

type AuthModalState = {
  view: AuthView | null
  open: (view: AuthView) => void
  close: () => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  view: null,
  open: (view) => set({ view }),
  close: () => set({ view: null }),
}))
