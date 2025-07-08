'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  ShareIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useCategories } from '@/hooks/useCategories'
import { useCountries } from '@/hooks/useCountries'
import { useAuthStore } from '@/stores/authStore'
import { usePostFavorite } from '@/hooks/useFavorites'
import { useConversations } from '@/hooks/useConversations'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Post {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price?: number
  currency: string
  is_negotiable: boolean
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  images: string[]
  video_url?: string
  country: string
  city: string
  area?: string
  contact_method: 'phone' | 'telegram' | 'whatsapp' | 'email'
  contact_phone?: string
  contact_telegram?: string
  contact_whatsapp?: string
  contact_email?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'sold' | 'archived'
  featured_until?: string
  boost_level: number
  views_count: number
  favorites_count: number
  slug?: string
  created_at: string
  updated_at: string
  published_at?: string
  expires_at?: string
  user?: {
    id: string
    username: string
    full_name?: string
    avatar_url?: string
    created_at: string
    verification_level: number
    reputation_score: number
    successful_transactions: number
  }
}

export default function PostDetail() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  
  const { user } = useAuthStore()
  const { categories, getCategoryName } = useCategories()
  const { countries, getCountryName } = useCountries()
  const { createConversation } = useConversations()
  
  // Use the favorites hook
  const { isFavorited, loading: favoriteLoading, toggleFavorite } = usePostFavorite(postId)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      
      // Fetch post with user data from Supabase
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(
            id,
            username,
            full_name,
            avatar_url,
            created_at,
            verification_level,
            reputation_score,
            successful_transactions
          )
        `)
        .eq('id', postId)
        .single()

      if (postError) throw postError

      // Increment view count in database
      const newViewsCount = (postData.views_count || 0) + 1
      console.log(`Updating views for post ${postId}: ${postData.views_count || 0} -> ${newViewsCount}`)
      
      const { error: updateError } = await supabase
        .from('posts')
        .update({ views_count: newViewsCount })
        .eq('id', postId)

      if (updateError) {
        console.error('Error updating views:', updateError)
      } else {
        console.log('Views updated successfully in database')
      }

      // Update the post data with the new views count
      const updatedPost = {
        ...postData,
        views_count: newViewsCount
      }

      setPost(updatedPost)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('posts.failed_to_load'))
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      toast.error(t('favorites.loginRequired'))
      return
    }
    
    await toggleFavorite()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url: window.location.href,
        })
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success(t('posts.link_copied'))
    }
  }

  const handleReport = () => {
    // TODO: Open report modal
    toast.success(t('posts.report_feature_coming_soon'))
  }

  const handleContactSeller = async () => {
    if (!user) {
      toast.error(t('auth.login_required'))
      return
    }

    if (!post?.user_id) {
      toast.error(t('posts.seller_not_found'))
      return
    }

    if (user.id === post.user_id) {
      toast.error(t('posts.cannot_message_yourself'))
      return
    }

    try {
      setIsCreatingConversation(true)
      const conversationId = await createConversation(post.user_id, post.id)
      
      toast.success(t('messages.message_sent'))
      
      // Redirect to dashboard messages with the new conversation
      router.push('/dashboard?tab=messages')
      
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error(t('posts.failed_to_start_conversation'))
      // Fallback to showing contact info
      setShowContactInfo(true)
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const getCategoryNameById = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId)
    return category ? getCategoryName(category) : 'Other'
  }

  const getCountryNameByCode = (countryCode: string) => {
    const country = countries?.find(c => c.code === countryCode)
    return country ? getCountryName(country) : countryCode
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return t('time.just_now')
    if (diffInHours < 24) return t('time.hours_ago', { count: diffInHours })
    if (diffInHours < 168) return t('time.days_ago', { count: Math.floor(diffInHours / 24) })
    return postDate.toLocaleDateString()
  }

  const renderStars = (reputationScore: number) => {
    const stars = []
    // Convert reputation score (0-100) to stars (0-5)
    const rating = Math.min(5, Math.max(0, reputationScore / 20))
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      )
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 opacity-50">★</span>
      )
    }
    
    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      )
    }
    
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('posts.not_found')}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || t('posts.not_found_description')}
            </p>
            <button
              onClick={() => router.back()}
              className="text-white px-6 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: '#2D4B73' }}
            >
              {t('common.go_back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if current user is the post owner
  const isOwner = user && post && user.id === post.user_id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with edit button for owner */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          {isOwner && (
            <button
              onClick={() => router.push(`/posts/${post.id}/edit`)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image Gallery */}
              <div className="relative">
                <img
                  src={post.images[selectedImage] || '/placeholder-image.jpg'}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
                {post.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {post.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            selectedImage === index
                              ? 'border-[#D9B70D]'
                              : 'border-white'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${post.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFavorite}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {isFavorited ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ShareIcon className="h-6 w-6 text-gray-400" />
                    </button>
                    <button
                      onClick={handleReport}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                     <div className="flex items-center space-x-1">
                     <MapPinIcon className="h-4 w-4" />
                     <span>{post.city}, {getCountryNameByCode(post.country)}</span>
                   </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{post.views_count} views</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-[#2D4B73] mb-4">
                  {formatPrice(post.price || 0, post.currency)}
                  {post.is_negotiable && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {t('posts.negotiable')}
                    </span>
                  )}
                </div>

                                 <div className="flex items-center space-x-4 mb-6">
                   <span className="px-3 py-1 bg-[#f0f4f8] text-[#2D4B73] text-sm rounded-full">
                     {getCategoryNameById(post.category_id)}
                   </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {post.condition}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3">{t('posts.description')}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {post.user?.avatar_url ? (
                    <img
                      src={post.user.avatar_url}
                      alt={post.user.full_name || 'Seller'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.user?.full_name || t('posts.seller')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('posts.member_since')} {formatDate(post.user?.created_at || post.created_at)}
                  </p>
                </div>
              </div>

              {!showContactInfo ? (
                <button
                  onClick={handleContactSeller}
                  disabled={isCreatingConversation}
                  className="w-full text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#D9B70D' }}
                  onMouseEnter={(e) => !isCreatingConversation && (e.currentTarget.style.backgroundColor = '#BF8D30')}
                  onMouseLeave={(e) => !isCreatingConversation && (e.currentTarget.style.backgroundColor = '#D9B70D')}
                >
                  {isCreatingConversation ? t('posts.starting_conversation') : t('messages.contact_seller')}
                </button>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">{t('posts.contact_seller')}</h4>
                  
                  {post.contact_phone && (
                    <a
                      href={`tel:${post.contact_phone}`}
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#2D4B73] transition-colors"
                    >
                      <PhoneIcon className="h-5 w-5" />
                      <span>{post.contact_phone}</span>
                    </a>
                  )}

                  {post.contact_email && (
                    <a
                      href={`mailto:${post.contact_email}`}
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#2D4B73] transition-colors"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                      <span>{post.contact_email}</span>
                    </a>
                  )}

                  {post.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${post.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#2D4B73] transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span>WhatsApp: {post.contact_whatsapp}</span>
                    </a>
                  )}

                  {post.contact_telegram && (
                    <a
                      href={`https://t.me/${post.contact_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#2D4B73] transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span>Telegram: {post.contact_telegram}</span>
                    </a>
                  )}
                </div>
              )}

              {post.user && user && user.id !== post.user.id && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/users/${post.user.id}`}
                    className="text-[#2D4B73] hover:text-[#253C59] font-medium"
                  >
                    {t('posts.view_seller_profile')}
                  </Link>
                </div>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                {t('posts.safety_tips')}
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• {t('posts.safety_tip_1')}</li>
                <li>• {t('posts.safety_tip_2')}</li>
                <li>• {t('posts.safety_tip_3')}</li>
                <li>• {t('posts.safety_tip_4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 