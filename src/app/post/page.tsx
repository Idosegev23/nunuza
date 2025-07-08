'use client'

import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  PhotoIcon,
  XMarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useCategories } from '@/hooks/useCategories'
import { useCountries } from '@/hooks/useCountries'
import toast from 'react-hot-toast'

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  negotiable: z.boolean()
})

type PostFormData = z.infer<typeof postSchema>

const PostAdPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Get categories and countries from hooks
  const { categories, getCategoryName } = useCategories()
  const { countries, getCountryName, getCitiesByCountryCode } = useCountries()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      currency: 'USD',
      negotiable: false
    }
  })

  const selectedCountry = watch('country')

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      toast.error(t('posts.must_login_to_post'))
      router.push('/auth/login')
    }
  }, [user, router])

  const conditions = ['new', 'like_new', 'good', 'fair', 'poor']

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + images.length > 5) {
      alert(t('posts.max_images_error'))
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const uploadImagesToSupabase = async (images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    for (const image of images) {
      try {
        const imageId = uuidv4()
        const fileExtension = image.name.split('.').pop()
        const fileName = `${user.id}/${imageId}.${fileExtension}`
        
        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Error uploading image:', error)
          toast.error(`Failed to upload image: ${error.message}`)
          continue
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(publicUrl)
      } catch (error) {
        console.error('Unexpected error uploading image:', error)
        toast.error('Unexpected error occurred while uploading image')
      }
    }
    
    if (uploadedUrls.length === 0 && images.length > 0) {
      throw new Error('Failed to upload any images')
    }
    
    return uploadedUrls
  }

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toast.error('You must be logged in to post an ad')
      return
    }

    setIsSubmitting(true)
    
    try {
      let imageUrls: string[] = []
      
      // Upload images if any
      if (images.length > 0) {
        setUploadingImages(true)
        toast.loading('Uploading images...')
        imageUrls = await uploadImagesToSupabase(images)
        setUploadingImages(false)
        toast.dismiss()
        
        if (imageUrls.length === 0) {
          toast.error('Failed to upload images. Please try again.')
          return
        }
      }

      // Create post in database
      const postId = uuidv4()
      const { data: postData, error } = await supabase
        .from('posts')
        .insert([
          {
            id: postId,
            user_id: user.id,
            category_id: data.category,
            title: data.title,
            description: data.description,
            price: data.price,
            currency: data.currency,
            is_negotiable: data.negotiable,
            condition: data.condition,
            images: imageUrls,
            country: data.country,
            city: data.city,
            area: data.area || null,
            contact_method: data.contactPhone ? 'phone' : data.contactWhatsapp ? 'whatsapp' : 'email',
            contact_phone: data.contactPhone || null,
            contact_whatsapp: data.contactWhatsapp || null,
            contact_email: data.contactEmail || user.email,
            status: 'pending',
            views_count: 0,
            favorites_count: 0
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating post:', error)
        toast.error('Failed to create post. Please try again.')
        return
      }

      toast.success('Post created successfully! It will be reviewed before going live.')
      router.push(`/posts/${postId}`)
      
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(t('posts.failed_to_create'))
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-8 py-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('posts.post_ad')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('posts.create_new_listing')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-orange-500" />
                {t('posts.basic_information')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.title')} *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={t('posts.title_placeholder')}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.description')} *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={t('posts.description_placeholder')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.category')} *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a category</option>
                    {categories?.map(category => (
                      <option key={category.id} value={category.id}>
                        {getCategoryName(category)}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.condition')} *
                  </label>
                  <select
                    {...register('condition')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select condition</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {t(`conditions.${condition}`)}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 mr-2 text-orange-500" />
                Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.price')} *
                  </label>
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.currency')} *
                  </label>
                  <select
                    {...register('currency')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="USD">USD</option>
                    <option value="UGX">UGX</option>
                    <option value="KES">KES</option>
                    <option value="TZS">TZS</option>
                    <option value="EUR">EUR</option>
                  </select>
                  {errors.currency && (
                    <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                  )}
                </div>

                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('negotiable')}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {t('posts.negotiable')}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-orange-500" />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.country')} *
                  </label>
                  <select
                    {...register('country')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>
                        {t(`countries.${country.code}`)}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.city')} *
                  </label>
                  <select
                    {...register('city')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={!selectedCountry}
                  >
                    <option value="">Select city</option>
                    {selectedCountry && getCitiesByCountryCode(selectedCountry)?.map(city => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.area')} (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('area')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Specific area or neighborhood"
                  />
                </div>
              </div>
            </section>

            {/* Images */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-6 w-6 mr-2 text-orange-500" />
                Images (Maximum 5)
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="cursor-pointer">
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-500 transition-colors">
                      <div className="text-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Add Photo</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PhoneIcon className="h-6 w-6 mr-2 text-orange-500" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register('contactPhone')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+256 700 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    {...register('contactWhatsapp')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+256 700 000 000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('contactEmail')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="your@email.com"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-8 border-t">
              <p className="text-sm text-gray-600">
                {t('posts.terms_agreement')}
              </p>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#D9B70D' }}
                onMouseEnter={(e) => !isSubmitting && !uploadingImages && (e.currentTarget.style.backgroundColor = '#BF8D30')}
                onMouseLeave={(e) => !isSubmitting && !uploadingImages && (e.currentTarget.style.backgroundColor = '#D9B70D')}
              >
                {uploadingImages ? t('posts.uploading_images') : isSubmitting ? t('posts.publishing') : t('posts.publish_listing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostAdPage 