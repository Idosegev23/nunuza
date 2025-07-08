import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/lib/i18n'

interface AppState {
  language: string
  country: string | null
  city: string | null
  currency: string
  theme: 'light' | 'dark'
  setLanguage: (language: string) => void
  setLocation: (country: string, city?: string) => void
  setCurrency: (currency: string) => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      country: null,
      city: null,
      currency: 'UGX',
      theme: 'light',

      setLanguage: (language) => {
        set({ language })
        i18n.changeLanguage(language)
        
        // Set currency based on language/region
        const currencyMap: Record<string, string> = {
          'en': 'UGX', // Default to Uganda
          'fr': 'XAF', // Central African Franc
          'sw': 'TZS'  // Tanzanian Shilling
        }
        
        const newCurrency = currencyMap[language] || 'UGX'
        set({ currency: newCurrency })
      },

      setLocation: (country, city) => {
        set({ country, city })
        
        // Update currency based on country
        const countryCurrencyMap: Record<string, string> = {
          'UG': 'UGX',
          'KE': 'KES', 
          'TZ': 'TZS',
          'RW': 'RWF',
          'BI': 'BIF'
        }
        
        const newCurrency = countryCurrencyMap[country] || 'UGX'
        set({ currency: newCurrency })
      },

      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'nunuza-app',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language)
        }
      }
    }
  )
) 