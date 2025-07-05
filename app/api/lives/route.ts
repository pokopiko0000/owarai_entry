import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const liveType = searchParams.get('type') || 'KUCHIBE'
  
  try {
    console.log('Lives API - Requested type:', liveType)
    
    // 指定されたライブタイプの全ライブデータを取得
    const lives = await prisma.live.findMany({
      where: {
        type: liveType as 'KUCHIBE' | 'NIWARA'
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    console.log(`Lives API - Found ${lives.length} lives for type ${liveType}`)
    
    const dates = lives.map(live => {
      const dateStr = live.date.toLocaleDateString('ja-JP', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
      
      // 時間範囲を追加
      const startTime = live.date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const duration = live.type === 'KUCHIBE' ? 60 : 90
      const endDate = new Date(live.date.getTime() + duration * 60 * 1000)
      const endTime = endDate.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      return `${dateStr} ${startTime}〜${endTime}`
    })
    
    console.log('Lives API - Formatted dates:', dates)
    
    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Lives API Error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // エラー時は空の配列を返す
    return NextResponse.json({ dates: [] })
  }
}