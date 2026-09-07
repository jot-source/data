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
  resumeAction: (() => void | Promise<void>) | null
  open: (view: AuthView, resumeAction?: () => void | Promise<void>) => void
  close: () => void
  triggerSuccess: () => Promise<void>
}

export const useAuthModal = create<AuthModalState>((set, get) => ({
  view: null,
  resumeAction: null,
  open: (view, resumeAction) => set({ view, resumeAction: resumeAction ?? null }),
  close: () => set({ view: null, resumeAction: null }),
  triggerSuccess: async () => {
    const action = get().resumeAction
    set({ view: null, resumeAction: null })
    if (action) {
      try {
        await action()
      } catch (err) {
        console.error('Failed to auto-resume action after auth:', err)
      }
    }
  },
}))
