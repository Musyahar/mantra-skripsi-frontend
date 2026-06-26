import { useState, useRef, useEffect, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// ─── Helpers ─────────────────────────────────────────────────
function getToken() {
  try {
    const s = JSON.parse(localStorage.getItem('mantra_auth_session'))
    return s?.token || null
  } catch { return null }
}

function Spinner({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  )
}

// ─── Markdown-lite renderer ──────────────────────────────────
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f0f4f8;padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<p style="font-weight:800;color:#0f172a;margin:12px 0 4px">$1</p>')
    .replace(/^## (.+)$/gm, '<p style="font-weight:800;font-size:15px;color:#0f172a;margin:14px 0 6px">$1</p>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin:6px 0;padding-left:18px;list-style:disc">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:0">')
    .replace(/\n/g, '<br/>')
}

// ─── Message Bubble ──────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  if (msg.type === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-sm px-4 py-3 rounded-2xl rounded-bl-sm text-sm bg-red-50 border border-red-200 text-red-700">
          ⚠️ {msg.content}
          {msg.actionLabel && (
            <button onClick={msg.action} className="block mt-2 text-xs font-bold text-brand-blue underline">
              {msg.actionLabel} →
            </button>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
          🤖
        </div>
      )}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-brand-blue text-white rounded-br-sm'
            : 'bg-gray-100 text-brand-dark rounded-bl-sm'}`}
        dangerouslySetInnerHTML={{ __html: isUser ? msg.content : renderMarkdown(msg.content) }}
      />
    </div>
  )
}

// ─── Typing Indicator ────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">🤖</div>
      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"
              style={{ animation: `typingBounce 1.2s infinite ${i * 0.2}s ease-in-out` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main DashboardPage ──────────────────────────────────────
function DashboardPage({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('ai')
  const [aiInput, setAiInput] = useState('')
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Halo **${user?.name?.split(' ')[0] || 'Mahasiswa'}**! 👋 Saya Mantra AI, siap membantu skripsimu.\n\nMau mulai dari mana hari ini? Kamu bisa tanya soal topik, outline, metodologi, atau minta saya review tulisanmu! 🎓`,
  }])
  const [isTyping, setIsTyping] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [dailyCount, setDailyCount] = useState(0)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const isSubscriptionExpired = !user?.subscription_expires_at ||
    new Date(user.subscription_expires_at) < new Date()
  const isFree = isSubscriptionExpired
  const FREE_LIMIT = 5

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendAI = useCallback(async (overrideInput) => {
    const text = (overrideInput || aiInput).trim()
    if (!text || isTyping) return

    if (isFree && dailyCount >= FREE_LIMIT) {
      setAiError(`Kamu sudah menggunakan ${FREE_LIMIT} pesan gratis hari ini. Upgrade ke Pro untuk akses tidak terbatas!`)
      return
    }

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setAiInput('')
    setIsTyping(true)
    setAiError(null)

    try {
      const token = getToken()
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.filter(m => !m.type).map(m => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            name: user?.name,
            university: user?.university,
            jenjang: user?.jenjang,
            bidang: user?.bidang,
            topic: user?.topic,
            progress: user?.progress,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'SUBSCRIPTION_EXPIRED') {
          setMessages(prev => [...prev, {
            role: 'assistant', type: 'error',
            content: 'Subscription kamu sudah habis. Fitur AI tidak dapat digunakan.',
            actionLabel: 'Perpanjang Subscription',
            action: () => onNavigate('billing'),
          }])
        } else if (data.code === 'DAILY_LIMIT') {
          setAiError(data.message)
        } else if (data.code === 'AI_NOT_CONFIGURED') {
          setMessages(prev => [...prev, {
            role: 'assistant', type: 'error',
            content: 'AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY ke file .env backend, kemudian restart server.',
          }])
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant', type: 'error',
            content: data.message || 'Terjadi kesalahan. Coba lagi.',
          }])
        }
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }])
      if (isFree) setDailyCount(c => c + 1)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', type: 'error',
        content: 'Tidak dapat terhubung ke server AI. Pastikan backend berjalan.',
      }])
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [aiInput, messages, isTyping, isFree, dailyCount, user, onNavigate])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendAI()
    }
  }

  const quickPrompts = [
    { icon: '💡', label: 'Bantu cari topik skripsi', prompt: 'Bantu aku brainstorming topik skripsi yang menarik dan relevan untuk bidang studiku.' },
    { icon: '📋', label: 'Buat outline Bab 1', prompt: 'Buatkan outline lengkap untuk Bab 1 Pendahuluan skripsi saya, termasuk sub-bab yang umum digunakan.' },
    { icon: '📝', label: 'Tulis latar belakang', prompt: 'Bantu aku menulis paragraf pembuka latar belakang penelitian yang kuat dan menarik.' },
    { icon: '🎤', label: 'Latihan pertanyaan sidang', prompt: 'Berikan 5 pertanyaan sidang skripsi yang paling sering ditanyakan penguji beserta cara menjawabnya.' },
    { icon: '📖', label: 'Format daftar pustaka APA', prompt: 'Jelaskan cara menulis daftar pustaka dengan format APA 7th edition dengan contoh.' },
    { icon: '✏️', label: 'Parafrase kalimat', prompt: 'Bantu aku parafrase kalimat ini agar lebih orisinal dan tidak terdeteksi plagiarisme:' },
  ]

  const progressItems = [
    { label: 'Bab 1 — Pendahuluan', pct: 85, color: 'bg-emerald-500' },
    { label: 'Bab 2 — Tinjauan Pustaka', pct: 60, color: 'bg-brand-blue' },
    { label: 'Bab 3 — Metodologi', pct: 30, color: 'bg-violet-500' },
    { label: 'Bab 4 — Hasil & Pembahasan', pct: 5, color: 'bg-amber-500' },
    { label: 'Bab 5 — Penutup', pct: 0, color: 'bg-gray-300' },
  ]

  const schedules = [
    { date: 'Rabu, 25 Jun', label: 'Sesi Mentor — Review Bab 2', type: 'mentor', time: '15.00 WIB' },
    { date: 'Jumat, 27 Jun', label: 'Deadline Revisi Bab 1', type: 'deadline', time: 'EOD' },
    { date: 'Senin, 30 Jun', label: 'Upload Draft ke Mentor', type: 'task', time: '—' },
  ]

  return (
    <div className="font-jakarta bg-surface min-h-screen text-slate-600">

      {/* ─── SUBSCRIPTION BANNER ─────────────────────────── */}
      {isSubscriptionExpired && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <p className="text-white text-sm font-semibold">
              Pakai AI gratis <strong>{Math.max(0, FREE_LIMIT - dailyCount)} pesan lagi</strong> hari ini.
              Upgrade Pro untuk akses tanpa batas.
            </p>
          </div>
          <button onClick={() => onNavigate('billing')}
            className="flex-shrink-0 bg-white text-amber-700 font-bold text-xs py-1.5 px-4 rounded-full hover:bg-amber-50 transition-colors duration-200">
            Upgrade Pro →
          </button>
        </div>
      )}

      {/* ─── NAVBAR ──────────────────────────────────────── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-sm leading-none">✨</span>
            </div>
            <span className="font-extrabold text-brand-dark text-sm">Mantra Skripsi</span>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: 'ai', label: '🤖 AI Asisten' },
              { id: 'progress', label: '📊 Progres' },
              { id: 'schedule', label: '📅 Jadwal' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${activeTab === tab.id ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => onNavigate('billing')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                ${isSubscriptionExpired
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-emerald-100 text-emerald-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSubscriptionExpired ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              {isSubscriptionExpired ? 'Upgrade Pro' : 'Pro Aktif'}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-brand-blue overflow-hidden">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : (user?.name?.[0]?.toUpperCase() || 'M')}
            </div>
            <button onClick={() => { localStorage.removeItem('mantra_auth_session'); onNavigate('landing') }}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Welcome */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
              Selamat datang, {user?.name?.split(' ')[0] || 'Mahasiswa'} 👋
            </h1>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          {[{ id: 'ai', label: 'AI Asisten' }, { id: 'progress', label: 'Progres' }, { id: 'schedule', label: 'Jadwal' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === tab.id ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: AI ASISTEN ─── */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-[slideUp_0.4s_ease-out]">
            {/* Chat window */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[calc(100svh-220px)] min-h-[400px] lg:h-[600px]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg">🤖</div>
                <div>
                  <p className="font-bold text-brand-dark text-sm">Mantra AI</p>
                  <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span> Online
                  </p>
                </div>
                {isFree && (
                  <span className="ml-auto text-xs bg-gray-100 text-slate-500 font-semibold px-2.5 py-1 rounded-full">
                    {Math.max(0, FREE_LIMIT - dailyCount)}/{FREE_LIMIT} pesan gratis hari ini
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {isTyping && (
                  <div>
                    <TypingIndicator />
                    <p className="text-[10px] text-slate-400 mt-2 ml-10 animate-pulse">Mantra AI sedang merangkai ide brilian untukmu...</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Error banner */}
              {aiError && (
                <div className="mx-5 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-amber-700">{aiError}</p>
                  <button onClick={() => onNavigate('billing')}
                    className="flex-shrink-0 text-xs font-bold text-brand-blue underline">
                    Upgrade →
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="px-5 py-4 border-t border-gray-100">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pertanyaan atau instruksi... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                    rows={1}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-blue transition-colors duration-200 resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />
                  <button
                    onClick={() => handleSendAI()}
                    disabled={!aiInput.trim() || isTyping}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${aiInput.trim() && !isTyping
                        ? 'bg-brand-blue text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                  >
                    {isTyping
                      ? <Spinner size={16} color="#9ca3af" />
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    }
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 text-center">
                  Mantra AI dapat membuat kesalahan. Verifikasi fakta dan referensi penting.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick prompts */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-brand-dark text-sm mb-3">⚡ Mulai Cepat</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickPrompts.map(qp => (
                    <button key={qp.label} onClick={() => handleSendAI(qp.prompt)}
                      disabled={isTyping}
                      className="text-left px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-100 text-slate-600 hover:bg-blue-50 hover:text-brand-blue hover:border-blue-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50">
                      <span>{qp.icon}</span> {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrade card */}
              {isFree && (
                <div className="bg-gradient-to-br from-brand-dark to-blue-950 rounded-3xl p-5 text-white">
                  <p className="font-bold text-base mb-1">🚀 Upgrade ke Pro</p>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Chat AI tanpa batas, bimbingan mentor 2x/bulan, dan format otomatis sesuai kampus.
                  </p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-extrabold text-2xl text-white">Rp 149.000</span>
                    <span className="text-slate-400 text-xs">/bulan</span>
                  </div>
                  <button onClick={() => onNavigate('billing')}
                    className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors duration-200">
                    Pilih Pro →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: PROGRES ─── */}
        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-[slideUp_0.4s_ease-out]">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 transform transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-extrabold text-brand-dark text-lg">Progres Penulisan</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Update terakhir: Hari ini</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-3xl text-brand-blue">36%</p>
                  <p className="text-xs text-slate-400">Total selesai</p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full transition-all duration-700" style={{ width: '36%' }} />
              </div>
              <div className="space-y-5">
                {progressItems.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-brand-dark">{item.label}</span>
                      <span className="text-xs font-bold text-slate-400">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Halaman Selesai', value: '28', sub: 'dari ~80 halaman', icon: '📄', bg: 'bg-blue-50', color: 'text-brand-blue' },
                { label: 'Hari Aktif', value: '14', sub: 'bulan ini', icon: '🔥', bg: 'bg-orange-50', color: 'text-orange-600' },
                { label: 'Referensi', value: '23', sub: 'jurnal tersimpan', icon: '📚', bg: 'bg-violet-50', color: 'text-violet-600' },
              ].map((s, idx) => (
                <div key={s.label} 
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ animation: `slideUp 0.4s ease-out ${idx * 0.1}s both` }}
                >
                  <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transform transition-transform hover:rotate-6`}>{s.icon}</div>
                  <div>
                    <p className={`font-extrabold text-2xl ${s.color}`}>{s.value}</p>
                    <p className="text-xs font-semibold text-brand-dark">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.sub}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                  setActiveTab('ai')
                  setTimeout(() => handleSendAI('Bantu aku membuat rencana penulisan skripsi yang realistis berdasarkan progres saya saat ini.'), 100)
                }}
                className="w-full py-3 rounded-2xl bg-brand-blue text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
                🤖 Minta Rencana AI
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: JADWAL ─── */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-[slideUp_0.4s_ease-out]">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="font-extrabold text-brand-dark text-lg mb-5">Jadwal Mendatang</h2>
              <div className="space-y-3">
                {schedules.map(s => (
                  <div key={s.label} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${s.type === 'mentor' ? 'bg-brand-blue' : s.type === 'deadline' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-brand-dark text-sm">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.date} · {s.time}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0
                      ${s.type === 'mentor' ? 'bg-blue-100 text-brand-blue' : s.type === 'deadline' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {s.type === 'mentor' ? 'Mentor' : s.type === 'deadline' ? 'Deadline' : 'Tugas'}
                    </span>
                  </div>
                ))}
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-slate-400 hover:border-brand-blue hover:text-brand-blue font-semibold transition-all">
                  + Tambah jadwal baru
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-dark to-slate-800 rounded-3xl p-6 text-white">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Mentor Kamu</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center font-bold text-lg">M</div>
                <div>
                  <p className="font-bold text-white text-sm">Belum ditetapkan</p>
                  <p className="text-slate-400 text-xs">Hubungi admin untuk matching</p>
                </div>
              </div>
              <button className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors">
                Minta Matching Mentor →
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage
