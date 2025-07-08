'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Post {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number | null
  currency: string
  is_negotiable: boolean
  condition: string
  images: string[]
  country: string
  city: string
  area: string | null
  contact_method: string
  contact_phone: string | null
  contact_whatsapp: string | null
  contact_email: string | null
  status: 'pending' | 'approved' | 'sold' | 'rejected'
  views_count: number
  favorites_count: number
  created_at: string
  updated_at: string
  // Add user relationship
  users?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    country: string | null
    city: string | null
    created_at: string
  }
}

export interface PostFilters {
  search?: string
  category_id?: string
  min_price?: number
  max_price?: number
  condition?: string
  city?: string
  country?: string
  status?: string
}

export const usePosts = (filters?: PostFilters) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!filters) {
      setLoading(false)
      return
    }

    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('posts')
          .select(`
            *,
            users:user_id (
              id,
              email,
              full_name,
              avatar_url,
              country,
              city,
              created_at
            )
          `)
          .order('created_at', { ascending: false })

        // Apply filters
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id)
        }
        if (filters.min_price !== undefined) {
          query = query.gte('price', filters.min_price)
        }
        if (filters.max_price !== undefined) {
          query = query.lte('price', filters.max_price)
        }
        if (filters.condition) {
          query = query.eq('condition', filters.condition)
        }
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`)
        }
        if (filters.country) {
          query = query.eq('country', filters.country)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        } else {
          // Default to only approved posts for public viewing
          query = query.eq('status', 'approved')
        }

        const { data, error } = await query

        if (error) throw error

        setPosts(data || [])
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch posts')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [filters])

  return { posts, loading, error }
}

// New hook for user's own posts
export const useUserPosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    sold: 0,
    inactive: 0
  })

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchUserPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const userPosts = data || []
        setPosts(userPosts)

        // Calculate stats
        const newStats = {
          total: userPosts.length,
          active: userPosts.filter(p => p.status === 'approved').length,
          pending: userPosts.filter(p => p.status === 'pending').length,
          sold: userPosts.filter(p => p.status === 'sold').length,
          inactive: userPosts.filter(p => p.status === 'rejected').length
        }
        setStats(newStats)

      } catch (err) {
        console.error('Error fetching user posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch user posts')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserPosts()
  }, [userId])

  return { posts, loading, error, stats }
} 