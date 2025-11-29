/**
 * Подставляет данные пользователя в HTML шаблон
 * Заменяет все вхождения {{variableName}} на соответствующие значения из filledData
 */
export function renderTemplate(
  htmlTemplate: string,
  filledData: Record<string, any>
): string {
  // Проверка на существование шаблона
  if (!htmlTemplate || typeof htmlTemplate !== 'string') {
    console.error('Invalid htmlTemplate:', htmlTemplate)
    return '<p>Шаблон документа не найден</p>'
  }

  let result = htmlTemplate

  // Заменяем все переменные вида {{variableName}}
  Object.entries(filledData).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    const displayValue = value !== null && value !== undefined ? String(value) : ''
    result = result.replace(regex, displayValue)
  })

  // Заменяем незаполненные переменные на пустую строку или placeholder
  result = result.replace(/{{(\w+)}}/g, (match, variableName) => {
    return `<span class="text-gray-400 italic">[${variableName}]</span>`
  })

  return result
}

/**
 * Извлекает все переменные из HTML шаблона
 * Возвращает массив имен переменных без дубликатов
 */
export function extractTemplateVariables(htmlTemplate: string): string[] {
  if (!htmlTemplate || typeof htmlTemplate !== 'string') {
    return []
  }

  const regex = /{{(\w+)}}/g
  const variables = new Set<string>()
  let match

  while ((match = regex.exec(htmlTemplate)) !== null) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Проверяет, все ли переменные в шаблоне заполнены
 */
export function validateTemplateData(
  htmlTemplate: string,
  filledData: Record<string, any>
): {
  isValid: boolean
  missingVariables: string[]
} {
  if (!htmlTemplate || typeof htmlTemplate !== 'string') {
    return {
      isValid: false,
      missingVariables: [],
    }
  }

  const variables = extractTemplateVariables(htmlTemplate)
  const missingVariables = variables.filter(
    (variable) =>
      filledData[variable] === null ||
      filledData[variable] === undefined ||
      filledData[variable] === ''
  )

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  }
}
