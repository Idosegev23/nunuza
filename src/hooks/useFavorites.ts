import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-hot-toast'

interface Favorite {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

interface FavoritePost {
  id: string
  title: string
  price?: number
  currency: string
  images: string[]
  created_at: string
  status: string
  category_id: string
  city: string
  country: string
}

export const useFavorites = () => {
  const { user } = useAuthStore()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoritePosts, setFavoritePosts] = useState<FavoritePost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user's favorites
  const fetchFavorites = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFavorites(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }

  // Get user's favorite posts with post details
  const fetchFavoritePosts = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          posts (
            id,
            title,
            price,
            currency,
            images,
            created_at,
            status,
            category_id,
            city,
            country
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Properly type and filter the nested data
      const posts = data?.map((fav: any) => fav.posts).filter((post: any) => post !== null) || []
      setFavoritePosts(posts as FavoritePost[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorite posts')
    } finally {
      setLoading(false)
    }
  }

  // Check if a post is favorited
  const isFavorited = (postId: string) => {
    return favorites.some(fav => fav.post_id === postId)
  }

  // Add to favorites
  const addToFavorites = async (postId: string) => {
    if (!user) {
      toast.error('You must be logged in to add favorites')
      return false
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          post_id: postId
        }])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setFavorites(prev => [...prev, data])
      
      // TODO: Update post favorites count when RPC function is available
      // await supabase.rpc('increment_favorites_count', { post_id: postId })
      
      toast.success('Added to favorites')
      return true
    } catch (err) {
      console.error('Error adding to favorites:', err)
      toast.error('Failed to add to favorites')
      return false
    }
  }

  // Remove from favorites
  const removeFromFavorites = async (postId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)

      if (error) throw error

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.post_id !== postId))
      setFavoritePosts(prev => prev.filter(post => post.id !== postId))
      
      // TODO: Update post favorites count when RPC function is available
      // await supabase.rpc('decrement_favorites_count', { post_id: postId })
      
      toast.success('Removed from favorites')
      return true
    } catch (err) {
      console.error('Error removing from favorites:', err)
      toast.error('Failed to remove from favorites')
      return false
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (postId: string) => {
    if (isFavorited(postId)) {
      return await removeFromFavorites(postId)
    } else {
      return await addToFavorites(postId)
    }
  }

  // Get favorites count for user
  const getFavoritesCount = () => {
    return favorites.length
  }

  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      setFavorites([])
      setFavoritePosts([])
    }
  }, [user])

  return {
    favorites,
    favoritePosts,
    loading,
    error,
    isFavorited,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getFavoritesCount,
    fetchFavorites,
    fetchFavoritePosts
  }
}

// Hook specifically for checking if a single post is favorited (optimized)
export const usePostFavorite = (postId: string) => {
  const { user } = useAuthStore()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkFavoriteStatus = async () => {
    if (!user || !postId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setIsFavorited(!!data)
    } catch (err) {
      console.error('Error checking favorite status:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('You must be logged in to add favorites')
      return false
    }

    setLoading(true)
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)

        if (error) throw error
        
        // TODO: Update post favorites count when RPC function is available
        // await supabase.rpc('decrement_favorites_count', { post_id: postId })
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            post_id: postId
          }])

        if (error) throw error
        
        // TODO: Update post favorites count when RPC function is available
        // await supabase.rpc('increment_favorites_count', { post_id: postId })
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
      return true
    } catch (err) {
      console.error('Error toggling favorite:', err)
      toast.error('Failed to update favorites')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkFavoriteStatus()
  }, [user, postId])

  return {
    isFavorited,
    loading,
    toggleFavorite
  }
} 