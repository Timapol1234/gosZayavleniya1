'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateFilter from '@/components/templates/TemplateFilter'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import { debounce } from '@/lib/utils'
import type { Template } from '@/types/template'

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

function TemplatesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [templates, setTemplates] = useState<Template[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [selectedType, setSelectedType] = useState(
    searchParams.get('type') || 'both'
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity')
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  )

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedType !== 'both') params.append('type', selectedType)
      params.append('sort', sortBy)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', currentPage.toString())

      const response = await fetch(`/api/templates?${params.toString()}`)
      const data = await response.json()

      setTemplates(data.templates)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedType, sortBy, searchQuery, currentPage])

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.append('category', selectedCategory)
    if (selectedType !== 'both') params.append('type', selectedType)
    if (sortBy !== 'popularity') params.append('sort', sortBy)
    if (searchQuery) params.append('search', searchQuery)
    if (currentPage > 1) params.append('page', currentPage.toString())

    router.push(`/templates?${params.toString()}`, { scroll: false })
  }, [selectedCategory, selectedType, sortBy, searchQuery, currentPage, router])

  // Debounced search
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchTemplates()
    }, 500),
    [fetchTemplates]
  )

  useEffect(() => {
    updateURL()
    debouncedFetch()
  }, [selectedCategory, selectedType, sortBy, searchQuery, currentPage])

  // Filter handlers
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <MainLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">
            Шаблоны заявлений
          </h1>
          <p className="text-text-secondary">
            Выберите подходящий шаблон из нашей коллекции
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon="search"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <TemplateFilter
                selectedCategory={selectedCategory}
                selectedType={selectedType}
                sortBy={sortBy}
                onCategoryChange={handleCategoryChange}
                onTypeChange={handleTypeChange}
                onSortChange={handleSortChange}
              />
            </div>
          </aside>

          {/* Templates grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-text-secondary">Загрузка шаблонов...</p>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined mb-4 text-6xl text-text-secondary">
                  search_off
                </span>
                <p className="text-xl text-text-secondary">
                  Шаблоны не найдены
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Попробуйте изменить фильтры или поисковый запрос
                </p>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-text-secondary">
                  Найдено шаблонов: {pagination.total}
                </div>

                {/* Templates grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="container-custom py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-text-secondary">Загрузка...</p>
              </div>
            </div>
          </div>
        </MainLayout>
      }
    >
      <TemplatesContent />
    </Suspense>
  )
}
