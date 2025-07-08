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
  CameraIcon,
  HeartIcon,
  GlobeAltIcon,
  BeakerIcon,
  PaintBrushIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { useCategories } from '@/hooks/useCategories'

const CategoriesGrid = () => {
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 h-24 rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
      {categories.slice(0, 8).map((category, index) => {
        const categoryImage = getCategoryImage(category.slug)
        const backgroundColor = getBrandColor(index)
        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group"
          >
            <div 
              className="p-6 rounded-xl text-white text-center hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
              style={{ backgroundColor }}
            >
              <div className="flex justify-center mb-3">
                <img 
                  src={categoryImage} 
                  alt={getCategoryName(category)}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h3 className="text-sm font-semibold mb-1 leading-tight">
                {getCategoryName(category)}
              </h3>
              <p className="text-xs opacity-90">
                {category.posts_count} ads
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default CategoriesGrid 