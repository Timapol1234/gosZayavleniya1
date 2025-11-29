import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/documents/[id] - Получить конкретный документ
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        template: {
          include: {
            formFields: {
              orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
            },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении документа' },
      { status: 500 }
    )
  }
}

// PATCH /api/documents/[id] - Обновить черновик документа
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json()
    const { filledData, title, status } = body

    // Проверяем, что документ принадлежит пользователю
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    // Обновляем документ
    const document = await prisma.document.update({
      where: {
        id: params.id,
      },
      data: {
        ...(filledData && { filledData: JSON.stringify(filledData) }),
        ...(title && { title }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении документа' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Удалить документ
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Проверяем, что документ принадлежит пользователю
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    // Удаляем документ
    await prisma.document.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении документа' },
      { status: 500 }
    )
  }
}
