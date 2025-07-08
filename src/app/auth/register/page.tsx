'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Please select a country'),
  city: z.string().min(1, 'Please select a city'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type RegisterForm = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((state) => state.setUser)

  const countries = [
    { code: 'UG', name: 'Uganda' },
    { code: 'KE', name: 'Kenya' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BI', name: 'Burundi' }
  ]

  const cities = {
    UG: ['Kampala', 'Entebbe', 'Gulu', 'Mbarara', 'Jinja'],
    KE: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
    TZ: ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya'],
    RW: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi'],
    BI: ['Bujumbura', 'Gitega', 'Muyinga', 'Ruyigi', 'Kayanza']
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const selectedCountry = watch('country')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone || null,
            country: data.country,
            city: data.city
          }
        }
      })

      if (error) throw error

      if (authData.user) {
        setUser(authData.user)
        toast.success(t('auth.register_success'))
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || t('auth.register_failed'))
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || t('auth.google_signin_failed'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.already_have_account')}{' '}
            <Link href="/auth/login" className="font-medium transition-colors hover:text-[#253C59]" style={{ color: '#2D4B73' }}>
              {t('auth.login')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                {t('auth.full_name')}
              </label>
              <input
                {...register('fullName')}
                type="text"
                autoComplete="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
                placeholder={t('auth.full_name')}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
                placeholder={t('auth.email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('auth.phone')} ({t('common.optional')})
              </label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
                placeholder={t('auth.phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                {t('common.country')}
              </label>
              <select
                {...register('country')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
              >
                <option value="">{t('common.select_country')}</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                {t('common.city')}
              </label>
              <select
                {...register('city')}
                disabled={!selectedCountry}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm disabled:bg-gray-100"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
              >
                <option value="">{t('common.select_city')}</option>
                {selectedCountry && cities[selectedCountry as keyof typeof cities]?.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
                placeholder={t('auth.password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirm_password')}
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                style={{ '--tw-ring-color': '#2D4B73' } as any}
                onFocus={(e) => e.target.style.borderColor = '#2D4B73'}
                placeholder={t('auth.confirm_password')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                className="h-4 w-4 border-gray-300 rounded focus:ring-2"
                style={{ '--tw-ring-color': '#2D4B73', accentColor: '#2D4B73' } as any}
              />
              <label className="ml-2 block text-sm text-gray-900">
                {t('auth.agree_to')}{' '}
                <Link href="/terms" className="transition-colors hover:text-[#253C59]" style={{ color: '#2D4B73' }}>
                  {t('auth.terms_and_conditions')}
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#D9B70D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">{t('auth.or')}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('auth.register_with_google')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage 