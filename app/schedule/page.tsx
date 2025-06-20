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
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            交番表
          </h1>
          <p className="text-gray-600 text-lg">出演スケジュール一覧</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 口火ライブ */}
          <div className="space-y-6">
            <div className="glass-card">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
                  </svg>
                </span>
                口火ライブ
              </h2>
              
              {kuchibeeLives.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500">現在表示できる交番表はありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {kuchibeeLives.map((live, index) => (
                    <div
                      key={live.id}
                      className="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {live.date.toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-sm font-medium">
                          {live.assignments.length}組
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {live.assignments.map((assignment, i) => (
                          <span
                            key={assignment.id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            style={{ animationDelay: `${(index * 0.1) + (i * 0.05)}s` }}
                          >
                            {assignment.entry.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 二足のわらじライブ */}
          <div className="space-y-6">
            <div className="glass-card">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </span>
                二足のわらじライブ
              </h2>
              
              {niwaraLives.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500">現在表示できる交番表はありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {niwaraLives.map((live, index) => (
                    <div
                      key={live.id}
                      className="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {live.date.toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium">
                          {live.assignments.length}組
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {live.assignments.map((assignment, i) => (
                          <span
                            key={assignment.id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            style={{ animationDelay: `${(index * 0.1) + (i * 0.05)}s` }}
                          >
                            {assignment.entry.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}