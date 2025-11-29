import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Template } from '@/types/template'

interface TemplateCardProps {
  template: Template
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link href={`/create/${template.id}`}>
      <Card hoverable className="h-full transition-all hover:shadow-lg">
        <div className="flex flex-col gap-3">
          {/* Header with category icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {template.category && (
                <span className="material-symbols-outlined text-2xl text-primary">
                  {template.category.icon}
                </span>
              )}
              <Badge variant="secondary" className="text-xs">
                {template.category?.name}
              </Badge>
            </div>

            {/* Applicant type badge */}
            <Badge
              variant={template.applicantType === 'physical' ? 'primary' : 'secondary'}
              className="text-xs"
            >
              {template.applicantType === 'physical'
                ? 'Физ. лицо'
                : template.applicantType === 'legal'
                ? 'Юр. лицо'
                : 'Оба'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
            {template.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-text-secondary line-clamp-3 flex-grow">
            {template.description}
          </p>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-background-light px-2 py-1 text-xs text-text-secondary"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="rounded-full bg-background-light px-2 py-1 text-xs text-text-secondary">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Popularity indicator */}
          {template.popularityScore > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>Популярный шаблон</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
