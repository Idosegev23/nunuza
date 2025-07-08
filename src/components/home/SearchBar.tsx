'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

const SearchBar = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${t('common.search')}...`}
          className="w-full py-4 px-6 pr-14 text-lg border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-4 text-white rounded-lg transition-colors"
        style={{ backgroundColor: '#D9B70D' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BF8D30'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9B70D'}
        >
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  )
}

export default SearchBar 