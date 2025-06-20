import { prisma } from '@/lib/db'
import { Entry, Live, LiveType } from '@prisma/client'

type AssignmentResult = {
  assignments: {
    entryId: string
    liveId: string
    nameIndex: number
  }[]
  waitingList: string[]
}

export async function autoAssignEntries(liveType: LiveType): Promise<AssignmentResult> {
  console.log('🔍 Starting assignment for liveType:', liveType)
  
  // Check if time restrictions should be disabled (for testing/development)
  const disableTimeRestriction = process.env.NODE_ENV === 'test' || 
                                process.env.DISABLE_TIME_RESTRICTION === 'true'
  
  console.log('⏰ Time restriction disabled:', disableTimeRestriction)
  
  const whereClause: any = {
    liveType
  }
  
  // Only apply time restrictions in production environment
  if (!disableTimeRestriction) {
    whereClause.createdAt = {
      gte: new Date(new Date().setHours(22, 0, 0, 0)),
      lt: new Date(new Date().setHours(22, 30, 0, 0))
    }
  }
  
  const entries = await prisma.entry.findMany({
    where: whereClause,
    orderBy: {
      timestamp: 'asc'
    }
  })

  const lives = await prisma.live.findMany({
    where: {
      type: liveType,
      date: {
        gte: new Date()
      }
    },
    include: {
      assignments: true
    }
  })
  
  console.log('📊 Found entries:', entries.length)
  console.log('🎭 Found lives:', lives.length)
  
  // Debug: Show live dates format
  lives.forEach(live => {
    const liveDate = live.date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    }).replace('2025年', '')
    console.log('📅 Live date formatted:', liveDate, 'from', live.date)
  })

  const result: AssignmentResult = {
    assignments: [],
    waitingList: []
  }

  const capacityMap = new Map<string, number>()
  const assignedPerLive = new Map<string, number>()
  const assignedNames = new Set<string>()
  const assignedRepresentatives = new Map<string, number>()

  lives.forEach(live => {
    const capacity = liveType === 'KUCHIBE' ? 10 : 17
    capacityMap.set(live.id, capacity)
    assignedPerLive.set(live.id, live.assignments.length)
  })

  for (const entry of entries) {
    console.log('🎪 Processing entry:', entry.name1, 'preferences:', [entry.preference1_1, entry.preference1_2, entry.preference1_3].filter(Boolean))
    
    let assigned1 = false
    let assigned2 = false

    const preferences1 = [
      entry.preference1_1,
      entry.preference1_2,
      entry.preference1_3
    ].filter(Boolean)

    for (const pref of preferences1) {
      if (assigned1) break

      const live = lives.find(l => {
        const liveDate = l.date.toLocaleDateString('ja-JP', {
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        }).replace('2025年', '')
        return liveDate === pref
      })

      if (!live) continue

      const currentCount = assignedPerLive.get(live.id) || 0
      const capacity = capacityMap.get(live.id) || 0
      const repCount = assignedRepresentatives.get(entry.representative1) || 0

      if (
        currentCount < capacity &&
        !assignedNames.has(entry.name1) &&
        repCount < 2
      ) {
        result.assignments.push({
          entryId: entry.id,
          liveId: live.id,
          nameIndex: 1
        })
        assignedPerLive.set(live.id, currentCount + 1)
        assignedNames.add(entry.name1)
        assignedRepresentatives.set(entry.representative1, repCount + 1)
        assigned1 = true
      }
    }

    if (entry.entryNumber === 2 && entry.name2 && entry.representative2) {
      const preferences2 = [
        entry.preference2_1,
        entry.preference2_2,
        entry.preference2_3
      ].filter(Boolean)

      for (const pref of preferences2) {
        if (assigned2) break

        const live = lives.find(l => {
          const liveDate = l.date.toLocaleDateString('ja-JP', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          }).replace('2025年', '')
          return liveDate === pref
        })

        if (!live) continue

        const currentCount = assignedPerLive.get(live.id) || 0
        const capacity = capacityMap.get(live.id) || 0
        const repCount = assignedRepresentatives.get(entry.representative2) || 0

        if (
          currentCount < capacity &&
          !assignedNames.has(entry.name2) &&
          repCount < 2
        ) {
          result.assignments.push({
            entryId: entry.id,
            liveId: live.id,
            nameIndex: 2
          })
          assignedPerLive.set(live.id, currentCount + 1)
          assignedNames.add(entry.name2)
          assignedRepresentatives.set(entry.representative2, repCount + 1)
          assigned2 = true
        }
      }
    }

    if (!assigned1 && !assigned2) {
      result.waitingList.push(entry.id)
    }
  }

  return result
}