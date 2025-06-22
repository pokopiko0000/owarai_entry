import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const lives = await prisma.live.findMany({
      include: {
        assignments: {
          include: {
            entry: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    return NextResponse.json({ lives })
  } catch (error) {
    console.error('Failed to fetch lives:', error)
    return NextResponse.json({ lives: [] }, { status: 500 })
  }
}