'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useParams } from 'next/navigation'
import {
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon as ShieldCheckSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '@/stores/authStore'
import { useCategories } from '@/hooks/useCategories'
import { useCountries } from '@/hooks/useCountries'
import { usePosts, type Post } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  country?: string
  city?: string
  bio?: string
  is_verified: boolean
  is_business: boolean
  business_name?: string
  business_category?: string
  business_license?: string
  rating: number
  total_reviews: number
  total_posts: number
  active_posts: number
  sold_posts: number
  member_since: string
  last_seen: string
}

type TabType = 'active' | 'sold' | 'reviews'

export default function UserProfile() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('active')
  
  const currentUser = useAuthStore((state) => state.user)
  const { categories, getCategoryName } = useCategories()
  const { countries, getCountryName } = useCountries()
  
  // Get user's posts with proper filtering
  const postFilters = {
    user_id: userId,
    status: activeTab === 'active' ? 'approved' : activeTab === 'sold' ? 'sold' : undefined
  }
  const { posts, loading: postsLoading } = usePosts(postFilters)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      
      // Fetch user data from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          avatar_url,
          country,
          city,
          bio,
          is_verified,
          is_business,
          business_name,
          business_category,
          business_license,
          rating,
          total_reviews,
          created_at
        `)
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get post counts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: activePosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved')

      const { count: soldPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'sold')

      // Format user data
      const formattedUser: User = {
        ...userData,
        total_posts: totalPosts || 0,
        active_posts: activePosts || 0,
        sold_posts: soldPosts || 0,
        member_since: userData.created_at,
        last_seen: new Date().toISOString() // We don't track this yet
      }

      setUser(formattedUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    // TODO: Open chat/contact modal
    console.log('Contact user:', userId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getLocationString = (post: Post) => {
    const country = countries?.find(c => c.code === post.country)
    return `${post.city}, ${country ? getCountryName(country) : post.country}`
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return postDate.toLocaleDateString()
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      )
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      )
    }
    
    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      )
    }
    
    return stars
  }

  const PostCard = ({ post }: { post: Post }) => {
    const category = categories?.find(c => c.id === post.category_id)
    
    return (
      <Link href={`/posts/${post.id}`}>
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
            <span className="absolute top-2 left-2 text-white px-2 py-1 text-xs rounded" style={{ backgroundColor: '#D9B70D' }}>
              {category ? getCategoryName(category) : 'Other'}
            </span>
            {post.status === 'sold' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SOLD</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold" style={{ color: '#2D4B73' }}>
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
                {post.views_count} views
              </div>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-gray-300 rounded"></div>
                    <div className="h-12 bg-gray-300 rounded"></div>
                    <div className="h-12 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
          <p className="text-gray-600 mb-6">{error || 'This user profile does not exist.'}</p>
          <Link
            href="/"
            className="inline-block text-white px-6 py-3 rounded-lg transition-colors"
            style={{ backgroundColor: '#D9B70D' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                {user.is_verified && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    Verified
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Member since {formatDate(user.member_since)}</span>
                </div>
                {user.city && (
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{user.city}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(user.rating)}
                  <span className="ml-1 text-sm text-gray-600">
                    ({user.total_reviews} reviews)
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {user.total_posts} total listings
                </div>
                <div className="text-sm text-gray-600">
                  {user.active_posts} active listings
                </div>
              </div>
              
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              <div className="text-sm text-gray-500">
                Last active: {formatTimeAgo(user.last_seen)}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {currentUser && currentUser.id !== user.id && (
                <button
                  onClick={handleContact}
                  className="text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: '#D9B70D' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
                >
                  Contact
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'active'
                    ? 'border-[#D9B70D] text-[#D9B70D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Listings ({user.active_posts})
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'sold'
                    ? 'border-[#D9B70D] text-[#D9B70D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sold Listings ({user.sold_posts})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-[#D9B70D] text-[#D9B70D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({user.total_reviews})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'active' && (
              <div>
                {postsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="h-48 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Active Listings
                    </h3>
                    <p className="text-gray-600">
                      This user doesn't have any active listings at the moment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sold' && (
              <div>
                {postsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="h-48 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Sold Listings
                    </h3>
                    <p className="text-gray-600">
                      This user hasn't sold any items yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Reviews Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    The review system is under development.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 