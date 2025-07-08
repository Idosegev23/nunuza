'use client'

import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { usePosts, type Post } from '@/hooks/usePosts'
import { useCategories } from '@/hooks/useCategories'
import { useCountries } from '@/hooks/useCountries'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-hot-toast'

const SearchPage = () => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
    country: ''
  })

  // Get real data from hooks
  const { categories, getCategoryName } = useCategories()
  const { countries, getCountryName } = useCountries()
  const { user } = useAuthStore()
  const { isFavorited, toggleFavorite } = useFavorites()
  
  // Memoize filters to prevent infinite re-renders
  const postFilters = useMemo(() => ({
    search: query || undefined,
    category_id: filters.category || undefined,
    country: filters.country || undefined,
    city: filters.location || undefined,
    condition: filters.condition || undefined,
    min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
    max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined
  }), [query, filters.category, filters.country, filters.location, filters.condition, filters.minPrice, filters.maxPrice])

  const { posts, loading, error } = usePosts(postFilters)

  const conditions = ['new', 'like_new', 'good', 'fair', 'poor']

  useEffect(() => {
    const searchQuery = searchParams?.get('q') || ''
    setQuery(searchQuery)
  }, [searchParams])

  const applyFilters = () => {
    // Filters are automatically applied through usePosts hook
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
      country: ''
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is automatically triggered through usePosts dependency
  }

  const getLocationString = (post: Post) => {
    const country = countries?.find(c => c.code === post.country)
    return `${post.city}, ${country ? getCountryName(country) : post.country}`
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return t('time.justNow')
    if (diffInHours < 24) return t('time.hoursAgo', { count: diffInHours })
    if (diffInHours < 168) return t('time.daysAgo', { count: Math.floor(diffInHours / 24) })
    return postDate.toLocaleDateString()
  }

  const SearchResultCard = ({ post }: { post: Post }) => {
    const handleFavoriteClick = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!user) {
        toast.error(t('favorites.loginRequired'))
        return
      }
      
      await toggleFavorite(post.id)
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <div className="relative">
          <img 
            src={post.images[0] || '/placeholder-image.jpg'} 
            alt={post.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image.jpg'
            }}
          />
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
          >
            {isFavorited(post.id) ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          <span className="absolute top-2 left-2 text-white px-2 py-1 text-xs rounded" style={{ backgroundColor: '#D9B70D' }}>
            {post.category_id && categories.find(c => c.id === post.category_id) 
              ? getCategoryName(categories.find(c => c.id === post.category_id)!) 
              : 'Other'}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold" style={{ color: '#2D4B73' }}>
              {post.price ? `${post.price.toLocaleString()} ${post.currency}` : 'Contact for price'}
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {t(`conditions.${post.condition}`)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {getLocationString(post)}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              {post.views_count} {t('search.views')}
            </div>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>
    )
  }

  const SearchResultListItem = ({ post }: { post: Post }) => {
    const handleFavoriteClick = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!user) {
        toast.error(t('favorites.loginRequired'))
        return
      }
      
      await toggleFavorite(post.id)
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4">
        <div className="flex space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={post.images[0] || '/placeholder-image.jpg'}
              alt={post.title}
              className="w-32 h-24 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-image.jpg'
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {post.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{getLocationString(post)}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span>{post.views_count || 0} {t('search.views')}</span>
                  </div>
                  <span>{formatTimeAgo(post.created_at)}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {post.description}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold" style={{ color: '#D9B70D' }}>
                    {post.price ? `${post.price.toLocaleString()} ${post.currency}` : t('search.price_on_request')}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {t(`conditions.${post.condition}`)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <button 
                  onClick={handleFavoriteClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isFavorited(post.id) ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
              />
            </div>
            <button
              type="submit"
              className="text-white px-6 py-3 rounded-lg transition-colors"
              style={{ backgroundColor: '#D9B70D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
            >
              {t('common.search')}
            </button>
          </form>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {query ? t('search.resultsFor', { query }) : t('search.results')}
              </h1>
              <p className="text-gray-600 mt-1">
                {loading ? t('search.searchingMessage') : t('search.listingsFound', { count: posts.length })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'text-white' : 'bg-white text-gray-600'}`}
                  style={viewMode === 'grid' ? { backgroundColor: '#2D4B73' } : {}}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'text-white' : 'bg-white text-gray-600'}`}
                  style={viewMode === 'list' ? { backgroundColor: '#2D4B73' } : {}}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>{t('search.filters')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('search.filters')}</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('search.category')}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D4B73' } as any}
                >
                  <option value="">{t('search.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('search.minPrice')}
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D4B73' } as any}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('search.maxPrice')}
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D4B73' } as any}
                  placeholder="999999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('search.condition')}
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters({...filters, condition: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D4B73' } as any}
                >
                  <option value="">{t('search.anyCondition')}</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {t(`conditions.${condition}`)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('search.location')}
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D4B73' } as any}
                  placeholder={t('search.enterLocation')}
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#D9B70D' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
                >
                  {t('search.apply')}
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('search.clear')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2D4B73' }}></div>
            <p className="text-gray-600">{t('search.searchingMessage')}</p>
          </div>
        ) : posts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                {viewMode === 'grid' ? (
                  <SearchResultCard post={post} />
                ) : (
                  <SearchResultListItem post={post} />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <MagnifyingGlassIcon className="h-24 w-24 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('search.noResultsTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {query ? t('search.noResultsMessage', { query }) : t('search.noResultsGeneral')}
            </p>
            <Link
              href="/categories"
              className="inline-block text-white px-6 py-3 rounded-lg transition-colors"
              style={{ backgroundColor: '#D9B70D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
            >
              {t('search.browseCategories')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage