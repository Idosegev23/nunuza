'use client'

import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import {
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useCategories } from '@/hooks/useCategories'
import { useCountries } from '@/hooks/useCountries'
import toast from 'react-hot-toast'

const editPostSchema = z.object({
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

type EditPostFormData = z.infer<typeof editPostSchema>

const EditPostPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const postId = params.id as string

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const { categories, getCategoryName } = useCategories()
  const { countries, getCountryName, getCitiesByCountryCode } = useCountries()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema)
  })

  const selectedCountry = watch('country')
  const conditions = ['new', 'like_new', 'good', 'fair', 'poor']

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single()

        if (error) throw error

        if (!user || data.user_id !== user.id) {
          toast.error('You can only edit your own posts')
          router.push('/dashboard')
          return
        }

        setPost(data)
        setExistingImages(data.images || [])

        // Set form values
        setValue('title', data.title)
        setValue('description', data.description)
        setValue('price', data.price)
        setValue('currency', data.currency)
        setValue('category', data.category_id)
        setValue('condition', data.condition)
        setValue('country', data.country)
        setValue('city', data.city)
        setValue('area', data.area || '')
        setValue('contactPhone', data.contact_phone || '')
        setValue('contactWhatsapp', data.contact_whatsapp || '')
        setValue('contactEmail', data.contact_email || '')
        setValue('negotiable', data.is_negotiable)

      } catch (error) {
        console.error('Error loading post:', error)
        toast.error('Failed to load post')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (postId && user) {
      loadPost()
    }
  }, [postId, user, router, setValue])

  const handleNewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const newImageFiles = [...newImages, ...files]
    setNewImages(newImageFiles)

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setNewImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index)
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index)
    setNewImages(updatedImages)
    setNewImagePreviews(updatedPreviews)
  }

  const markExistingImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl])
  }

  const unmarkExistingImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl))
  }

  const uploadNewImages = async (images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const image of images) {
      try {
        const imageId = uuidv4()
        const fileExtension = image.name.split('.').pop()
        const fileName = `${user!.id}/${imageId}.${fileExtension}`
        
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
    
    return uploadedUrls
  }

  const deleteImages = async (imageUrls: string[]) => {
    for (const imageUrl of imageUrls) {
      try {
        // Extract filename from URL
        const urlParts = imageUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const fullPath = `${user!.id}/${fileName}`
        
        const { error } = await supabase.storage
          .from('post-images')
          .remove([fullPath])
        
        if (error) {
          console.error('Error deleting image:', error)
        }
      } catch (error) {
        console.error('Unexpected error deleting image:', error)
      }
    }
  }

  const onSubmit = async (data: EditPostFormData) => {
    if (!user || !post) return

    setIsSubmitting(true)
    
    try {
      let finalImageUrls: string[] = []
      
      // Start with existing images that are not marked for deletion
      finalImageUrls = existingImages.filter(url => !imagesToDelete.includes(url))
      
      // Upload new images if any
      if (newImages.length > 0) {
        setUploadingImages(true)
        toast.loading('Uploading new images...')
        const newImageUrls = await uploadNewImages(newImages)
        finalImageUrls = [...finalImageUrls, ...newImageUrls]
        setUploadingImages(false)
        toast.dismiss()
      }

      // Delete marked images
      if (imagesToDelete.length > 0) {
        await deleteImages(imagesToDelete)
      }

      // Update post in database
      const { error } = await supabase
        .from('posts')
        .update({
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          category_id: data.category,
          condition: data.condition,
          is_negotiable: data.negotiable,
          images: finalImageUrls,
          country: data.country,
          city: data.city,
          area: data.area || null,
          contact_method: data.contactPhone ? 'phone' : data.contactWhatsapp ? 'whatsapp' : 'email',
          contact_phone: data.contactPhone || null,
          contact_whatsapp: data.contactWhatsapp || null,
          contact_email: data.contactEmail || user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      if (error) {
        console.error('Error updating post:', error)
        toast.error('Failed to update post. Please try again.')
        return
      }

      toast.success('Post updated successfully!')
      router.push(`/posts/${postId}`)
      
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error(t('posts.failed_to_update'))
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-8 py-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('common.edit')} {t('posts.post_ad')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('posts.update_listing_details')}
                </p>
              </div>
              <button
                onClick={() => router.push(`/posts/${postId}`)}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
            {/* Images Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-6 w-6 mr-2 text-orange-500" />
                Images
              </h2>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Current ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg border ${
                            imagesToDelete.includes(imageUrl) 
                              ? 'opacity-50 border-red-500' 
                              : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (imagesToDelete.includes(imageUrl)) {
                              unmarkExistingImageForDeletion(imageUrl)
                            } else {
                              markExistingImageForDeletion(imageUrl)
                            }
                          }}
                          className={`absolute top-2 right-2 p-1 rounded-full ${
                            imagesToDelete.includes(imageUrl)
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          } hover:opacity-80`}
                        >
                          {imagesToDelete.includes(imageUrl) ? (
                            <PlusIcon className="h-4 w-4" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                        {imagesToDelete.includes(imageUrl) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-red-600 font-semibold">Will be deleted</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">New Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-green-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="new-images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Add new images
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Maximum 5 images total
                      </span>
                    </label>
                    <input
                      id="new-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleNewImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Rest of the form - Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('posts.price')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('negotiable')}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Price is negotiable</span>
                </label>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push(`/posts/${postId}`)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditPostPage 