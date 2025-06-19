import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // 開発環境では時間制限をスキップ
    if (process.env.NODE_ENV === 'production') {
      const now = new Date()
      const day = now.getDate()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      if (!((day === 1 || day === 10) && hour === 22 && minute < 30)) {
        return NextResponse.json(
          { error: 'エントリー受付時間外です' },
          { status: 400 }
        )
      }
    }
    
    const entry = await prisma.entry.create({
      data: {
        entryNumber: parseInt(data.entryNumber),
        name1: data.name1,
        representative1: data.representative1,
        preference1_1: data.preference1_1 || null,
        preference1_2: data.preference1_2 || null,
        preference1_3: data.preference1_3 || null,
        name2: data.name2 || null,
        representative2: data.representative2 || null,
        preference2_1: data.preference2_1 || null,
        preference2_2: data.preference2_2 || null,
        preference2_3: data.preference2_3 || null,
        email: data.email,
        liveType: data.liveType,
      },
    })
    
    return NextResponse.json({ success: true, id: entry.id })
  } catch (error) {
    console.error('Entry creation error:', error)
    return NextResponse.json(
      { error: 'エントリーの作成に失敗しました' },
      { status: 500 }
    )
  }
}