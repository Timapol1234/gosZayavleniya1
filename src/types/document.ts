import type { Template } from './template'

export type DocumentStatus = 'draft' | 'generated'

export interface Document {
  id: string
  userId: string
  templateId: string
  template?: Template
  title: string
  status: DocumentStatus
  filledData: Record<string, any>
  pdfUrl?: string
  createdAt: Date
  updatedAt: Date
}
