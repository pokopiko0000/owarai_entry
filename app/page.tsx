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
  const [entryPhase, setEntryPhase] = useState<'waiting' | 'form_only' | 'accepting' | 'closed'>('waiting')

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      const date = now.getDate()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      // エントリー日の判定（1日と10日）
      // テスト用: 環境変数でテストモードを有効化
      const isTestMode = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TEST_MODE === 'true'
      const isEntryDay = isTestMode || date === 1 || date === 10
      
      // エントリー時間の判定（22:00-23:00）
      const isEntryTime = hour === 22 && minute < 60
      
      if (isEntryDay) {
        setShowForm(true)
        
        if (isEntryTime) {
          // 22:00-23:00: エントリー受付中
          setEntryPhase('accepting')
          setIsEntryOpen(true)
          const remainingMinutes = 59 - minute
          const remainingSeconds = 60 - now.getSeconds()
          setTimeUntilOpen(`残り${remainingMinutes}分${remainingSeconds}秒`)
        } else if (hour < 22) {
          // エントリー日の22:00前: フォーム入力可能、送信不可
          setEntryPhase('form_only')
          setIsEntryOpen(false)
          const hoursUntil = 21 - hour
          const minutesUntil = 60 - minute
          setTimeUntilOpen(`${hoursUntil}時間${minutesUntil}分後に受付開始`)
        } else {
          // エントリー日の23:00以降: 締切
          setEntryPhase('closed')
          setIsEntryOpen(false)
          setShowForm(false)
          
          // 次回エントリー日の計算
          const currentLiveType = formData.liveType
          let nextDate: number
          let nextMonth = now.getMonth()
          let nextYear = now.getFullYear()
          
          if (currentLiveType === 'KUCHIBE') {
            // 口火: 毎月1日
            if (date === 1) {
              // 1日なら来月の1日
              nextMonth = nextMonth + 1
              if (nextMonth > 11) {
                nextMonth = 0
                nextYear = nextYear + 1
              }
            }
            nextDate = 1
          } else {
            // 二足のわらじ: 毎月10日
            if (date === 10) {
              // 10日なら来月の10日
              nextMonth = nextMonth + 1
              if (nextMonth > 11) {
                nextMonth = 0
                nextYear = nextYear + 1
              }
            }
            nextDate = 10
          }
          
          const nextEntryDate = new Date(nextYear, nextMonth, nextDate)
          const daysUntil = Math.ceil((nextEntryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          setTimeUntilOpen(`次回エントリーまで${daysUntil}日`)
        }
      } else {
        // エントリー日でない場合
        setEntryPhase('waiting')
        setShowForm(false)
        setIsEntryOpen(false)
        
        // 次回エントリー日の計算
        const currentLiveType = formData.liveType
        let nextDate: number
        let nextMonth = now.getMonth()
        let nextYear = now.getFullYear()
        
        if (currentLiveType === 'KUCHIBE') {
          // 口火: 毎月1日
          nextDate = 1
          if (date > 1) {
            nextMonth = nextMonth + 1
            if (nextMonth > 11) {
              nextMonth = 0
              nextYear = nextYear + 1
            }
          }
        } else {
          // 二足のわらじ: 毎月10日
          nextDate = 10
          if (date > 10) {
            nextMonth = nextMonth + 1
            if (nextMonth > 11) {
              nextMonth = 0
              nextYear = nextYear + 1
            }
          }
        }
        
        const nextEntryDate = new Date(nextYear, nextMonth, nextDate)
        const daysUntil = Math.ceil((nextEntryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        setTimeUntilOpen(`次回エントリーまで${daysUntil}日`)
      }
    }, 1000)

    fetchLiveDates()
    
    return () => clearInterval(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLiveDates = async () => {
    try {
      const response = await fetch(`/api/lives?type=${formData.liveType}`)
      const data = await response.json()
      setDates(data.dates || [])
    } catch (error) {
      console.error('Failed to fetch live dates:', error)
      setDates([])
    }
  }

  const canSubmit = () => {
    if (!currentTime) return false
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    const date = currentTime.getDate()
    
    // エントリー日の22:00-23:00のみ送信可能
    return (date === 1 || date === 10) && hour === 22 && minute < 60
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
    
    // 第1希望は必須
    if (!formData.preference1_1) {
      alert('第1希望は必須です')
      return
    }
    
    // 2つエントリーの場合、名義2の第1希望も必須
    if (formData.entryNumber === '2' && (!formData.name2 || !formData.representative2 || !formData.preference2_1)) {
      alert('名義2の必須項目（名義名・代表者名・第1希望）が入力されていません')
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

  // エントリー締切後の表示
  if (entryPhase === 'closed') {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="text-center px-4">
          <div className="glass-card max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              {formData.liveType === 'KUCHIBE' ? '口火ライブ' : '二足のわらじライブ'}
            </h1>
            
            <div className="mb-8">
              <p className="text-2xl font-semibold text-red-600 mb-4">今回のエントリーは締め切りました</p>
              
              {timeUntilOpen && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">次回エントリーまで</p>
                  <p className="text-3xl font-bold text-purple-600 font-mono">{timeUntilOpen}</p>
                </div>
              )}
              
              <div className="bg-white/50 rounded-xl p-6 text-left mb-6">
                <h2 className="font-bold text-lg mb-3 text-gray-800">次回エントリー受付時間</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${formData.liveType === 'KUCHIBE' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                    <div>
                      <p className="font-semibold text-gray-700">{formData.liveType === 'KUCHIBE' ? '口火ライブ' : '二足のわらじライブ'}</p>
                      <p className="text-sm text-gray-600">毎月{formData.liveType === 'KUCHIBE' ? '1' : '10'}日 22:00-23:00</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    香盤表は振り分け完了後に公開されます
                  </p>
                </div>
              </div>
              
              <a
                href="/schedule"
                className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
              >
                🎭 香盤表を確認する
              </a>
            </div>
            
            <p className="text-2xl font-bold text-gray-800 font-mono">
              {currentTime.toLocaleDateString('ja-JP')} {currentTime.toLocaleTimeString('ja-JP')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // エントリー日以外の通常時の表示
  if (entryPhase === 'waiting') {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="text-center px-4">
          <div className="glass-card max-w-2xl mx-auto">
            {/* Live type selector */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setFormData({ ...formData, liveType: 'KUCHIBE' })
                    setTimeout(() => fetchLiveDates(), 100)
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    formData.liveType === 'KUCHIBE'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  口火ライブ
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, liveType: 'NIWARA' })
                    setTimeout(() => fetchLiveDates(), 100)
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    formData.liveType === 'NIWARA'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  二足のわらじライブ
                </button>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              {formData.liveType === 'KUCHIBE' ? '口火ライブ' : '二足のわらじライブ'}
            </h1>
            
            <div className="mb-8">
              <p className="text-2xl font-semibold text-gray-800 mb-4">現在エントリー受付時間外です</p>
              
              {timeUntilOpen && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">次回エントリーまで</p>
                  <p className="text-3xl font-bold text-purple-600 font-mono">{timeUntilOpen}</p>
                </div>
              )}
              
              <div className="bg-white/50 rounded-xl p-6 text-left mb-6">
                <h2 className="font-bold text-lg mb-3 text-gray-800">エントリー受付時間</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${formData.liveType === 'KUCHIBE' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                    <div>
                      <p className="font-semibold text-gray-700">{formData.liveType === 'KUCHIBE' ? '口火ライブ' : '二足のわらじライブ'}</p>
                      <p className="text-sm text-gray-600">毎月{formData.liveType === 'KUCHIBE' ? '1' : '10'}日 22:00-23:00</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    エントリー当日は22:00からエントリー受付開始
                  </p>
                </div>
              </div>
              
              <a
                href="/schedule"
                className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
              >
                🎭 香盤表を確認する
              </a>
            </div>
            
            <p className="text-2xl font-bold text-gray-800 font-mono">
              {currentTime.toLocaleDateString('ja-JP')} {currentTime.toLocaleTimeString('ja-JP')}
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
        

        {/* Live type selector */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setFormData({ ...formData, liveType: 'KUCHIBE' })
                setTimeout(() => fetchLiveDates(), 100)
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                formData.liveType === 'KUCHIBE'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              口火ライブ
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, liveType: 'NIWARA' })
                setTimeout(() => fetchLiveDates(), 100)
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                formData.liveType === 'NIWARA'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              二足のわらじライブ
            </button>
          </div>
        </div>

        {/* Clock and Status */}
        <div className="glass-card mb-8 text-center">
          <p className="text-3xl font-bold text-gray-800 mb-2 font-mono">
            {currentTime.toLocaleTimeString('ja-JP')}
          </p>
          {entryPhase === 'form_only' && (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-blue-600">エントリー受付前</p>
              <p className="text-sm text-gray-600">{timeUntilOpen}</p>
              <p className="text-xs text-gray-500">フォーム入力は可能、送信は22:00から</p>
            </div>
          )}
          {entryPhase === 'accepting' && (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-green-600">エントリー受付中</p>
              <p className="text-sm text-gray-600">{timeUntilOpen}</p>
            </div>
          )}
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="card form-section">
          
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
                <label className="block text-sm font-medium text-gray-700 mb-2">第1希望 *</label>
                <select
                  name="preference1_1"
                  value={formData.preference1_1}
                  onChange={handleChange}
                  required
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">第1希望 *</label>
                    <select
                      name="preference2_1"
                      value={formData.preference2_1}
                      onChange={handleChange}
                      required={formData.entryNumber === '2'}
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
              canSubmit() ? 'エントリーする' : 
              entryPhase === 'form_only' ? '22:00から送信可能' : 
              '受付開始をお待ちください'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}