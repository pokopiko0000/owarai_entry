'use client'

import { useState, useEffect } from 'react'

type Entry = {
  id: string
  name1: string
  representative1: string
  name2: string | null
  representative2: string | null
  email: string
  liveType: string
  timestamp: string
}

type Live = {
  id: string
  date: string
  type: string
  assignments: Array<{
    id: string
    nameIndex: number
    entry: Entry
  }>
}

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [lives, setLives] = useState<Live[]>([])
  const [selectedType, setSelectedType] = useState<'KUCHIBE' | 'NIWARA'>('KUCHIBE')
  const [isAssigning, setIsAssigning] = useState(false)
  const [activeTab, setActiveTab] = useState<'entries' | 'schedule'>('entries')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    fetchEntries()
    fetchLives()
    setTimeout(() => setShowContent(true), 100)
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/admin/entries')
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    }
  }

  const fetchLives = async () => {
    try {
      const response = await fetch('/api/admin/lives')
      const data = await response.json()
      setLives(data.lives || [])
    } catch (error) {
      console.error('Failed to fetch lives:', error)
    }
  }

  const handleAutoAssign = async () => {
    if (!confirm(`${selectedType === 'KUCHIBE' ? '口火' : '二足のわらじ'}ライブの自動振り分けを実行しますか？`)) {
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch('/api/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liveType: selectedType }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`振り分け完了\n配置: ${result.assignedCount}組\n補欠: ${result.waitingCount}組`)
        fetchLives()
      } else {
        alert('振り分けに失敗しました')
      }
    } catch (error) {
      alert('エラーが発生しました')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleConfirmSchedule = async () => {
    if (!confirm('交番表を確定しますか？')) {
      return
    }

    try {
      const response = await fetch('/api/admin/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('交番表を確定しました')
      } else {
        alert('確定に失敗しました')
      }
    } catch (error) {
      alert('エラーが発生しました')
    }
  }

  const filteredEntries = entries.filter(entry => entry.liveType === selectedType)
  const filteredLives = lives.filter(live => live.type === selectedType)

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            管理画面
          </h1>
          <p className="text-gray-600 text-lg">エントリー管理・振り分け</p>
        </div>

        {/* Live type selector */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">ライブタイプ:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType('KUCHIBE')}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedType === 'KUCHIBE'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  口火ライブ
                </button>
                <button
                  onClick={() => setSelectedType('NIWARA')}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedType === 'NIWARA'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  二足のわらじライブ
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAutoAssign}
                disabled={isAssigning}
                className="btn-primary"
              >
                {isAssigning ? (
                  <span className="loading-dots">
                    振り分け中
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                ) : (
                  '自動振り分け実行'
                )}
              </button>
              <a
                href="/schedule"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-block"
              >
                🎭 香盤表を見る
              </a>
              <button
                onClick={handleConfirmSchedule}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                交番表確定
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('entries')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'entries'
                  ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              エントリー一覧 ({filteredEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'schedule'
                  ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              振り分け結果
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card">
          {activeTab === 'entries' ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {selectedType === 'KUCHIBE' ? '口火' : '二足のわらじ'}ライブ エントリー一覧
              </h2>
              
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500">エントリーがありません</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">受付時刻</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">名義1</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">代表者1</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">名義2</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">代表者2</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">メール</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry, index) => (
                        <tr 
                          key={entry.id} 
                          className="border-b hover:bg-white/50 transition-colors"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td className="py-3 px-4 text-sm">
                            {new Date(entry.timestamp).toLocaleString('ja-JP')}
                          </td>
                          <td className="py-3 px-4 font-medium">{entry.name1}</td>
                          <td className="py-3 px-4">{entry.representative1}</td>
                          <td className="py-3 px-4">{entry.name2 || '-'}</td>
                          <td className="py-3 px-4">{entry.representative2 || '-'}</td>
                          <td className="py-3 px-4 text-sm">{entry.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {selectedType === 'KUCHIBE' ? '口火' : '二足のわらじ'}ライブ 振り分け結果
              </h2>
              
              {filteredLives.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500">振り分け結果がありません</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredLives.map((live, index) => (
                    <div 
                      key={live.id} 
                      className="p-6 bg-white/50 rounded-xl"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {new Date(live.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          selectedType === 'KUCHIBE' 
                            ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                        }`}>
                          {live.assignments.length}組
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {live.assignments.map((assignment, i) => (
                          <div 
                            key={assignment.id} 
                            className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            style={{ animationDelay: `${(index * 0.1) + (i * 0.05)}s` }}
                          >
                            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {assignment.nameIndex}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">
                                {assignment.nameIndex === 1 ? assignment.entry.name1 : assignment.entry.name2}
                              </p>
                              <p className="text-sm text-gray-600">
                                {assignment.nameIndex === 1 ? assignment.entry.representative1 : assignment.entry.representative2}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}