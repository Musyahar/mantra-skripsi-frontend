import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function OwnerDashboard({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="font-jakarta bg-surface min-h-screen text-slate-600">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-dark flex items-center justify-center shadow-md shadow-gray-200">
              <span className="text-white text-sm leading-none">👑</span>
            </div>
            <span className="font-extrabold text-brand-dark text-sm">Mantra Skripsi</span>
            <span className="hidden sm:block text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full ml-1">
              Owner Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-brand-dark">{user?.name || 'Owner'}</span>
            <button
              onClick={() => { localStorage.removeItem('mantra_auth_session'); onNavigate('landing') }}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-brand-dark mb-1">
            Dashboard Utama (Owner)
          </h1>
          <p className="text-slate-500 text-sm">Akses analitik finansial dan pengaturan sistem global.</p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-amber-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-amber-600">💰</div>
            <h2 className="text-base font-bold text-brand-dark mb-1">Analitik Finansial</h2>
            <p className="text-xs text-slate-500">Lihat laba bersih, omset, dan laporan pendapatan.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-brand-blue">⚙️</div>
            <h2 className="text-base font-bold text-brand-dark mb-1">Pengaturan Global</h2>
            <p className="text-xs text-slate-500">Ubah komisi mentor dan harga paket subscription.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-violet-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-violet-600">🛡️</div>
            <h2 className="text-base font-bold text-brand-dark mb-1">Manajemen Admin</h2>
            <p className="text-xs text-slate-500">Buat, tambah, atau nonaktifkan akun Admin.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-emerald-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-emerald-600">👨‍🏫</div>
            <h2 className="text-base font-bold text-brand-dark mb-1">Manajemen Mentor</h2>
            <p className="text-xs text-slate-500">Buat akun mentor, setujui pendaftaran, atau nonaktifkan.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-pink-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-pink-600">🎓</div>
            <h2 className="text-base font-bold text-brand-dark mb-1">Manajemen Member</h2>
            <p className="text-xs text-slate-500">Nonaktifkan akun member (mahasiswa) yang melanggar.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-indigo-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-indigo-600">📢</div>
            <h2 className="text-base font-bold text-brand-dark mb-1">Pengumuman & Audit</h2>
            <p className="text-xs text-slate-500">Kirim pesan massal dan lihat log audit aktivitas Admin/Owner.</p>
          </div>

        </div>

      </main>
    </div>
  )
}

export default OwnerDashboard
