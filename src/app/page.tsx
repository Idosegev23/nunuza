'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/outline'
import CategoriesGrid from '@/components/home/CategoriesGrid'
import SearchBar from '@/components/home/SearchBar'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-white py-16" style={{ backgroundColor: '#2D4B73' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img 
              src="/logo_full.png" 
              alt="Nunuza - Your local digital marketplace" 
              className="h-20 md:h-24 w-auto mx-auto"
            />
          </div>
          <p className="text-lg mb-12 max-w-2xl mx-auto opacity-80">
            {t('home.hero_subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/post"
              className="text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#D9B70D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
            >
              <PlusIcon className="h-5 w-5" />
              <span>{t('nav.post_ad')}</span>
            </Link>
            <Link
              href="/search"
              className="border-2 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              style={{ borderColor: '#99B4BF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#99B4BF'
                e.currentTarget.style.color = '#2D4B73'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'white'
              }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>{t('nav.search')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('categories.all_categories')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('home.categories_description')}
            </p>
          </div>
          
          <CategoriesGrid />
          
          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="font-semibold transition-colors hover:text-[#253C59]"
              style={{ color: '#2D4B73' }}
            >
              {t('home.view_all_categories')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.why_choose_title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0f4f8' }}>
                <GlobeAltIcon className="h-8 w-8" style={{ color: '#2D4B73' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.feature_multilingual')}</h3>
              <p className="text-gray-600">
                {t('home.feature_multilingual_desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0f4f8' }}>
                <ShieldCheckIcon className="h-8 w-8" style={{ color: '#D9B70D' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.feature_secure')}</h3>
              <p className="text-gray-600">
                {t('home.feature_secure_desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0f4f8' }}>
                <DevicePhoneMobileIcon className="h-8 w-8" style={{ color: '#BF8D30' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.feature_mobile')}</h3>
              <p className="text-gray-600">
                {t('home.feature_mobile_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
