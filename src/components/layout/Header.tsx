'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const Header = () => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const { language, setLanguage } = useAppStore()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇬' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/logo_name.png" 
              alt="Nunuza - Your local digital marketplace" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/categories" 
              className="text-gray-700 transition-colors hover:text-[#2D4B73]"
            >
              {t('nav.categories')}
            </Link>
            
            <Link 
              href="/search" 
              className="text-gray-700 transition-colors flex items-center space-x-1 hover:text-[#2D4B73]"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>{t('nav.search')}</span>
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 text-gray-700 transition-colors hover:text-[#2D4B73]"
              >
                <GlobeAltIcon className="h-5 w-5" />
                <span className="hidden sm:block">
                  {currentLanguage?.flag} {currentLanguage?.name}
                </span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                        language === lang.code ? 'text-[#2D4B73]' : 'text-gray-700'
                      }`}
                      style={language === lang.code ? { backgroundColor: '#f0f4f8' } : {}}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Post Ad Button */}
            <Link
              href="/post"
              className="text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-1"
              style={{ backgroundColor: '#D9B70D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:block">{t('nav.post_ad')}</span>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="text-gray-700 transition-colors flex items-center space-x-1 hover:text-[#2D4B73]"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden sm:block">{t('nav.dashboard')}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="text-gray-700 hover:text-red-600 transition-colors hidden sm:block"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-gray-700 transition-colors hover:text-[#2D4B73]"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/categories"
                className="text-gray-700 transition-colors hover:text-[#2D4B73]"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.categories')}
              </Link>
              <Link
                href="/search"
                className="text-gray-700 transition-colors hover:text-[#2D4B73]"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.search')}
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 transition-colors hover:text-[#2D4B73]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-gray-700 hover:text-red-600 transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 transition-colors hover:text-[#2D4B73]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-gray-700 hover:text-orange-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 