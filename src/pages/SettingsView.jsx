import { useState } from 'react'

export default function SettingsView({ user, onLogout }) {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    university: 'Universitas Indonesia', // Mock default based on onboarding
    studyLevel: 'S1',
    major: 'Sistem Informasi'
  })

  const [security, setSecurity] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notif, setNotif] = useState({
    mentorSession: { enabled: true, method: 'email' },
    subExpiry: { enabled: true, method: 'whatsapp' },
    updates: { enabled: false, method: 'email' }
  })

  const isGoogleAccount = !!user?.google_id

  return (
    <div className="max-w-4xl w-full mx-auto animate-[slideUp_0.3s_ease-out]">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-dark">Pengaturan Akun</h1>
        <p className="text-slate-400 text-sm mt-0.5">Kelola profil, preferensi notifikasi, dan keamanan akun Anda.</p>
      </div>

      <div className="space-y-6">
        {/* ─── PROFIL ─── */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-dark mb-4">Profil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No. HP (WhatsApp)</label>
              <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="Contoh: 081234567890"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Universitas</label>
              <input type="text" value={profile.university} onChange={e => setProfile({...profile, university: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenjang</label>
              <select value={profile.studyLevel} onChange={e => setProfile({...profile, studyLevel: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark bg-white">
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jurusan</label>
              <input type="text" value={profile.major} onChange={e => setProfile({...profile, major: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-sm">
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* ─── KEAMANAN ─── */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-dark mb-4">Keamanan</h2>
          {isGoogleAccount ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.636h6.458a5.523 5.523 0 01-2.395 3.627v3.018h3.878c2.269-2.088 3.579-5.163 3.579-8.826z" fill="#4285F4"/><path fillRule="evenodd" clipRule="evenodd" d="M12 24c3.24 0 5.956-1.075 7.942-2.902l-3.878-3.018c-1.075.72-2.449 1.145-4.064 1.145-3.125 0-5.768-2.11-6.714-4.95H1.282v3.11A11.998 11.998 0 0012 24z" fill="#34A853"/><path fillRule="evenodd" clipRule="evenodd" d="M5.286 14.275A7.218 7.218 0 014.909 12c0-.785.136-1.55.377-2.275V6.615H1.282A11.966 11.966 0 000 12c0 1.936.463 3.763 1.282 5.385l4.004-3.11z" fill="#FBBC05"/><path fillRule="evenodd" clipRule="evenodd" d="M12 4.773c1.762 0 3.344.605 4.587 1.794l3.436-3.436C17.95 1.189 15.234 0 12 0 7.391 0 3.336 2.651 1.282 6.615l4.004 3.11c.946-2.84 3.589-4.952 6.714-4.952z" fill="#EA4335"/></svg>
              <div>
                <p className="text-sm font-bold text-brand-dark">Akun terhubung dengan Google</p>
                <p className="text-xs text-slate-400">Anda login menggunakan Google. Pengelolaan password ditangani oleh Google.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Baru</label>
                <input type="password" value={security.newPassword} onChange={e => setSecurity({...security, newPassword: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Password Baru</label>
                <input type="password" value={security.confirmPassword} onChange={e => setSecurity({...security, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark" />
              </div>
              <button className="px-6 py-2.5 bg-gray-100 text-brand-dark rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                Ganti Password
              </button>
            </div>
          )}
        </div>

        {/* ─── NOTIFIKASI ─── */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-dark mb-1">Notifikasi</h2>
          <p className="text-xs text-slate-400 mb-6">Pilih informasi apa saja yang ingin Anda terima.</p>
          
          <div className="space-y-4 max-w-2xl">
            {[
              { id: 'mentorSession', title: 'Pengingat sesi mentor', desc: 'Notifikasi jadwal dan link sesi bimbingan 1-on-1.' },
              { id: 'subExpiry', title: 'Pengingat subscription', desc: 'Pemberitahuan saat paket langganan hampir habis.' },
              { id: 'updates', title: 'Update fitur baru', desc: 'Berita rilis fitur baru dan pesan dari tim Mantra Skripsi.' },
            ].map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition">
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-dark">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Method selector */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setNotif({...notif, [item.id]: {...notif[item.id], method: 'email'}})}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition ${notif[item.id].method === 'email' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Email</button>
                    <button onClick={() => setNotif({...notif, [item.id]: {...notif[item.id], method: 'whatsapp'}})}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition ${notif[item.id].method === 'whatsapp' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>WhatsApp</button>
                  </div>
                  {/* Toggle */}
                  <button onClick={() => setNotif({...notif, [item.id]: {...notif[item.id], enabled: !notif[item.id].enabled}})}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${notif[item.id].enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notif[item.id].enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── AKUN ─── */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-brand-dark mb-1">Manajemen Akun</h2>
            <p className="text-xs text-slate-400">Keluar dari sesi saat ini atau hapus akun permanen.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-gray-50">
            <button onClick={onLogout}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-brand-dark rounded-xl text-sm font-bold hover:bg-gray-200 transition">
              Keluar Sesi
            </button>
            <div className="flex-1 hidden sm:block" />
            <button 
              className="w-full sm:w-auto px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 hover:text-red-700 transition">
              Hapus Akun Permanen
            </button>
          </div>
        </div>
      </div>
      <div className="h-12" />
    </div>
  )
}
