'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

export interface Category {
  id: string
  slug: string
  name_en: string
  name_fr: string
  name_sw: string
  icon: string
  color: string
  posts_count: number
  is_active: boolean
  sort_order: number
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (category: Category) => {
    const lang = i18n.language || 'en'
    switch (lang) {
      case 'fr':
        return category.name_fr
      case 'sw':
        return category.name_sw
      default:
        return category.name_en
    }
  }

  const getCategoryBySlug = (slug: string) => {
    return categories.find(cat => cat.slug === slug)
  }

  return {
    categories,
    loading,
    error,
    getCategoryName,
    getCategoryBySlug,
    refetch: fetchCategories
  }
} 