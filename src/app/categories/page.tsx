'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import {
  DevicePhoneMobileIcon,
  TruckIcon,
  HomeIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  SunIcon,
  BookOpenIcon,
  HeartIcon,
  GlobeAltIcon,
  BeakerIcon,
  PaintBrushIcon,
  ArchiveBoxIcon,
  ShoppingBagIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { useCategories } from '@/hooks/useCategories'

const CategoriesPage = () => {
  const { t } = useTranslation()
  const { categories, loading, getCategoryName } = useCategories()

  const getCategoryImage = (slug: string) => {
    const imageMap: { [key: string]: string } = {
      'electronics': '/catagories/electronics.png',
      'vehicles': '/catagories/Vehicles.png',
      'real-estate': '/catagories/Real_Estate.png',
      'fashion-beauty': '/catagories/Fashion&Beauty.png',
      'home-garden': '/catagories/Home&Garden.png',
      'jobs': '/catagories/jobs.png',
      'services': '/catagories/services.png',
      'agriculture': '/catagories/agricultrue.png',
      'sports-leisure': '/catagories/sports.png',
      'books-education': '/catagories/Books&Education.png',
      'baby-kids': '/catagories/Baby&Kids.png',
      'pets-animals': '/catagories/pets.png',
      'health-beauty': '/catagories/health&beauty.png',
      'arts-crafts': '/catagories/Arts&Crafts.png',
      'others': '/catagories/Others.png'
    }
    return imageMap[slug] || '/placeholder-image.jpg'
  }

  const getBrandColor = (index: number) => {
    // Unified brand color - consistent gold for all categories
    return '#D9B70D' // Bright gold - main accent color
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 h-32 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('categories.all_categories')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through all our categories to find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const categoryImage = getCategoryImage(category.slug)
            const backgroundColor = getBrandColor(index)
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div 
                  className="p-8 rounded-xl text-white text-center hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor }}
                >
                  <div className="flex justify-center mb-4">
                    <img 
                      src={categoryImage} 
                      alt={getCategoryName(category)}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 leading-tight">
                    {getCategoryName(category)}
                  </h3>
                  <p className="text-sm opacity-90">
                    {category.posts_count} listings
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Popular Categories Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Most Popular Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category, index) => {
              const categoryImage = getCategoryImage(category.slug)
              const backgroundColor = getBrandColor(index)
              return (
                <Link
                  key={`popular-${category.id}`}
                  href={`/categories/${category.slug}`}
                  className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor }}
                    >
                      <img 
                        src={categoryImage} 
                        alt={getCategoryName(category)}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getCategoryName(category)}
                      </h3>
                      <p className="text-gray-600">
                        {category.posts_count} active listings
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default CategoriesPage 