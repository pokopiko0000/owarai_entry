import { PrismaClient, LiveType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // テスト用ライブデータの作成
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // 口火ライブ（月10-15回）
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth, i + 10)
    await prisma.live.create({
      data: {
        date: date,
        type: LiveType.KUCHIBE,
        capacity: 10
      }
    })
  }
  
  // 二足のわらじライブ（月4回）
  for (let i = 0; i < 4; i++) {
    const date = new Date(currentYear, currentMonth, (i * 7) + 5)
    await prisma.live.create({
      data: {
        date: date,
        type: LiveType.NIWARA,
        capacity: 17
      }
    })
  }
  
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })