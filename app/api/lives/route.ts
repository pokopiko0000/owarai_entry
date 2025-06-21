import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // テスト用: 2025年7月のライブデータを取得
    const lives = await prisma.live.findMany({
      where: {
        date: {
          gte: new Date('2025-07-01'),
          lt: new Date('2025-08-01')
        }
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    const dates = lives.map(live => 
      live.date.toLocaleDateString('ja-JP', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }).replace('2025年', '')
    )
    
    // フォールバック用のテストデータ
    if (dates.length === 0) {
      const fallbackDates = [
        '7月5日(土)',
        '7月8日(火)',
        '7月10日(木)',
        '7月12日(土)',
        '7月15日(火)',
        '7月17日(木)',
        '7月19日(土)',
        '7月22日(火)',
        '7月24日(木)',
        '7月26日(土)'
      ]
      return NextResponse.json({ dates: fallbackDates })
    }
    
    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Failed to fetch lives:', error)
    // エラー時もフォールバックデータを返す
    const fallbackDates = [
      '7月5日(土)',
      '7月8日(火)',
      '7月10日(木)',
      '7月12日(土)',
      '7月15日(火)',
      '7月17日(木)',
      '7月19日(土)',
      '7月22日(火)',
      '7月24日(木)',
      '7月26日(土)'
    ]
    return NextResponse.json({ dates: fallbackDates })
  }
}