import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // テスト環境用の時間制限チェック
    const now = new Date()
    const testDate = new Date('2025-06-20T17:50:00')
    const testEndDate = new Date('2025-06-20T19:00:00')
    
    // テスト時間内またはNODE_ENVがdevelopmentの場合は許可
    if (process.env.NODE_ENV === 'production' && !(now >= testDate && now < testEndDate)) {
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      data: data
    })
    return NextResponse.json(
      { 
        error: 'エントリーの作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}