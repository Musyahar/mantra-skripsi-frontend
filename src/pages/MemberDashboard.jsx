import { useState, useEffect, useRef } from 'react'
import SettingsView from './SettingsView'
import BrainstormingView from './BrainstormingView'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function Icon({ d, size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
    </svg>
  )
}

const ICONS = {
  home: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z',
  brain: ['M9.5 2a4.5 4.5 0 000 9', 'M14.5 2a4.5 4.5 0 010 9', 'M4 16.5A4.5 4.5 0 008.5 21h7a4.5 4.5 0 000-9H8.5A4.5 4.5 0 004 16.5z'],
  file: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M16 13H8M16 17H8M10 9H8'],
  edit: ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  quote: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
  users: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'],
  credit: ['M1 4h22v16H1z', 'M1 10h22'],
  settings: ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'],
  bell: ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  chevronDown: 'M6 9l6 6 6-6',
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  menu: ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  close: 'M18 6L6 18M6 6l12 12',
  clock: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
}

const NAV_ITEMS = [
  { id: 'ringkasan',     label: 'Ringkasan',          icon: 'home' },
  { id: 'brainstorming', label: 'Brainstorming Judul', icon: 'brain' },
  { id: 'autoformat',   label: 'Auto-format',         icon: 'file' },
  { id: 'parafrase',    label: 'Parafrase',           icon: 'edit' },
  { id: 'citation',     label: 'Citation',            icon: 'quote' },
  { id: 'bimbingan',    label: 'Bimbingan Mentor',    icon: 'users', accent: true },
  { id: 'billing',      label: 'Billing',             icon: 'credit' },
  { id: 'settings',     label: 'Settings',            icon: 'settings' },
]

const TOUR_STEPS = [
  { target: 'nav-brainstorming', title: 'Mulai dari sini', desc: 'Belum punya judul? Gunakan Brainstorming Judul untuk menemukan ide yang relevan dengan bidang kamu.' },
  { target: 'btn-new-project',   title: 'Buat proyek baru', desc: 'Klik "+ Proyek Baru" untuk memulai dokumen skripsimu dari awal atau mengimpor draf yang ada.' },
  { target: 'nav-bimbingan',     title: 'Bimbingan manusia, bukan AI', desc: 'Jadwalkan sesi 1-on-1 dengan mentor manusia sungguhan — nilai pembeda Mantra Skripsi dari platform lain.' },
]

function MemberDashboard({ user, onNavigate }) {
  const [activeNav, setActiveNav] = useState('ringkasan')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [tourStep, setTourStep] = useState(null)
  const [tourReady, setTourReady] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 120, left: 280 })
  const dropdownRef = useRef(null)

  const subExpiry = user?.subscription_expires_at ? new Date(user.subscription_expires_at) : null
  const now = new Date()
  const subActive = subExpiry && subExpiry > now
  const daysLeft = subExpiry ? Math.ceil((subExpiry - now) / 86400000) : null
  const subWarning = daysLeft !== null && daysLeft <= 14

  const recentProjects = [
    { title: 'Skripsi – Bab 2', updated: '2 jam lalu' },
    { title: 'Proposal Penelitian', updated: 'Kemarin' },
    { title: 'Skripsi – Bab 1', updated: '3 hari lalu' },
  ]

  useEffect(() => {
    const tourDone = localStorage.getItem('mantra_tour_done')
    if (!tourDone && user?.onboarding_completed) {
      const t = setTimeout(() => { setTourStep(0); setTourReady(true) }, 800)
      return () => clearTimeout(t)
    }
  }, [user])

  const updateTooltipPos = (step) => {
    const stepData = TOUR_STEPS[step]
    const el = document.getElementById(stepData.target)
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Always place tooltip to the right of sidebar items, or below buttons
    if (stepData.target.startsWith('nav-')) {
      setTooltipPos({ top: rect.top, left: rect.right + 16 })
    } else {
      setTooltipPos({ top: rect.bottom + 12, left: rect.left })
    }
  }

  useEffect(() => {
    if (tourStep === null || !tourReady) return
    const t = setTimeout(() => updateTooltipPos(tourStep), 50)
    return () => clearTimeout(t)
  }, [tourStep, tourReady])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTourNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) setTourStep(tourStep + 1)
    else endTour()
  }
  const endTour = () => { setTourStep(null); setTourReady(false); localStorage.setItem('mantra_tour_done', '1') }
  const handleLogout = () => { localStorage.removeItem('mantra_auth_session'); onNavigate('landing') }

  const firstName = user?.name?.split(' ')[0] || 'Pengguna'
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
          <span className="text-white text-sm">✨</span>
        </div>
        <span className="font-extrabold text-brand-dark text-sm">Mantra Skripsi</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">
            <Icon d={ICONS.close} size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => { setActiveNav(item.id); onClose?.() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                ${isActive ? 'bg-blue-50 text-brand-blue'
                  : item.accent ? 'text-brand-blue hover:bg-blue-50/60'
                  : 'text-slate-500 hover:bg-gray-50 hover:text-brand-dark'}`}
            >
              <span className={`flex-shrink-0 ${isActive || item.accent ? 'text-brand-blue' : 'text-slate-400'}`}>
                <Icon d={ICONS[item.icon]} size={18} />
              </span>
              <span>{item.label}</span>
              {item.id === 'bimbingan' && (
                <span className="ml-auto text-[10px] font-bold bg-brand-blue text-white px-1.5 py-0.5 rounded-full leading-none">Baru</span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-brand-blue flex-shrink-0 overflow-hidden">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-brand-dark truncate">{user?.name || 'Pengguna'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="font-jakarta bg-gray-50 min-h-screen flex text-slate-600">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full shadow-2xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 bg-white border-b border-gray-100 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-brand-dark">
            <Icon d={ICONS.menu} size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* Bell */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-dark hover:bg-gray-100 transition relative">
                <Icon d={ICONS.bell} size={19} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-4">
                  <p className="font-bold text-brand-dark mb-3 text-sm">Notifikasi</p>
                  {[
                    { emoji: '🎓', title: 'Selamat datang di Mantra!', sub: 'Mulai skripsimu sekarang' },
                    { emoji: '📣', title: 'Fitur baru: Citation Manager', sub: 'Kelola daftar pustaka lebih mudah' },
                  ].map((n, i) => (
                    <div key={i} className="flex gap-3 mb-3">
                      <span className="text-xl">{n.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-brand-dark">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Avatar */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-brand-blue overflow-hidden flex-shrink-0">
                  {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-brand-dark">{firstName}</span>
                <Icon d={ICONS.chevronDown} size={14} stroke="#94a3b8" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-1.5 overflow-hidden">
                  <button onClick={() => setDropdownOpen(false)} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-gray-50">Profil</button>
                  <button onClick={() => { setActiveNav('billing'); setDropdownOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-gray-50">Billing</button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <Icon d={ICONS.logout} size={15} />Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        {activeNav === 'brainstorming' ? (
          <BrainstormingView 
            user={user} 
            onBack={() => setActiveNav('ringkasan')}
            onNavigate={(nav) => setActiveNav(nav)}
          />
        ) : (
          <main className="flex-1 px-4 sm:px-8 py-8 max-w-4xl w-full">
            {activeNav === 'settings' ? (
              <SettingsView user={user} onLogout={handleLogout} />
            ) : (
            <>
              {/* Greeting + new project button */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-brand-dark">Halo, {firstName} 👋</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Lanjutkan progres skripsimu</p>
                </div>
                <button id="btn-new-project"
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-sm shadow-blue-200">
                  <span className="text-base leading-none">+</span>Proyek Baru
                </button>
              </div>

          {/* Subscription banner */}
          {subExpiry ? (
            <div className={`mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold
              ${subActive && !subWarning ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                subActive && subWarning ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-red-50 text-red-600 border border-red-100'}`}>
              <span>
                {subActive && !subWarning && `✅ Paket Pro aktif sampai ${subExpiry.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                {subActive && subWarning && `⚠️ Paket Pro habis dalam ${daysLeft} hari — segera perpanjang`}
                {!subActive && `❌ Paket Pro telah berakhir`}
              </span>
              <button className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-current hover:opacity-80 transition">Perpanjang</button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-brand-blue border border-blue-100">
              <span>🎁 Kamu menggunakan paket Gratis. Upgrade untuk fitur penuh.</span>
              <button className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-blue text-white hover:bg-blue-600 transition">Upgrade</button>
            </div>
          )}

          {/* Module cards 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { nav: 'brainstorming', icon: '💡', title: 'Brainstorming Judul', desc: 'Cari ide judul dengan AI' },
              { nav: 'autoformat',   icon: '📑', title: 'Auto-format',         desc: 'Format sesuai pedoman kampus' },
              { nav: 'parafrase',    icon: '✍️', title: 'Parafrase',           desc: 'Parafrase instan bebas plagiasi' },
              { nav: 'citation',     icon: '📚', title: 'Citation Manager',    desc: 'Daftar pustaka otomatis' },
            ].map(card => (
              <div key={card.nav}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <h3 className="font-bold text-brand-dark text-sm">{card.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                </div>
                <button onClick={() => setActiveNav(card.nav)}
                  className="mt-auto self-start px-4 py-2 text-xs font-bold bg-gray-100 text-brand-dark rounded-lg hover:bg-gray-200 transition">
                  Mulai
                </button>
              </div>
            ))}
          </div>

          {/* Mentor card — full-width, prominent */}
          <div className="mb-6 bg-gradient-to-r from-brand-dark to-indigo-900 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">🎓</div>
              <div>
                <p className="text-white font-extrabold text-base">Bimbingan Mentor Manusia</p>
                <p className="text-slate-300 text-sm mt-0.5">Sesi 1-on-1 langsung, bukan cuma AI</p>
              </div>
            </div>
            <button onClick={() => setActiveNav('bimbingan')}
              className="flex-shrink-0 px-4 py-2.5 bg-white text-brand-dark rounded-xl text-sm font-bold hover:bg-gray-100 transition">
              Jadwalkan Sesi
            </button>
          </div>

          {/* Recent projects */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-brand-dark text-sm">Proyek Terakhir</p>
              <button className="text-xs text-brand-blue font-semibold hover:underline">Lihat semua</button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentProjects.map((p, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300"><Icon d={ICONS.file} size={16} /></span>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{p.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Icon d={ICONS.clock} size={11} stroke="#94a3b8" />{p.updated}
                      </p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-brand-blue hover:underline flex-shrink-0">Lanjutkan</button>
                </div>
              ))}
            </div>
          </div>
              </>
            )}
          </main>
        )}
      </div>

      {/* ─── PRODUCT TOUR ────────────────────────────────────────── */}
      {tourReady && tourStep !== null && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 pointer-events-auto" onClick={endTour} />

          {/* Highlight ring */}
          {(() => {
            const el = document.getElementById(TOUR_STEPS[tourStep].target)
            if (!el) return null
            const rect = el.getBoundingClientRect()
            return (
              <div
                className="fixed z-[61] rounded-xl ring-4 ring-brand-blue ring-offset-2 pointer-events-none transition-all duration-300"
                style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
              />
            )
          })()}

          {/* Tooltip card */}
          <div
            className="fixed z-[62] w-72 bg-white rounded-2xl shadow-2xl p-5 pointer-events-auto"
            style={{
              top: Math.min(Math.max(tooltipPos.top - 40, 8), window.innerHeight - 200),
              left: Math.min(Math.max(tooltipPos.left, 8), window.innerWidth - 296),
            }}
          >
            <div className="text-xs font-bold text-brand-blue mb-2 uppercase tracking-wider">{tourStep + 1}/{TOUR_STEPS.length}</div>
            <h3 className="font-extrabold text-brand-dark text-base mb-1.5">{TOUR_STEPS[tourStep].title}</h3>
            <p className="text-slate-500 text-sm mb-4">{TOUR_STEPS[tourStep].desc}</p>
            <div className="flex items-center justify-between gap-2">
              <button onClick={endTour} className="text-sm text-slate-400 font-semibold hover:text-slate-600 transition">Lewati</button>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {TOUR_STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-5 bg-brand-blue' : 'w-1.5 bg-gray-200'}`} />
                  ))}
                </div>
                <button onClick={handleTourNext}
                  className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition">
                  {tourStep < TOUR_STEPS.length - 1 ? 'Lanjut →' : 'Selesai 🚀'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

export default MemberDashboard
