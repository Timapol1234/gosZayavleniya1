export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  TEXTAREA: 'textarea',
} as const

export const FIELD_TYPE_LABELS = {
  [FIELD_TYPES.TEXT]: 'Текстовое поле',
  [FIELD_TYPES.NUMBER]: 'Числовое поле',
  [FIELD_TYPES.DATE]: 'Дата',
  [FIELD_TYPES.SELECT]: 'Выпадающий список',
  [FIELD_TYPES.TEXTAREA]: 'Многострочное поле',
} as const
