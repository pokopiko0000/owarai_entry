import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { autoAssignEntries } from '@/lib/assignment'
import { LiveType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { liveType } = await request.json()
    
    if (!liveType || !['KUCHIBE', 'NIWARA'].includes(liveType)) {
      return NextResponse.json(
        { error: '無効なライブタイプです' },
        { status: 400 }
      )
    }
    
    const result = await autoAssignEntries(liveType as LiveType)
    
    await prisma.$transaction(
      result.assignments.map(assignment =>
        prisma.assignment.create({
          data: assignment
        })
      )
    )
    
    return NextResponse.json({
      success: true,
      assignedCount: result.assignments.length,
      waitingCount: result.waitingList.length
    })
  } catch (error) {
    console.error('Assignment error:', error)
    return NextResponse.json(
      { error: '振り分けに失敗しました' },
      { status: 500 }
    )
  }
}