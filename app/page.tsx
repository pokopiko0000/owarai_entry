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
  lineUrl: string
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
    lineUrl: '',
    liveType: 'KUCHIBE'
  })
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEntryOpen, setIsEntryOpen] = useState(false)
  const [dates, setDates] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [timeUntilOpen, setTimeUntilOpen] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      // 本番仕様: 毎月1日と10日の22:00-22:30
      const day = now.getDate()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      // フォーム表示条件: 毎月1日と10日は常に表示
      const isFormDay = day === 1 || day === 10
      
      // ボタン押下可能条件: 22:00-22:30のみ
      if (isFormDay && hour === 22 && minute < 30) {
        setIsEntryOpen(true)
        setTimeUntilOpen('')
      } else if (isFormDay && hour < 22) {
        setIsEntryOpen(false)
        // 22時までのカウントダウン
        const targetTime = new Date(now)
        targetTime.setHours(22, 0, 0, 0)
        const diff = targetTime.getTime() - now.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeUntilOpen(`${hours}時間${minutes}分${seconds}秒`)
      } else {
        setIsEntryOpen(false)
        setTimeUntilOpen('')
      }
    }, 1000)

    fetchLiveDates()
    setTimeout(() => setShowForm(true), 100)
    
    return () => clearInterval(timer)
  }, [])

  const fetchLiveDates = async () => {
    // 2025年7月の口火ライブ開催日（テスト用）
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
    setDates(testDates)
  }

  const canSubmit = () => {
    if (!currentTime) return false
    const day = currentTime.getDate()
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    // 毎月1日と10日の22:00-22:30のみ送信可能
    return (day === 1 || day === 10) && hour === 22 && minute < 30
  }

  // まだマウントされていない場合はローディング表示
  if (!mounted || !currentTime) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted, currentTime:', currentTime)
    console.log('canSubmit():', canSubmit())
    
    if (!canSubmit()) {
      alert('エントリー受付時間外です')
      return
    }

    // 必須項目チェック
    if (!formData.name1 || !formData.representative1 || !formData.email || !formData.liveType) {
      alert('必須項目が入力されていません')
      return
    }

    console.log('Time check passed, submitting...')
    setIsSubmitting(true)

    try {
      console.log('Submitting form data:', formData)
      
      const response = await fetch('/api/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.text()
      console.log('Response status:', response.status)
      console.log('Response data:', responseData)

      if (response.ok) {
        router.push('/complete')
      } else {
        let errorMessage = 'エントリーの送信に失敗しました'
        try {
          const errorData = JSON.parse(responseData)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (parseError) {
          errorMessage += `\nステータス: ${response.status}\nレスポンス: ${responseData}`
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert(`エラーが発生しました: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // フォーム表示条件をチェック
  const day = currentTime?.getDate() || 0
  const isFormDay = day === 1 || day === 10
  
  if (!isFormDay) {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className={`text-center px-4 transition-all duration-1000 ${showForm ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="glass-card max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              お笑い劇場エントリーシステム
            </h1>
            
            <div className="mb-8">
              <p className="text-2xl font-semibold text-gray-800 mb-4">現在エントリー受付時間外です</p>
              
              {timeUntilOpen && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">次回エントリー開始まで</p>
                  <p className="text-3xl font-bold text-purple-600 font-mono">{timeUntilOpen}</p>
                </div>
              )}
              
              <div className="bg-white/50 rounded-xl p-6 text-left">
                <h2 className="font-bold text-lg mb-3 text-gray-800">エントリー受付時間</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <div>
                      <p className="font-semibold text-gray-700">口火ライブ</p>
                      <p className="text-sm text-gray-600">毎月1日 22:00-22:30</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <div>
                      <p className="font-semibold text-gray-700">二足のわらじライブ</p>
                      <p className="text-sm text-gray-600">毎月10日 22:00-22:30</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    次回のエントリー受付日をご確認ください
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-3xl font-bold text-gray-800 font-mono">
              {currentTime.toLocaleTimeString('ja-JP')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>

      <div className={`max-w-2xl mx-auto px-4 py-8 transition-all duration-1000 ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            {formData.liveType === 'KUCHIBE' ? '口火ライブ' : '二足のわらじライブ'}
          </h1>
          <p className="text-xl text-gray-600">エントリーフォーム</p>
        </div>
        
        {/* Test mode notice */}
        <div className="glass-card mb-6 border-2 border-green-200 bg-green-50/70">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
            <div>
              <p className="text-lg font-semibold text-green-800">テストモード</p>
              <p className="text-sm text-green-700">17:50-19:00 エントリー受付中</p>
            </div>
          </div>
        </div>

        {/* Clock */}
        <div className="glass-card mb-8 text-center">
          <p className="text-3xl font-bold text-gray-800 mb-2 font-mono">
            {currentTime.toLocaleTimeString('ja-JP')}
          </p>
          <p className="text-sm text-gray-600">
            受付終了まで: {(() => {
              const endTime = new Date('2025-06-20T19:00:00')
              const diff = endTime.getTime() - currentTime.getTime()
              const minutes = Math.floor(diff / (1000 * 60))
              const seconds = Math.floor((diff % (1000 * 60)) / 1000)
              return `${minutes}分${seconds}秒`
            })()}
          </p>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="card form-section">
          {/* Live type selection - 口火ライブ固定 */}
          <input type="hidden" name="liveType" value="KUCHIBE" />
          
          {/* Entry number selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-4">エントリー数</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="label-modern">
                <input
                  type="radio"
                  name="entryNumber"
                  value="1"
                  checked={formData.entryNumber === '1'}
                  onChange={handleChange}
                  className="radio-modern"
                />
                <span className="font-medium">1つ</span>
              </label>
              <label className="label-modern">
                <input
                  type="radio"
                  name="entryNumber"
                  value="2"
                  checked={formData.entryNumber === '2'}
                  onChange={handleChange}
                  className="radio-modern"
                />
                <span className="font-medium">2つ</span>
              </label>
            </div>
          </div>

          {/* Entry 1 */}
          <div className="space-y-6 relative">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              名義1
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名義名 *</label>
                <input
                  type="text"
                  name="name1"
                  value={formData.name1}
                  onChange={handleChange}
                  required
                  placeholder="コンビ名/芸名"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">代表者名 *</label>
                <input
                  type="text"
                  name="representative1"
                  value={formData.representative1}
                  onChange={handleChange}
                  required
                  placeholder="山田太郎"
                  className="input-field"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">第1希望</label>
                <select
                  name="preference1_1"
                  value={formData.preference1_1}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="">選択してください</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">第2希望</label>
                <select
                  name="preference1_2"
                  value={formData.preference1_2}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="">選択してください</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">第3希望</label>
                <select
                  name="preference1_3"
                  value={formData.preference1_3}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="">選択してください</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Entry 2 */}
          {formData.entryNumber === '2' && (
            <>
              <div className="section-divider"></div>
              
              <div className="space-y-6 relative">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  名義2
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">名義名 *</label>
                    <input
                      type="text"
                      name="name2"
                      value={formData.name2}
                      onChange={handleChange}
                      required={formData.entryNumber === '2'}
                      placeholder="コンビ名/芸名"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">代表者名 *</label>
                    <input
                      type="text"
                      name="representative2"
                      value={formData.representative2}
                      onChange={handleChange}
                      required={formData.entryNumber === '2'}
                      placeholder="山田太郎"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">第1希望</label>
                    <select
                      name="preference2_1"
                      value={formData.preference2_1}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="">選択してください</option>
                      {dates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">第2希望</label>
                    <select
                      name="preference2_2"
                      value={formData.preference2_2}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="">選択してください</option>
                      {dates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">第3希望</label>
                    <select
                      name="preference2_3"
                      value={formData.preference2_3}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="">選択してください</option>
                      {dates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">連絡先メールアドレス *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="input-field"
              />
            </div>
            
            {/* LINE URL */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">LINE URL</label>
              <input
                type="url"
                name="lineUrl"
                value={formData.lineUrl}
                onChange={handleChange}
                placeholder="https://line.me/ti/p/..."
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">LINE交換用のURLがあれば入力してください（任意）</p>
            </div>
          </div>

          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p>現在時刻: {currentTime?.toLocaleString('ja-JP')}</p>
            <p>受付可能: {canSubmit() ? '✅' : '❌'}</p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit()}
            className="w-full mt-8 btn-primary text-lg"
          >
            {isSubmitting ? (
              <span className="loading-dots">
                送信中
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              'エントリーする'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}