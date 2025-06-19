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

  useEffect(() => {
    fetchEntries()
    fetchLives()
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

  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp)
    const today = new Date()
    return entryDate.toDateString() === today.toDateString()
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">管理画面</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">本日のエントリー状況</h2>
            <div className="space-y-2">
              <p>総エントリー数: {todayEntries.length}</p>
              <p>口火ライブ: {todayEntries.filter(e => e.liveType === 'KUCHIBE').length}</p>
              <p>二足のわらじライブ: {todayEntries.filter(e => e.liveType === 'NIWARA').length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">振り分け操作</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ライブタイプ</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'KUCHIBE' | 'NIWARA')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="KUCHIBE">口火ライブ</option>
                  <option value="NIWARA">二足のわらじライブ</option>
                </select>
              </div>
              <button
                onClick={handleAutoAssign}
                disabled={isAssigning}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isAssigning ? '振り分け中...' : '自動振り分け実行'}
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                交番表を確定
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">エントリー一覧</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">時刻</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">タイプ</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">名義1</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">代表者1</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">名義2</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">代表者2</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">メール</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 text-sm">
                      {new Date(entry.timestamp).toLocaleTimeString('ja-JP')}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {entry.liveType === 'KUCHIBE' ? '口火' : '二足'}
                    </td>
                    <td className="px-4 py-2 text-sm">{entry.name1}</td>
                    <td className="px-4 py-2 text-sm">{entry.representative1}</td>
                    <td className="px-4 py-2 text-sm">{entry.name2 || '-'}</td>
                    <td className="px-4 py-2 text-sm">{entry.representative2 || '-'}</td>
                    <td className="px-4 py-2 text-sm">{entry.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}