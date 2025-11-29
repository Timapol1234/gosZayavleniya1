import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total documents count
    const totalDocuments = await prisma.document.count()

    // Get documents by status
    const documentsByStatus = await prisma.document.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    // Get popular templates (top 5)
    const popularTemplates = await prisma.document.groupBy({
      by: ['templateId'],
      _count: {
        templateId: true,
      },
      orderBy: {
        _count: {
          templateId: 'desc',
        },
      },
      take: 5,
    })

    // Fetch template details for popular templates
    const templateIds = popularTemplates.map((item) => item.templateId)
    const templates = await prisma.template.findMany({
      where: {
        id: {
          in: templateIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    })

    const popularTemplatesWithDetails = popularTemplates.map((item) => {
      const template = templates.find((t) => t.id === item.templateId)
      return {
        templateId: item.templateId,
        templateTitle: template?.title || 'Unknown',
        count: item._count.templateId,
      }
    })

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    const recentDocuments = await prisma.document.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    // Get documents created per day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const documentsPerDay = await prisma.$queryRaw<
      Array<{ date: string; count: number }>
    >`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM Document
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `

    // Convert BigInt to Number for JSON serialization
    const serializedDocumentsPerDay = documentsPerDay.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        totalDocuments,
        recentUsers,
        recentDocuments,
      },
      documentsByStatus: documentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      popularTemplates: popularTemplatesWithDetails,
      documentsPerDay: serializedDocumentsPerDay,
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
