'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type EntryForm = {
  entryNumber: '1' | '2'
  name1: string
  representative1: string
  preference1_1: string
  preference1_2: string
  preference1_3: string
  name2: string
  representative2: string
  preference2_1: string
  preference2_2: string
  preference2_3: string
  email: string
  liveType: 'KUCHIBE' | 'NIWARA'
}

export default function EntryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<EntryForm>({
    entryNumber: '1',
    name1: '',
    representative1: '',
    preference1_1: '',
    preference1_2: '',
    preference1_3: '',
    name2: '',
    representative2: '',
    preference2_1: '',
    preference2_2: '',
    preference2_3: '',
    email: '',
    liveType: 'KUCHIBE'
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEntryOpen, setIsEntryOpen] = useState(false)
  const [dates, setDates] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      const day = now.getDate()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      if ((day === 1 || day === 10) && hour === 22 && minute < 30) {
        setIsEntryOpen(true)
        setFormData(prev => ({
          ...prev,
          liveType: day === 1 ? 'KUCHIBE' : 'NIWARA'
        }))
      } else {
        setIsEntryOpen(false)
      }
    }, 1000)

    fetchLiveDates()
    
    return () => clearInterval(timer)
  }, [])

  const fetchLiveDates = async () => {
    try {
      const response = await fetch('/api/lives')
      const data = await response.json()
      setDates(data.dates || [])
    } catch (error) {
      console.error('Failed to fetch live dates:', error)
    }
  }

  const canSubmit = () => {
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    return hour === 22 && minute >= 0 && minute < 30
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit()) {
      alert('エントリー受付時間外です')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/complete')
      } else {
        alert('エントリーの送信に失敗しました')
      }
    } catch (error) {
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isEntryOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">お笑い劇場エントリーシステム</h1>
          <p className="text-lg">現在エントリー受付時間外です</p>
          <p className="text-sm text-gray-600 mt-2">
            口火ライブ: 毎月1日 22:00-22:30<br />
            二足のわらじライブ: 毎月10日 22:00-22:30
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          {formData.liveType === 'KUCHIBE' ? '口火ライブ' : '二足のわらじライブ'} エントリーフォーム
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-center text-lg font-semibold">
            現在時刻: {currentTime.toLocaleTimeString('ja-JP')}
          </p>
          <p className="text-center text-sm text-gray-600">
            エントリー受付時間: 22:00:00 - 22:30:00
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">エントリー数</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="entryNumber"
                  value="1"
                  checked={formData.entryNumber === '1'}
                  onChange={handleChange}
                  className="mr-2"
                />
                1つ
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="entryNumber"
                  value="2"
                  checked={formData.entryNumber === '2'}
                  onChange={handleChange}
                  className="mr-2"
                />
                2つ
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">名義1</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">名義名 *</label>
                <input
                  type="text"
                  name="name1"
                  value={formData.name1}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">代表者名 *</label>
                <input
                  type="text"
                  name="representative1"
                  value={formData.representative1}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">第1希望</label>
                <select
                  name="preference1_1"
                  value={formData.preference1_1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選択してください</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">第2希望</label>
                <select
                  name="preference1_2"
                  value={formData.preference1_2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選択してください</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">第3希望</label>
                <select
                  name="preference1_3"
                  value={formData.preference1_3}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選択してください</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {formData.entryNumber === '2' && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-4">名義2</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">名義名 *</label>
                  <input
                    type="text"
                    name="name2"
                    value={formData.name2}
                    onChange={handleChange}
                    required={formData.entryNumber === '2'}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">代表者名 *</label>
                  <input
                    type="text"
                    name="representative2"
                    value={formData.representative2}
                    onChange={handleChange}
                    required={formData.entryNumber === '2'}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">第1希望</label>
                  <select
                    name="preference2_1"
                    value={formData.preference2_1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">選択してください</option>
                    {dates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">第2希望</label>
                  <select
                    name="preference2_2"
                    value={formData.preference2_2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">選択してください</option>
                    {dates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">第3希望</label>
                  <select
                    name="preference2_3"
                    value={formData.preference2_3}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">選択してください</option>
                    {dates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <div>
              <label className="block text-sm font-medium mb-1">連絡先メールアドレス *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !canSubmit()}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : 'エントリーする'}
          </button>
        </form>
      </div>
    </div>
  )
}