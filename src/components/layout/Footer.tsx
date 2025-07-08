'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img 
                src="/logo_name.png" 
                alt="Nunuza - Your local digital marketplace" 
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connect buyers and sellers across East Africa with our secure, multilingual marketplace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories" className="text-gray-300 transition-colors hover:text-[#D9B70D]">
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 transition-colors hover:text-[#D9B70D]">
                  {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link href="/post" className="text-gray-300 transition-colors hover:text-[#D9B70D]">
                  {t('nav.post_ad')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 transition-colors hover:text-[#D9B70D]">
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 transition-colors hover:text-[#D9B70D]">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 transition-colors hover:text-[#D9B70D]">
                  {t('footer.about')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm">
            {t('footer.copyright')}
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-gray-300 transition-colors text-sm hover:text-[#D9B70D]">
              {t('footer.terms')}
            </Link>
            <Link href="/privacy" className="text-gray-300 transition-colors text-sm hover:text-[#D9B70D]">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 