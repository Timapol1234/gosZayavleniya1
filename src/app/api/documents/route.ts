import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/documents - Создать новый черновик документа
export async function POST(req: NextRequest) {
  console.log('[POST /api/documents] Request received')
  try {
    const session = await getServerSession(authOptions)
    console.log('[POST /api/documents] Session:', session?.user?.email || 'No session')

    if (!session?.user?.email) {
      console.log('[POST /api/documents] No session, returning 401')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('[POST /api/documents] Finding user...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      console.log('[POST /api/documents] User not found, returning 404')
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    console.log('[POST /api/documents] User found:', user.id)
    const body = await req.json()
    console.log('[POST /api/documents] Body:', body)
    const { templateId, title, filledData } = body

    // Проверяем, что шаблон существует
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Шаблон не найден' },
        { status: 404 }
      )
    }

    // Создаем черновик документа
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        templateId,
        title: title || template.title,
        filledData: JSON.stringify(filledData || {}),
        status: 'draft',
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании документа' },
      { status: 500 }
    )
  }
}

// GET /api/documents - Получить все документы пользователя
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
        ...(search && {
          title: {
            contains: search,
          },
        }),
      },
      include: {
        template: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении документов' },
      { status: 500 }
    )
  }
}
