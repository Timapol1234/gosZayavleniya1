'use client'

import { useState, useRef, useEffect } from 'react'
import { renderTemplate } from '@/lib/templateRenderer'

interface DocumentPreviewProps {
  htmlTemplate: string
  filledData: Record<string, any>
  onContentChange?: (newContent: string) => void
  editable?: boolean
}

export function DocumentPreview({
  htmlTemplate,
  filledData,
  onContentChange,
  editable = false,
}: DocumentPreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  // Рендерим шаблон с данными
  useEffect(() => {
    const html = renderTemplate(htmlTemplate, filledData)
    setRenderedHtml(html)
  }, [htmlTemplate, filledData])

  // Обработчик изменений при редактировании
  const handleContentChange = () => {
    if (editable && contentRef.current && onContentChange) {
      onContentChange(contentRef.current.innerHTML)
    }
  }

  return (
    <div
      ref={contentRef}
      className="document-preview"
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={handleContentChange}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      style={{
        width: '210mm', // A4 width
        maxWidth: '210mm',
        minHeight: '100px',
        margin: '0 auto',
        padding: '20mm 15mm', // A4 margins
        backgroundColor: 'white',
        boxShadow: editable ? '0 0 10px rgba(0,0,0,0.1)' : 'none',
        fontFamily: 'Times New Roman, serif',
        fontSize: '12pt',
        lineHeight: '1.5',
      }}
    />
  )
}
