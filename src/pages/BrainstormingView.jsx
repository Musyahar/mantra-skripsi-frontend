import { useState, useEffect, useRef } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('mantra_auth_session'))?.token || null
  } catch { return null }
}

function Icon({ d, size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
    </svg>
  )
}

const ICONS = {
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  copy: ['M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2', 'M16 8h2a2 2 0 012 2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2'],
  check: 'M20 6L9 17l-5-5',
}

const SUGGESTIONS = ["Topik UMKM", "Topik kesehatan mental", "Topik teknologi pendidikan", "Topik AI dalam pendidikan"]

export default function BrainstormingView({ user, onBack, onNavigate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dailyCount, setDailyCount] = useState(0) // hardcoded limit emulation
  const chatEndRef = useRef(null)
  const [copiedTitle, setCopiedTitle] = useState(null)
  const [toast, setToast] = useState(null)

  // Load history
  useEffect(() => {
    async function loadHistory() {
      try {
        const token = getToken()
        if (!token) return
        const res = await fetch(`${API_BASE_URL}/api/ai/history?limit=30`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.status === 'success' && data.data.messages.length > 0) {
          setMessages(data.data.messages)
        }
      } catch (err) {
        console.error('Failed to load history', err)
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    const val = text.trim()
    if (!val || isLoading) return
    
    const newMsg = { role: 'user', content: val }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsLoading(true)

    try {
      const token = getToken()
      // Send only recent context + the new message
      const recentHistory = messages.slice(-6).concat(newMsg).map(m => ({
        role: m.role, content: m.content
      }))
      
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          messages: recentHistory,
          userContext: { ...user, mode: 'brainstorming' }
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }])
      } else {
        setToast({ type: 'error', message: data.message })
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Koneksi terputus. Coba lagi.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (title) => {
    navigator.clipboard.writeText(title)
    setCopiedTitle(title)
    setTimeout(() => setCopiedTitle(null), 2000)
  }

  const handleUseTitle = async (title) => {
    try {
      const token = getToken()
      if (!token) return
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ 
          type: 'success', 
          message: `Proyek "${title.substring(0,20)}..." berhasil dibuat!`,
          action: () => onNavigate('autoformat')
        })
      } else {
        setToast({ type: 'error', message: data.message })
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal membuat proyek.' })
    }
  }

  // Parse [TITLE] tags
  const renderMessageContent = (content) => {
    // Split by [TITLE]...[/TITLE]
    const regex = /\[TITLE\]([\s\S]*?)\[\/TITLE\]/gi
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
      // Text before title
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.substring(lastIndex, match.index) })
      }
      // The title itself
      parts.push({ type: 'title', title: match[1].trim() })
      lastIndex = regex.lastIndex
    }
    // Remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.substring(lastIndex) })
    }

    if (parts.length === 0) return <p className="whitespace-pre-wrap">{content}</p>

    return (
      <div className="space-y-3">
        {parts.map((p, i) => {
          if (p.type === 'text') return <p key={i} className="whitespace-pre-wrap">{p.text}</p>
          if (p.type === 'title') {
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue"></div>
                <h4 className="font-bold text-brand-dark mb-4 text-base leading-snug pr-8">{p.title}</h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUseTitle(p.title)}
                    className="flex-1 bg-brand-blue text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    🚀 Pakai judul ini
                  </button>
                  <button 
                    onClick={() => handleCopy(p.title)}
                    className="p-2 border border-gray-200 rounded-lg text-slate-500 hover:bg-gray-50 transition"
                    title="Copy judul"
                  >
                    <Icon d={copiedTitle === p.title ? ICONS.check : ICONS.copy} size={16} stroke={copiedTitle === p.title ? '#34A853' : 'currentColor'} />
                  </button>
                </div>
              </div>
            )
          }
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-full w-full bg-surface relative">
      
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-slate-500 transition">
            <Icon d={ICONS.arrowLeft} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-brand-dark">Brainstorming Judul</h2>
            <p className="text-xs text-slate-400 font-medium">Asisten AI Khusus Skripsi</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 rounded-full border border-brand-blue/20">
          <span className="text-xs font-bold text-brand-blue">✨ Kuota AI:</span>
          <span className="text-xs font-extrabold text-brand-dark">Tak Terbatas (Pro)</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-40">
        
        {/* Initial Bubble */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white text-lg">✨</span>
          </div>
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm text-sm text-slate-600 leading-relaxed">
              Halo, <strong>{user?.name?.split(' ')[0]}</strong>! Saya siap bantu kamu menemukan judul skripsi yang pas dan orisinal. Ceritakan topik apa yang kamu minati, atau masalah apa yang ingin kamu angkat?
            </div>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(s)}
                    className="px-3 py-1.5 bg-white border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white rounded-full text-xs font-bold transition shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Messages */}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role !== 'user' && (
              <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white text-lg">✨</span>
              </div>
            )}
            <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed max-w-2xl ${
              m.role === 'user' 
                ? 'bg-brand-blue text-white rounded-tr-sm shadow-md' 
                : 'bg-white border border-gray-100 rounded-tl-sm shadow-sm text-slate-600'
            }`}>
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                renderMessageContent(m.content)
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-lg animate-pulse">✨</span>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-blue/50 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-brand-blue/50 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-brand-blue/50 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-surface via-surface to-transparent">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input) }}
          className="max-w-4xl mx-auto flex gap-3 relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ketik topik atau masalah penelitianmu di sini..."
            className="flex-1 h-14 pl-5 pr-14 rounded-full border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100 transition shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2.5 top-2.5 bottom-2.5 w-9 rounded-full bg-brand-blue flex items-center justify-center text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md"
          >
            <Icon d={ICONS.send} size={16} />
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-brand-dark text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-4 border border-white/10">
            <span className="text-sm font-semibold">{toast.message}</span>
            {toast.action && (
              <button 
                onClick={() => { toast.action(); setToast(null) }}
                className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap"
              >
                Lanjut ke Auto-Format →
              </button>
            )}
            {!toast.action && (
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition">
                <Icon d={ICONS.close} size={16} />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
