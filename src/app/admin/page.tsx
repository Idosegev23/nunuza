'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useCategories } from '@/hooks/useCategories'
import { supabase } from '@/lib/supabase'
import { addTestData } from '@/lib/test-data'
import toast from 'react-hot-toast'
import { 
  UserPlusIcon, 
  TrashIcon, 
  ShieldCheckIcon,
  UsersIcon,
  PresentationChartBarIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CogIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'

interface Admin {
  id: string
  email: string
  full_name: string
  created_at: string
  is_super_admin: boolean
}

interface PendingPost {
  id: string
  title: string
  description: string
  price: number | null
  currency: string
  category_id: string
  country: string
  city: string
  images: string[] | null
  created_at: string
  user_id: string
  author?: {
    full_name: string
    email: string
  }
}

interface AdminStats {
  users: number
  posts: number
  categories: number
  pendingPosts: number
}

const AdminPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { getCategoryName, categories } = useCategories()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [processingPostId, setProcessingPostId] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [initializingData, setInitializingData] = useState(false)

  // Helper function to get category by ID
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user || !user.email) {
        router.push('/')
        return
      }
      
      // Check if user is admin (with error handling)
      try {
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('is_super_admin')
          .eq('email', user.email)
          .single()
        
        if (error || !adminData) {
          console.log('Admin access check failed, redirecting to home')
          router.push('/')
          return
        }
        
        loadAdmins()
        loadPendingPosts()
        fetchStats() // Fetch stats on admin access
      } catch (error) {
        console.log('Admin table not accessible, redirecting to home')
        router.push('/')
      }
    }
    
    checkAdminAccess()
  }, [user, router])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      
      const { data: adminsData, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.log('Admins table not found or error:', error)
        setAdmins([])
        return
      }
      
      setAdmins(adminsData || [])
    } catch (error) {
      console.log('Admin loading failed:', error)
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  const loadPendingPosts = async () => {
    try {
      setPendingLoading(true)
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.log('Posts loading failed:', error)
        setPendingPosts([])
        return
      }
      
      setPendingPosts(postsData || [])
    } catch (error) {
      console.log('Pending posts loading failed:', error)
      setPendingPosts([])
    } finally {
      setPendingLoading(false)
    }
  }

  const handlePostApproval = async (postId: string, approve: boolean) => {
    setProcessingPostId(postId)
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: approve ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
      
      if (error) throw error
      
      // Remove from pending list
      setPendingPosts(pendingPosts.filter(post => post.id !== postId))
      
      toast.success(approve ? t('admin.post_approved') : t('admin.post_rejected'))
    } catch (error) {
      toast.error(t('admin.approval_error'))
      console.error('Error processing approval:', error)
    } finally {
      setProcessingPostId(null)
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return t('category_page.price_on_request')
    return `${price.toLocaleString()} ${currency}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than 1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!newAdminEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setAdding(true)
    
    try {
      // Check if already admin
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', newAdminEmail.trim())
        .single()
      
      if (existingAdmin) {
        toast.error('This email is already an admin')
        return
      }
      
      // Add new admin
      const { data: newAdmin, error } = await supabase
        .from('admins')
        .insert([
          {
            email: newAdminEmail.trim(),
            full_name: 'New Admin',
            is_super_admin: false,
            granted_by: admins.find(a => a.email === user?.email)?.id
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      
      setAdmins([newAdmin, ...admins])
      setNewAdminEmail('')
      toast.success(`${newAdminEmail} has been added as an admin`)
    } catch (error) {
      toast.error('Failed to add admin')
      console.error('Error adding admin:', error)
    } finally {
      setAdding(false)
    }
  }

  const removeAdmin = async (adminId: string, email: string) => {
    if (email === 'triroars@gmail.com') {
      toast.error('Cannot remove super admin')
      return
    }

    if (confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      try {
        const { error } = await supabase
          .from('admins')
          .delete()
          .eq('id', adminId)
        
        if (error) throw error
        
        setAdmins(admins.filter(admin => admin.id !== adminId))
        toast.success(`${email} has been removed as an admin`)
      } catch (error) {
        toast.error('Failed to remove admin')
        console.error('Error removing admin:', error)
      }
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)

      const [usersResult, postsResult, categoriesResult, pendingResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        users: usersResult.count || 0,
        posts: postsResult.count || 0,
        categories: categoriesResult.count || 0,
        pendingPosts: pendingResult.count || 0
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      toast.error('Failed to load admin statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleInitializeTestData = async () => {
    setInitializingData(true)
    toast.loading('Initializing test data...')

    try {
      const result = await addTestData()
      
      if (result.success) {
        toast.dismiss()
        toast.success('Test data initialized successfully!')
        fetchStats() // Refresh stats
      } else {
        toast.dismiss()
        toast.error('Failed to initialize test data: ' + (String(result.error) || 'Unknown error'))
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Error initializing test data')
      console.error('Test data error:', error)
    } finally {
      setInitializingData(false)
    }
  }

  const handleTestCategories = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, slug, name_en, is_active, posts_count')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      console.log('Categories test:', categories)
      toast.success(`Found ${categories?.length || 0} active categories`)
      
      // Test electronics category specifically
      const electronics = categories?.find(cat => cat.slug === 'electronics')
      if (electronics) {
        toast.success('✅ Electronics category found and active')
      } else {
        toast.error('❌ Electronics category not found')
      }
    } catch (error) {
      console.error('Categories test error:', error)
      toast.error('Failed to test categories')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('admin.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('admin.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8" style={{ color: '#D9B70D' }} />
              <span className="text-lg font-semibold" style={{ color: '#2D4B73' }}>
                {t('admin.super_admin')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0f4f8' }}>
                <UsersIcon className="h-8 w-8" style={{ color: '#2D4B73' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.total_users')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0f4f8' }}>
                <DocumentTextIcon className="h-8 w-8" style={{ color: '#D9B70D' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.total_posts')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.posts.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0f4f8' }}>
                <DocumentTextIcon className="h-8 w-8" style={{ color: '#FF6B6B' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.pending_posts')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.pendingPosts || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0f4f8' }}>
                <PresentationChartBarIcon className="h-8 w-8" style={{ color: '#BF8D30' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.this_month')}</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Pending Approval */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('admin.posts_pending_approval')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve or reject user posts
            </p>
          </div>

          <div className="px-6 py-4">
            {pendingLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#2D4B73' }}></div>
                <p className="text-gray-600">Loading pending posts...</p>
              </div>
            ) : pendingPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">{t('admin.no_pending_posts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                      {/* Images Section */}
                      <div className="flex-shrink-0">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={post.images[0]}
                            alt={post.title}
                            className="w-24 h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-image.jpg'
                            }}
                          />
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
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                <span>{getCategoryById(post.category_id) ? getCategoryName(getCategoryById(post.category_id)!) : t('admin.category')}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{t('admin.created_by')}: {post.author?.full_name || post.author?.email || 'Unknown'}</span>
                              <span>•</span>
                              <span>{getTimeAgo(post.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/posts/${post.id}`)}
                          className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>{t('admin.view_post')}</span>
                        </button>
                        
                        <button
                          onClick={() => handlePostApproval(post.id, true)}
                          disabled={processingPostId === post.id}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>{processingPostId === post.id ? t('admin.approving') : t('admin.approve')}</span>
                        </button>
                        
                        <button
                          onClick={() => handlePostApproval(post.id, false)}
                          disabled={processingPostId === post.id}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          <span>{processingPostId === post.id ? t('admin.rejecting') : t('admin.reject')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Management */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('admin.admin_management')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('admin.admin_management_subtitle')}
            </p>
          </div>

          {/* Add Admin Form */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label htmlFor="newAdmin" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.add_new_admin')}
                </label>
                <input
                  type="email"
                  id="newAdmin"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder={t('admin.enter_email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D4B73' } as any}
                  onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
                />
              </div>
              <button
                onClick={addAdmin}
                disabled={adding}
                className="flex items-center space-x-2 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#D9B70D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>{adding ? t('admin.adding') : t('admin.add_admin')}</span>
              </button>
            </div>
          </div>

          {/* Admins List */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#2D4B73' }}></div>
                <p className="text-gray-600">{t('admin.loading_admins')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full" style={{ backgroundColor: '#f0f4f8' }}>
                        <ShieldCheckIcon className="h-6 w-6" style={{ color: admin.is_super_admin ? '#D9B70D' : '#2D4B73' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {admin.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        <p className="text-xs text-gray-500">
                          {admin.is_super_admin ? t('admin.super_admin') : t('admin.admin')} • {t('admin.added')} {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!admin.is_super_admin && (
                      <button
                        onClick={() => removeAdmin(admin.id, admin.email)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            onClick={() => router.push('/admin/users')}
          >
            <UsersIcon className="h-8 w-8 mx-auto mb-2" style={{ color: '#2D4B73' }} />
            <p className="font-medium text-gray-900">{t('admin.manage_users')}</p>
          </button>

          <button 
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            onClick={() => router.push('/admin/posts')}
          >
            <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" style={{ color: '#D9B70D' }} />
            <p className="font-medium text-gray-900">{t('admin.manage_posts')}</p>
          </button>

          <button 
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            onClick={() => router.push('/admin/reports')}
          >
            <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2" style={{ color: '#BF8D30' }} />
            <p className="font-medium text-gray-900">{t('admin.view_reports')}</p>
          </button>

          <button 
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            onClick={() => router.push('/admin/analytics')}
          >
            <PresentationChartBarIcon className="h-8 w-8 mx-auto mb-2" style={{ color: '#99B4BF' }} />
            <p className="font-medium text-gray-900">{t('admin.analytics')}</p>
          </button>
        </div>

        {/* Database Management */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Database Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Initialize Test Data</h4>
                  <p className="text-sm text-gray-600">
                    Add sample categories and posts for testing the platform
                  </p>
                </div>
                <button
                  onClick={handleInitializeTestData}
                  disabled={initializingData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                                     <CircleStackIcon className="h-4 w-4 mr-2" />
                  {initializingData ? 'Initializing...' : 'Initialize Data'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Test Categories</h4>
                  <p className="text-sm text-gray-600">
                    Verify that all categories are properly configured and active
                  </p>
                </div>
                <button
                  onClick={handleTestCategories}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Test Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage 