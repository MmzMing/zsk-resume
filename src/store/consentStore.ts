import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ConsentStatus = 'granted' | 'denied' | 'pending'

interface ConsentStore {
  status: ConsentStatus
  setGranted: () => void
  setDenied: () => void
}

const CONSENT_KEY = 'zsk-resume-consent'

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set) => ({
      status: 'pending',
      setGranted: () => set({ status: 'granted' }),
      setDenied: () => set({ status: 'denied' }),
    }),
    {
      name: CONSENT_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function hasConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    return data.state?.status === 'granted'
  } catch {
    return false
  }
}
