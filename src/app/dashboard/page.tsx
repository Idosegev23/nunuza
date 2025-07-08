'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useUserPosts } from '@/hooks/usePosts'
import { useFavorites } from '@/hooks/useFavorites'
import { useCategories } from '@/hooks/useCategories'
import { 
  TagIcon, 
  CheckCircleIcon, 
  ClockIcon,
  PlusIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XMarkIcon,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ConversationList } from '@/components/messaging/ConversationList'
import { ChatWindow } from '@/components/messaging/ChatWindow'
import { Conversation } from '@/hooks/useConversations'

export default function Dashboard() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { posts, loading, error, stats } = useUserPosts(user?.id)
  const { favoritePosts, loading: favoritesLoading, fetchFavoritePosts } = useFavorites()
  const { getCategoryName, categories } = useCategories()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [deletingPost, setDeletingPost] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites' | 'messages'>('posts')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  // Handle URL parameters for direct tab access
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['posts', 'favorites', 'messages'].includes(tab)) {
      setActiveTab(tab as 'posts' | 'favorites' | 'messages')
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your dashboard</p>
          <Link
            href="/auth/login"
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
          >
            {t('auth.login')}
          </Link>
        </div>
      </div>
    )
  }

  const filteredPosts = selectedStatus === 'all' 
    ? posts 
    : posts.filter(post => post.status === selectedStatus)

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setDeletingPost(postId)
    try {
      // First, delete associated images from storage
      const post = posts.find(p => p.id === postId)
      if (post?.images && post.images.length > 0) {
        const imagesToDelete = post.images.map(imageUrl => {
          const urlParts = imageUrl.split('/')
          const fileName = urlParts[urlParts.length - 1]
          return `${user.id}/${fileName}`
        })
        
        await supabase.storage
          .from('post-images')
          .remove(imagesToDelete)
      }

      // Then delete the post from database
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id) // Safety check

      if (error) throw error

      toast.success('Post deleted successfully')
      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    } finally {
      setDeletingPost(null)
    }
  }

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id) // Safety check

      if (error) throw error

      toast.success(`Post status updated to ${newStatus}`)
      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      console.error('Error updating post status:', error)
      toast.error('Failed to update post status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'sold':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-gray-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryById = (categoryId: string) => {
    return categories?.find(cat => cat.id === categoryId)
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return t('category_page.price_on_request')
    return `${price.toLocaleString()} ${currency}`
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.welcome', { name: user?.user_metadata?.full_name || user?.email })}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TagIcon className="h-5 w-5" />
                  <span>{t('dashboard.my_posts')}</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('favorites')
                  fetchFavoritePosts()
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'favorites'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HeartIcon className="h-5 w-5" />
                  <span>{t('favorites.title')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>{t('messages.tab')}</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TagIcon className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{t('dashboard.total_posts')}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{t('dashboard.active_posts')}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{t('dashboard.pending_posts')}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIconSolid className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{t('dashboard.sold_posts')}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.sold}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Management Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">{t('dashboard.my_posts')}</h2>
                  
                  {/* Status Filter */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedStatus === 'all' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('dashboard.all_filter')} ({stats.total})
                    </button>
                    <button
                      onClick={() => setSelectedStatus('approved')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedStatus === 'approved' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('dashboard.active_posts')} ({stats.active})
                    </button>
                    <button
                      onClick={() => setSelectedStatus('pending')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedStatus === 'pending' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('dashboard.pending_posts')} ({stats.pending})
                    </button>
                    <button
                      onClick={() => setSelectedStatus('sold')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedStatus === 'sold' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('dashboard.sold_posts')} ({stats.sold})
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('dashboard.loading_posts')}</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TagIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">
                      {selectedStatus === 'all' ? t('dashboard.no_posts_yet') : t('dashboard.no_status_posts', { status: selectedStatus })}
                    </p>
                    <Link
                      href="/post"
                      className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
                    >
                      {t('dashboard.create_first_post')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                          {/* Images Section */}
                          <div className="flex-shrink-0">
                            {post.images && post.images.length > 0 ? (
                              <div className="flex space-x-2">
                                <img
                                  src={post.images[0]}
                                  alt={post.title}
                                  className="w-24 h-24 object-cover rounded-lg border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/placeholder-image.jpg'
                                  }}
                                />
                                {post.images.length > 1 && (
                                  <div className="flex flex-col space-y-1">
                                    {post.images.slice(1, 3).map((image, idx) => (
                                      <img
                                        key={idx}
                                        src={image}
                                        alt={`${post.title} ${idx + 2}`}
                                        className="w-12 h-12 object-cover rounded border"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.src = '/placeholder-image.jpg'
                                        }}
                                      />
                                    ))}
                                    {post.images.length > 3 && (
                                      <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                        <span className="text-xs text-gray-500">+{post.images.length - 3}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Post Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                  {post.description}
                                </p>
                                
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                    <span className="font-medium text-orange-600">
                                      {formatPrice(post.price, post.currency)}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    <span>{post.city}, {post.country}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <TagIcon className="h-4 w-4 mr-1" />
                                    <span>{getCategoryById(post.category_id) ? getCategoryName(getCategoryById(post.category_id)!) : 'Category'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    <span>{post.views_count} {t('dashboard.views')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center ml-4">
                                {getStatusIcon(post.status)}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                  {t(`dashboard.status_${post.status}`)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-gray-500">
                                {t('dashboard.created')} {getTimeAgo(post.created_at)}
                                {post.updated_at !== post.created_at && (
                                  <span> • {t('dashboard.updated')} {getTimeAgo(post.updated_at)}</span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/posts/${post.id}`}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  {t('dashboard.view')}
                                </Link>
                                <Link
                                  href={`/posts/${post.id}/edit`}
                                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                                >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  {t('dashboard.edit')}
                                </Link>
                                
                                {/* Status Change Dropdown */}
                                <select
                                  value={post.status}
                                  onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                  className="text-sm border rounded px-2 py-1 text-gray-600"
                                >
                                  <option value="pending">{t('dashboard.status_pending')}</option>
                                  <option value="active">{t('dashboard.status_active')}</option>
                                  <option value="sold">{t('dashboard.status_sold')}</option>
                                  <option value="inactive">{t('dashboard.status_inactive')}</option>
                                </select>

                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={deletingPost === post.id}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center disabled:opacity-50"
                                >
                                  <TrashIcon className="h-4 w-4 mr-1" />
                                  {deletingPost === post.id ? t('dashboard.deleting') : t('dashboard.delete')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {/* Favorites Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">{t('favorites.title')}</h2>
                <p className="text-gray-600 mt-1">
                  {favoritePosts.length > 0 
                    ? t('favorites.favoritesCount', { count: favoritePosts.length })
                    : t('favorites.noFavorites')
                  }
                </p>
              </div>

              <div className="p-6">
                {favoritesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading favorites...</p>
                  </div>
                ) : favoritePosts.length === 0 ? (
                  <div className="text-center py-12">
                    <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('favorites.noFavorites')}</h3>
                    <p className="text-gray-500 mb-6">{t('favorites.noFavoritesMessage')}</p>
                    <Link
                      href="/search"
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      <TagIcon className="h-5 w-5 mr-2" />
                      {t('favorites.browsePosts')}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritePosts.map((post) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <div className="bg-white border rounded-lg hover:shadow-md transition-shadow">
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
                            <div className="absolute top-2 right-2">
                              <HeartIconSolid className="h-6 w-6 text-red-500" />
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl font-bold text-orange-600">
                                {post.price ? `${post.price.toLocaleString()} ${post.currency}` : t('posts.price_on_request')}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {post.status}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              <span>{post.city}, {post.country}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            {/* Messages Section */}
            <div className="bg-white rounded-lg shadow-sm border h-[600px] flex">
              {/* Conversations List */}
              <div className={`${selectedConversation ? 'hidden lg:block lg:w-1/3' : 'w-full lg:w-1/3'} border-r`}>
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">{t('messages.tab')}</h2>
                  <p className="text-sm text-gray-600 mt-1">{t('messages.start_messaging_desc')}</p>
                </div>
                <ConversationList
                  onSelectConversation={(conversation) => setSelectedConversation(conversation)}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>

              {/* Chat Window */}
              <div className={`${selectedConversation ? 'flex-1' : 'hidden lg:flex lg:flex-1'} flex flex-col`}>
                {selectedConversation ? (
                  <ChatWindow
                    conversationId={selectedConversation.id}
                    otherUserEmail={selectedConversation.other_participant?.email || undefined}
                    postTitle={selectedConversation.post?.title}
                    onBack={() => setSelectedConversation(null)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('messages.no_conversations')}
                      </h3>
                      <p className="text-sm">{t('messages.start_messaging_desc')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 