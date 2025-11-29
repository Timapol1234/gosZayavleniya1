export type ApplicantType = 'physical' | 'legal' | 'both'

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea'

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
  order: number
}

export interface FormField {
  id: string
  templateId: string
  fieldName: string
  fieldType: FieldType
  label: string
  placeholder?: string
  validationRules?: Record<string, any>
  stepNumber: number
  order: number
  isRequired: boolean
  options?: string[] // Для select полей
}

export interface Template {
  id: string
  title: string
  description: string
  categoryId: string
  category?: Category
  contentJson: Record<string, any>
  isActive: boolean
  popularityScore: number
  tags: string[]
  applicantType: ApplicantType
  formFields?: FormField[]
  createdAt: Date
  updatedAt: Date
}
