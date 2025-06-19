import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const lives = await prisma.live.findMany({
      where: {
        date: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1)
        }
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    const dates = lives.map(live => 
      live.date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      })
    )
    
    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Failed to fetch lives:', error)
    return NextResponse.json({ dates: [] })
  }
}