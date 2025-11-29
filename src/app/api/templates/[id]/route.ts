import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates/[id] - Получить конкретный шаблон
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.template.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
      include: {
        category: true,
        formFields: {
          orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Шаблон не найден' },
        { status: 404 }
      )
    }

    // Парсим JSON поля из строк (SQLite limitation)
    const processedTemplate = {
      ...template,
      tags: template.tags ? template.tags.split(',') : [],
      contentJson:
        typeof template.contentJson === 'string'
          ? JSON.parse(template.contentJson)
          : template.contentJson,
      formFields: template.formFields.map((field) => ({
        ...field,
        options: field.options ? field.options.split(',') : [],
        validationRules:
          typeof field.validationRules === 'string'
            ? JSON.parse(field.validationRules)
            : field.validationRules,
      })),
    }

    return NextResponse.json(processedTemplate)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении шаблона' },
      { status: 500 }
    )
  }
}
