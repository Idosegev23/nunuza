'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  category: string
}

export default function ContactPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t('contact.required_fields'))
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
      toast.success(t('contact.success_message'))
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      })
    } catch (error) {
      toast.error(t('contact.error_message'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: t('contact.phone'),
      value: '+256 (0) 200 123 456',
      link: 'tel:+256200123456'
    },
    {
      icon: EnvelopeIcon,
      title: t('contact.email'),
      value: 'support@nunuza.com',
      link: 'mailto:support@nunuza.com'
    },
    {
      icon: MapPinIcon,
      title: t('contact.address'),
      value: 'Kampala, Uganda',
      link: null
    },
    {
      icon: ChatBubbleLeftIcon,
      title: t('contact.whatsapp'),
      value: '+256 (0) 200 123 456',
      link: 'https://wa.me/256200123456'
    }
  ]

  const businessHours = [
    { day: t('contact.monday_friday'), hours: '9:00 AM - 6:00 PM' },
    { day: t('contact.saturday'), hours: '10:00 AM - 4:00 PM' },
    { day: t('contact.sunday'), hours: t('contact.closed') }
  ]

  const categories = [
    { value: 'general', label: t('contact.general_inquiry') },
    { value: 'technical', label: t('contact.technical_support') },
    { value: 'billing', label: t('contact.billing_payment') },
    { value: 'report', label: t('contact.report_issue') },
    { value: 'partnership', label: t('contact.business_partnership') },
    { value: 'feedback', label: t('contact.feedback_suggestion') }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.get_in_touch')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contact.send_message')}
            </h2>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('contact.message_sent')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('contact.response_time')}
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-white px-6 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#2D4B73' }}
                >
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.full_name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4B73] focus:border-transparent"
                      placeholder={t('contact.enter_name')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4B73] focus:border-transparent"
                      placeholder={t('contact.enter_email')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.phone')} ({t('common.optional')})
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4B73] focus:border-transparent"
                    placeholder={t('contact.enter_phone')}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.inquiry_type')} *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4B73] focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.subject')} *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4B73] focus:border-transparent"
                    placeholder={t('contact.enter_subject')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4B73] focus:border-transparent resize-none"
                    placeholder={t('contact.enter_message')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#D9B70D' }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#BF8D30')}
                  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#D9B70D')}
                >
                  {isSubmitting ? t('contact.sending') : t('contact.send_message')}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {t('contact.contact_information')}
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f4f8' }}>
                        <item.icon className="h-6 w-6" style={{ color: '#2D4B73' }} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="text-gray-600 hover:text-[#2D4B73] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-600">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {t('contact.business_hours')}
              </h3>
              
              <div className="space-y-4">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700 font-medium">{schedule.day}</span>
                    </div>
                    <span className="text-gray-600">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-[#2D4B73] to-[#253C59] rounded-lg p-8 text-white">
              <h3 className="text-xl font-semibold mb-4">
                {t('contact.need_quick_help')}
              </h3>
              <p className="text-gray-100 mb-6">
                {t('contact.faq_description')}
              </p>
              <button
                className="bg-white text-[#2D4B73] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('contact.view_faq')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 