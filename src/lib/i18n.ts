import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import en from '@/locales/en/common.json'
import fr from '@/locales/fr/common.json'
import sw from '@/locales/sw/common.json'

const resources = {
  en: { common: en },
  fr: { common: fr },
  sw: { common: sw }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? 
      localStorage.getItem('nunuza-language') || 'en' : 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  })

// Save language preference
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nunuza-language', lng)
    document.documentElement.lang = lng
  }
})

export default i18n 