'use client'

import { CATEGORIES } from '@/constants/categories'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'

interface TemplateFilterProps {
  selectedCategory: string | null
  selectedType: string
  sortBy: string
  onCategoryChange: (category: string | null) => void
  onTypeChange: (type: string) => void
  onSortChange: (sort: string) => void
}

export default function TemplateFilter({
  selectedCategory,
  selectedType,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onSortChange,
}: TemplateFilterProps) {
  return (
    <div className="space-y-4">
      {/* Categories Filter */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Категории
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-white'
                : 'hover:bg-background-light'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              select_all
            </span>
            <span className="text-sm">Все категории</span>
          </button>

          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => onCategoryChange(category.slug)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-primary text-white'
                  : 'hover:bg-background-light'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {category.icon}
              </span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Applicant Type Filter */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Тип заявителя
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedType === 'both'}
              onChange={() => onTypeChange('both')}
            />
            <span className="text-sm">Все</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedType === 'physical'}
              onChange={() => onTypeChange('physical')}
            />
            <span className="text-sm">Физическое лицо</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedType === 'legal'}
              onChange={() => onTypeChange('legal')}
            />
            <span className="text-sm">Юридическое лицо</span>
          </label>
        </div>
      </Card>

      {/* Sort Filter */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Сортировка
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={sortBy === 'popularity'}
              onChange={() => onSortChange('popularity')}
            />
            <span className="text-sm">По популярности</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={sortBy === 'name'}
              onChange={() => onSortChange('name')}
            />
            <span className="text-sm">По алфавиту</span>
          </label>
        </div>
      </Card>
    </div>
  )
}
