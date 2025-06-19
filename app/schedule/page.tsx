import { prisma } from '@/lib/db'

async function getSchedule() {
  const lives = await prisma.live.findMany({
    where: {
      date: {
        gte: new Date()
      }
    },
    include: {
      assignments: {
        include: {
          entry: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  return lives
}

export default async function SchedulePage() {
  const lives = await getSchedule()
  
  const kuchibeeLives = lives.filter(live => live.type === 'KUCHIBE')
  const niwaraLives = lives.filter(live => live.type === 'NIWARA')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">交番表</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">口火ライブ</h2>
            <div className="space-y-4">
              {kuchibeeLives.length === 0 ? (
                <p className="text-gray-600">現在表示できる交番表はありません</p>
              ) : (
                kuchibeeLives.map(live => (
                  <div key={live.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold mb-2">
                      {live.date.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </h3>
                    <div className="space-y-1">
                      {live.assignments.length === 0 ? (
                        <p className="text-sm text-gray-600">出演者未定</p>
                      ) : (
                        live.assignments.map((assignment, index) => (
                          <div key={assignment.id} className="text-sm">
                            {index + 1}. {assignment.nameIndex === 1 
                              ? assignment.entry.name1 
                              : assignment.entry.name2}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">二足のわらじライブ</h2>
            <div className="space-y-4">
              {niwaraLives.length === 0 ? (
                <p className="text-gray-600">現在表示できる交番表はありません</p>
              ) : (
                niwaraLives.map(live => (
                  <div key={live.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold mb-2">
                      {live.date.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </h3>
                    <div className="space-y-1">
                      {live.assignments.length === 0 ? (
                        <p className="text-sm text-gray-600">出演者未定</p>
                      ) : (
                        live.assignments.map((assignment, index) => (
                          <div key={assignment.id} className="text-sm">
                            {index + 1}. {assignment.nameIndex === 1 
                              ? assignment.entry.name1 
                              : assignment.entry.name2}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}