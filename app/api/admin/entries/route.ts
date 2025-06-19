import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })
    
    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Failed to fetch entries:', error)
    return NextResponse.json({ entries: [] }, { status: 500 })
  }
}