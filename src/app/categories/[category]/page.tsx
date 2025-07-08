'use client'

import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import {
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChevronDownIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useCategories } from '@/hooks/useCategories'
import { usePosts, Post } from '@/hooks/usePosts'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-hot-toast'

const CategoryPage = () => {
  const { t } = useTranslation()
  const params = useParams()
  const searchParams = useSearchParams()
  const category = params?.category as string
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })
  const [conditionFilter, setConditionFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Get category data
  const { categories, loading: categoriesLoading, getCategoryBySlug, getCategoryName } = useCategories()
  const currentCategory = getCategoryBySlug(category)
  const { user } = useAuthStore()
  const { isFavorited, toggleFavorite } = useFavorites()

  // Only fetch posts when we have the category data
  const shouldFetchPosts = !categoriesLoading && currentCategory?.id
  
  // Memoize the filters object to prevent infinite re-renders
  const filters = useMemo(() => {
    if (!shouldFetchPosts) return undefined
    
    return {
      category_id: currentCategory.id,
      min_price: priceFilter.min ? Number(priceFilter.min) : undefined,
      max_price: priceFilter.max ? Number(priceFilter.max) : undefined,
      condition: conditionFilter || undefined,
      city: locationFilter || undefined
    }
  }, [shouldFetchPosts, currentCategory?.id, priceFilter.min, priceFilter.max, conditionFilter, locationFilter])

  // Get posts for this category
  const { posts, loading: postsLoading, error } = usePosts(filters)

  const loading = categoriesLoading || postsLoading

  // Sort posts based on sortBy (with safe default)
  const sortedPosts = (posts || []).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'price_low':
        return (a.price || 0) - (b.price || 0)
      case 'price_high':
        return (b.price || 0) - (a.price || 0)
      case 'views':
        return b.views_count - a.views_count
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading posts</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!loading && !currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/categories"
            className="inline-block text-white px-6 py-3 rounded-lg transition-colors"
            style={{ backgroundColor: '#D9B70D' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
          >
            Browse All Categories
          </Link>
        </div>
      </div>
    )
  }

  const getLocationString = (post: Post) => {
    // Map country codes to names
    const countryNames: { [key: string]: string } = {
      'UG': 'Uganda',
      'KE': 'Kenya', 
      'TZ': 'Tanzania',
      'RW': 'Rwanda',
      'BI': 'Burundi'
    }
    const countryName = countryNames[post.country] || post.country
    return `${post.city}, ${countryName}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  const PostCard = ({ post }: { post: Post }) => {
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
            className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image.jpg'
            }}
          />
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
          >
            {isFavorited(post.id) ? (
              <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            )}
          </button>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 line-clamp-2 leading-tight">
            {post.title}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#D9B70D' }}>
              {post.price ? `${post.price.toLocaleString()} ${post.currency}` : t('category_page.price_on_request')}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {t(`conditions.${post.condition}`)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3">
            <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{getLocationString(post)}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <div className="flex items-center">
              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{post.views_count || 0} {t('category_page.views')}</span>
            </div>
            <span className="text-xs">{getTimeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>
    )
  }

  const PostListItem = ({ post }: { post: Post }) => {
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
              className="w-24 h-18 sm:w-32 sm:h-24 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-image.jpg'
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg sm:text-xl font-bold" style={{ color: '#D9B70D' }}>
                    {post.price ? `${post.price.toLocaleString()} ${post.currency}` : t('category_page.price_on_request')}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {t(`conditions.${post.condition}`)}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2">
                  <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{getLocationString(post)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>{post.views_count || 0} {t('category_page.views')}</span>
                  </div>
                  <span>{getTimeAgo(post.created_at)}</span>
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {currentCategory ? getCategoryName(currentCategory) : category}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {sortedPosts.length} {t('category_page.listings_found')}
              </p>
            </div>
            
            {/* Mobile: Stack controls vertically */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              {/* View Mode Toggle - Hidden on mobile, grid is default */}
              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'text-white' : 'bg-white text-gray-600'}`}
                  style={viewMode === 'grid' ? { backgroundColor: '#D9B70D' } : {}}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'text-white' : 'bg-white text-gray-600'}`}
                  style={viewMode === 'list' ? { backgroundColor: '#D9B70D' } : {}}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Sort and Filters in one row on mobile */}
              <div className="flex space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#D9B70D' } as any}
                >
                  <option value="newest">{t('sorting.newest')}</option>
                  <option value="oldest">{t('sorting.oldest')}</option>
                  <option value="price_low">{t('sorting.price_low')}</option>
                  <option value="price_high">{t('sorting.price_high')}</option>
                  <option value="views">{t('sorting.views')}</option>
                </select>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 bg-white border rounded-lg px-3 sm:px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDownIcon className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('category_page.price_range')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder={t('category_page.min_price')}
                    value={priceFilter.min}
                    onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#D9B70D' } as any}
                  />
                  <input
                    type="number"
                    placeholder={t('category_page.max_price')}
                    value={priceFilter.max}
                    onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#D9B70D' } as any}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('category_page.condition')}
                </label>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#D9B70D' } as any}
                >
                  <option value="">{t('category_page.any_condition')}</option>
                  <option value="new">{t('conditions.new')}</option>
                  <option value="like_new">{t('conditions.like_new')}</option>
                  <option value="good">{t('conditions.good')}</option>
                  <option value="fair">{t('conditions.fair')}</option>
                  <option value="poor">{t('conditions.poor')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('category_page.location')}
                </label>
                <input
                  type="text"
                  placeholder={t('category_page.enter_location')}
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#D9B70D' } as any}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPriceFilter({ min: '', max: '' })
                    setConditionFilter('')
                    setLocationFilter('')
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {t('category_page.clear_filters')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {sortedPosts.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-4'
          }>
            {sortedPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                {/* Mobile always shows grid view, desktop can toggle */}
                {viewMode === 'grid' || true ? (
                  <PostCard post={post} />
                ) : (
                  <PostListItem post={post} />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl text-gray-400 mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {t('category_page.no_listings_title')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
              {t('category_page.no_listings_subtitle')}
            </p>
            <Link
              href="/post"
              className="inline-block text-white px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
              style={{ backgroundColor: '#D9B70D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
            >
              {t('category_page.post_first_listing')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage 