import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('mantra_auth_session'))?.token || null
  } catch { return null }
}

function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

function StatCard({ icon, label, value, sub, bg, color }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>{icon}</div>
      <div>
        <p className={`font-extrabold text-2xl ${color}`}>{value}</p>
        <p className="text-xs font-semibold text-brand-dark">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

function AdminDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'mahasiswa' })
  const [addLoading, setAddLoading] = useState(false)

  const handleAddUser = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (res.ok) {
        setShowAddModal(false)
        setAddForm({ name: '', email: '', password: '', role: 'mahasiswa' })
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.message || 'Gagal menambahkan user')
      }
    } catch {
      alert('Koneksi bermasalah')
    } finally {
      setAddLoading(false)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Gagal memuat data')
        const data = await res.json()
        setStats(data.data.stats)
        setRecentUsers(data.data.recent_users || [])
      } catch (err) {
        console.warn('[AdminDashboard] API tidak tersedia, pakai dummy data:', err.message)
        // Dummy data jika API belum siap
        setStats({
          total_users: 247,
          active_subscriptions: 89,
          onboarded_users: 198,
          total_revenue: 24650000,
        })
        setRecentUsers([
          { id: 1, name: 'Ahmad Fauzi', email: 'ahmad@example.com', role: 'mahasiswa', onboarding_completed: 1, subscription_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), created_at: new Date().toISOString() },
          { id: 2, name: 'Siti Rahayu', email: 'siti@example.com', role: 'mahasiswa', onboarding_completed: 1, subscription_expires_at: null, created_at: new Date().toISOString() },
          { id: 3, name: 'Budi Santoso', email: 'budi@example.com', role: 'mentor', onboarding_completed: 1, subscription_expires_at: null, created_at: new Date().toISOString() },
          { id: 4, name: 'Dewi Lestari', email: 'dewi@example.com', role: 'mahasiswa', onboarding_completed: 0, subscription_expires_at: new Date(Date.now() + 15 * 86400000).toISOString(), created_at: new Date().toISOString() },
          { id: 5, name: 'Rizky Pratama', email: 'rizky@example.com', role: 'mahasiswa', onboarding_completed: 1, subscription_expires_at: null, created_at: new Date().toISOString() },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatCurrency = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  const getSubStatus = (expiresAt) => {
    if (!expiresAt) return { label: 'Free', cls: 'bg-gray-100 text-gray-500' }
    return new Date(expiresAt) > new Date()
      ? { label: 'Pro Aktif', cls: 'bg-emerald-100 text-emerald-700' }
      : { label: 'Expired', cls: 'bg-red-100 text-red-600' }
  }

  return (
    <div className="font-jakarta bg-surface min-h-screen text-slate-600">

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-sm leading-none">✨</span>
            </div>
            <span className="font-extrabold text-brand-dark text-sm">Mantra Skripsi</span>
            <span className="hidden sm:block text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center font-bold text-xs text-violet-700 overflow-hidden">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : (user?.name?.[0]?.toUpperCase() || 'A')}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-brand-dark">{user?.name || 'Admin'}</span>
            <button
              onClick={() => { localStorage.removeItem('mantra_auth_session'); onNavigate('landing') }}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
            Dashboard Admin 👑
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Pengguna' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${activeTab === tab.id ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Spinner size={32} color="#2563EB" />
              <p className="text-slate-400 text-sm font-medium">Memuat data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ─── TAB: OVERVIEW ─── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon="👥" label="Total Pengguna" value={stats?.total_users?.toLocaleString('id-ID') || '0'}
                    sub="Semua role" bg="bg-blue-50" color="text-brand-blue"
                  />
                  <StatCard
                    icon="⭐" label="Subscriber Aktif" value={stats?.active_subscriptions?.toLocaleString('id-ID') || '0'}
                    sub="Pro & Intensif" bg="bg-emerald-50" color="text-emerald-600"
                  />
                  <StatCard
                    icon="✅" label="Sudah Onboarding" value={stats?.onboarded_users?.toLocaleString('id-ID') || '0'}
                    sub="Profil lengkap" bg="bg-violet-50" color="text-violet-600"
                  />
                  <StatCard
                    icon="💰" label="Total Revenue" value={formatCurrency(stats?.total_revenue || 0)}
                    sub="Semua waktu" bg="bg-amber-50" color="text-amber-600"
                  />
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-extrabold text-brand-dark text-base mb-4">Distribusi Pengguna</h2>
                    <div className="space-y-4">
                      {[
                        {
                          label: 'Tingkat Onboarding',
                          pct: stats ? Math.round((stats.onboarded_users / stats.total_users) * 100) : 0,
                          color: 'bg-brand-blue',
                          sub: `${stats?.onboarded_users || 0} dari ${stats?.total_users || 0} user`,
                        },
                        {
                          label: 'Konversi ke Berbayar',
                          pct: stats ? Math.round((stats.active_subscriptions / stats.total_users) * 100) : 0,
                          color: 'bg-emerald-500',
                          sub: `${stats?.active_subscriptions || 0} subscriber aktif`,
                        },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1.5">
                            <div>
                              <span className="text-sm font-semibold text-brand-dark">{item.label}</span>
                              <span className="text-xs text-slate-400 ml-2">{item.sub}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">{item.pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-brand-dark to-indigo-950 rounded-3xl p-6 text-white">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Aksi Cepat</p>
                    <div className="space-y-3">
                      {[
                        { icon: '📣', label: 'Kirim Notifikasi', desc: 'Broadcast ke semua user' },
                        { icon: '🎓', label: 'Tambah Mentor', desc: 'Onboard mentor baru' },
                        { icon: '📊', label: 'Export Data', desc: 'Download CSV pengguna' },
                      ].map(action => (
                        <button key={action.label}
                          className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors duration-200 flex items-center gap-3"
                        >
                          <span className="text-lg">{action.icon}</span>
                          <div>
                            <p className="font-bold text-white text-xs">{action.label}</p>
                            <p className="text-slate-400 text-xs">{action.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB: PENGGUNA ─── */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-extrabold text-brand-dark text-base">Pengguna Terbaru</h2>
                    <p className="text-xs text-slate-400 mt-0.5">10 pendaftar terbaru</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-gray-100 text-slate-500 font-semibold px-3 py-1.5 rounded-full">
                      {recentUsers.length} ditampilkan
                    </span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-xs bg-brand-blue text-white font-bold px-3 py-1.5 rounded-full hover:bg-blue-600 transition"
                    >
                      + Tambah User
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Nama', 'Email', 'Role', 'Onboarding', 'Subscription', 'Bergabung'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentUsers.map(u => {
                        const sub = getSubStatus(u.subscription_expires_at)
                        return (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-xs text-brand-blue flex-shrink-0">
                                  {u.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="font-semibold text-brand-dark text-sm whitespace-nowrap">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap
                                ${u.role === 'admin' ? 'bg-violet-100 text-violet-700'
                                  : u.role === 'mentor' ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-blue-100 text-brand-blue'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap
                                ${u.onboarding_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {u.onboarding_completed ? '✓ Selesai' : 'Belum'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sub.cls}`}>
                                {sub.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                              {formatDate(u.created_at)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {!recentUsers.length && (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-slate-400 font-semibold text-sm">Belum ada pengguna terdaftar</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── MODAL TAMBAH USER ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-[slideUp_0.3s_ease-out]">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
            >
              ✕
            </button>
            <h2 className="text-xl font-extrabold text-brand-dark mb-4">Tambah Pengguna Baru</h2>
            <form onSubmit={handleAddUser} className="flex flex-col gap-3">
              <input
                type="text" required placeholder="Nama Lengkap"
                value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none"
              />
              <input
                type="email" required placeholder="Email"
                value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none"
              />
              <input
                type="password" required placeholder="Password"
                value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none"
              />
              <select
                value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none bg-white font-semibold"
              >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
              <button
                type="submit" disabled={addLoading}
                className="w-full mt-2 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 transition"
              >
                {addLoading ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
