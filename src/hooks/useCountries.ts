'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

export interface Country {
  id: string
  code: string
  name_en: string
  name_fr: string
  name_sw: string
  default_currency: string
  default_language: 'en' | 'fr' | 'sw'
  timezone: string
  phone_prefix: string
  is_active: boolean
}

export interface City {
  id: string
  country_id: string
  name: string
  latitude?: number
  longitude?: number
  posts_count: number
  is_active: boolean
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch countries
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name_en')

      if (countriesError) throw countriesError

      // Fetch cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (citiesError) throw citiesError

      setCountries(countriesData || [])
      setCities(citiesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const getCountryName = (country: Country) => {
    const lang = i18n.language || 'en'
    switch (lang) {
      case 'fr':
        return country.name_fr
      case 'sw':
        return country.name_sw
      default:
        return country.name_en
    }
  }

  const getCountryByCode = (code: string) => {
    return countries.find(country => country.code === code)
  }

  const getCitiesByCountryId = (countryId: string) => {
    return cities.filter(city => city.country_id === countryId)
  }

  const getCitiesByCountryCode = (countryCode: string) => {
    const country = getCountryByCode(countryCode)
    if (!country) return []
    return getCitiesByCountryId(country.id)
  }

  return {
    countries,
    cities,
    loading,
    error,
    getCountryName,
    getCountryByCode,
    getCitiesByCountryId,
    getCitiesByCountryCode,
    refetch: fetchData
  }
} 