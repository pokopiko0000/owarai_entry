import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 簡易認証チェック
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer owarai2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count = 30, liveType = 'KUCHIBE' } = await request.json()

    // 既存のテストエントリーを削除（テスト用のみ）
    await prisma.entry.deleteMany({
      where: {
        lineUrl: {
          contains: 'test'
        }
      }
    })

    // テスト用ライブ日程
    const testDates = [
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

    // テスト用コンビ名
    const testNames = [
      'お笑いマスターズ', 'コメディキングス', 'ラフメーカーズ', 'ジョークボンバーズ', 'ガグファクトリー',
      'スマイルブラザーズ', 'ハッピーデュオ', 'ドリームコメディ', 'サニーサイド', 'ミラクルツインズ',
      'フレッシュコンビ', 'エナジーパートナーズ', 'クレイジーデュオ', 'ファニーメイツ', 'ワンダーペア',
      'チャーミングコンビ', 'ブライトスターズ', 'ハッピーエンド', 'ジョイフルコンビ', 'ラッキーチャンス',
      'マジックコンビ', 'サプライズデュオ', 'グッドタイムズ', 'フレンドリーコンビ', 'ナイスガイズ',
      'ポジティブペア', 'グレートコンビ', 'アメージングデュオ', 'ファンタスティック', 'エクセレント',
      '新人コンビA', '新人コンビB', '新人コンビC', '新人コンビD', '新人コンビE',
      '新人コンビF', '新人コンビG', '新人コンビH', '新人コンビI', '新人コンビJ'
    ]

    // テスト用代表者名
    const testRepresentatives = [
      'テスト田中太郎', 'テスト佐藤花子', 'テスト鈴木一郎', 'テスト高橋美咲', 'テスト伊藤健太',
      'テスト渡辺由美', 'テスト山本浩二', 'テスト中村愛', 'テスト小林大輔', 'テスト加藤真理',
      'テスト吉田和也', 'テスト山田麻衣', 'テスト松本隆', 'テスト井上美穂', 'テスト木村拓也',
      'テスト林綾子', 'テスト森田剛', 'テスト清水恵子', 'テスト山口誠', 'テスト橋本直美',
      'テスト石川達也', 'テスト斎藤美香', 'テスト後藤健', 'テスト坂田優子', 'テスト三浦信之',
      'テスト野村千恵', 'テスト神田正男', 'テスト菊地沙織', 'テスト長谷川進', 'テスト福田真由美'
    ]

    const testEntries = []

    for (let i = 0; i < count; i++) {
      const entryNumber = Math.random() > 0.7 ? 2 : 1 // 30%の確率で2つエントリー

      // 第1希望を必ず設定、第2,3希望はランダム
      const preferences = [
        testDates[Math.floor(Math.random() * testDates.length)],
        Math.random() > 0.3 ? testDates[Math.floor(Math.random() * testDates.length)] : null,
        Math.random() > 0.6 ? testDates[Math.floor(Math.random() * testDates.length)] : null
      ]

      const entry = {
        entryNumber,
        name1: testNames[i % testNames.length] + (i > testNames.length ? `${Math.floor(i / testNames.length)}` : ''),
        representative1: testRepresentatives[i % testRepresentatives.length],
        preference1_1: preferences[0],
        preference1_2: preferences[1],
        preference1_3: preferences[2],
        name2: entryNumber === 2 ? `${testNames[(i + 10) % testNames.length]}セカンド` : null,
        representative2: entryNumber === 2 ? testRepresentatives[(i + 10) % testRepresentatives.length] : null,
        preference2_1: entryNumber === 2 ? testDates[Math.floor(Math.random() * testDates.length)] : null,
        preference2_2: entryNumber === 2 && Math.random() > 0.3 ? testDates[Math.floor(Math.random() * testDates.length)] : null,
        preference2_3: entryNumber === 2 && Math.random() > 0.6 ? testDates[Math.floor(Math.random() * testDates.length)] : null,
        lineUrl: `https://line.me/ti/p/test${i + 1}`,
        liveType,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)) // 過去1時間以内のランダムなタイムスタンプ
      }

      testEntries.push(entry)
    }

    // バッチでエントリー作成
    const createdEntries = await prisma.$transaction(
      testEntries.map(entry => prisma.entry.create({ data: entry }))
    )

    return NextResponse.json({
      success: true,
      created: createdEntries.length,
      message: `${count}件のテストエントリーを作成しました`
    })

  } catch (error) {
    console.error('Test entry creation error:', error)
    return NextResponse.json(
      { error: 'テストエントリーの作成に失敗しました' },
      { status: 500 }
    )
  }
}