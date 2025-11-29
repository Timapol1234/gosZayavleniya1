import html2pdf from 'html2pdf.js'

export interface PDFOptions {
  filename?: string
  margin?: number | [number, number] | [number, number, number, number]
  image?: {
    type?: 'jpeg' | 'png' | 'webp'
    quality?: number
  }
  html2canvas?: {
    scale?: number
    useCORS?: boolean
  }
  jsPDF?: {
    unit?: string
    format?: string
    orientation?: 'portrait' | 'landscape'
  }
}

/**
 * Генерирует PDF из HTML элемента
 */
export async function generatePDF(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<Blob> {
  const defaultOptions = {
    margin: 0, // Убираем margins т.к. они уже есть в элементе
    filename: options.filename || 'document.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return html2pdf()
    .set(mergedOptions)
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf: any) => {
      return pdf.output('blob')
    })
}

/**
 * Генерирует и скачивает PDF
 */
export async function downloadPDF(
  element: HTMLElement,
  filename: string = 'document.pdf'
): Promise<void> {
  const options: PDFOptions = {
    filename,
    margin: 0, // Убираем margins т.к. они уже есть в элементе
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  await html2pdf().set(options).from(element).save()
}
