import { useState, useRef, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

/* ─── Autocomplete data ─────────────────────────────────────────────── */
const UNIVERSITIES = [
  'Universitas Indonesia', 'Institut Teknologi Bandung', 'Universitas Gadjah Mada',
  'Universitas Brawijaya', 'Universitas Diponegoro', 'Universitas Padjadjaran',
  'Universitas Airlangga', 'Universitas Hasanuddin', 'Universitas Sumatera Utara',
  'Universitas Sebelas Maret', 'Universitas Negeri Yogyakarta', 'Universitas Negeri Malang',
  'Universitas Pendidikan Indonesia', 'Institut Pertanian Bogor', 'Universitas Lampung',
  'Universitas Riau', 'Universitas Sriwijaya', 'Universitas Tanjungpura',
  'Universitas Mulawarman', 'Universitas Sam Ratulangi', 'Universitas Pattimura',
  'Universitas Cenderawasih', 'Universitas Islam Indonesia', 'Universitas Muhammadiyah Malang',
  'Universitas Bina Nusantara', 'Universitas Pelita Harapan', 'Universitas Trisakti',
  'Universitas Tarumanagara', 'Universitas Atma Jaya', 'Universitas Mercu Buana',
]

const MAJORS = [
  'Manajemen', 'Manajemen Bisnis', 'Manajemen Keuangan', 'Manajemen Pemasaran',
  'Akuntansi', 'Ekonomi', 'Ekonomi Pembangunan', 'Teknik Informatika', 'Ilmu Komputer',
  'Sistem Informasi', 'Teknik Elektro', 'Teknik Sipil', 'Teknik Mesin', 'Teknik Kimia',
  'Hukum', 'Ilmu Komunikasi', 'Psikologi', 'Sosiologi', 'Ilmu Politik', 'Hubungan Internasional',
  'Pendidikan Matematika', 'Pendidikan Bahasa Inggris', 'Kedokteran', 'Keperawatan',
  'Farmasi', 'Kesehatan Masyarakat', 'Agribisnis', 'Agroteknologi', 'Biologi',
  'Kimia', 'Matematika', 'Fisika', 'Statistika', 'Arsitektur', 'Desain Grafis',
]

/* ─── Autocomplete Input ──────────────────────────────────────────────── */
function AutocompleteInput({ placeholder, data, value, onChange, onSelect }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState(value || '')
  const ref = useRef(null)

  const filtered = q.length >= 2
    ? data.filter(item => item.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    setQ(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelect = (item) => {
    setQ(item)
    onSelect(item)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={handleChange}
          onFocus={() => q.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none text-sm text-brand-dark placeholder:text-slate-300 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          {filtered.map(item => (
            <button
              key={item}
              onMouseDown={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 text-sm text-brand-dark hover:bg-blue-50 hover:text-brand-blue transition-colors font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Step indicators ─────────────────────────────────────────────────── */
function ProgressDots({ current, total }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-slate-400">Langkah {current} dari {total}</p>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300
              ${i < current ? 'w-6 h-2 bg-brand-blue' : i === current - 1 ? 'w-6 h-2 bg-brand-blue' : 'w-2 h-2 bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────────────── */
function OnboardingPage({ user, onNavigate }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    university: '',
    studyLevel: '',
    major: '',
    guideFile: null,
  })
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const canNext1 = formData.university.trim().length > 0 && formData.studyLevel !== ''
  const canNext2 = formData.major.trim().length > 0

  const skipAll = () => finishOnboarding()

  const finishOnboarding = async (file) => {
    try {
      const raw = localStorage.getItem('mantra_auth_session')
      if (raw) {
        const session = JSON.parse(raw)
        if (session.user) {
          session.user.onboarding_completed = 1
          localStorage.setItem('mantra_auth_session', JSON.stringify(session))
        }
      }
      // If there's a file, upload it in the background (fire-and-forget)
      if (file) {
        const token = JSON.parse(localStorage.getItem('mantra_auth_session'))?.token
        const fd = new FormData()
        fd.append('guide', file)
        fd.append('university', formData.university)
        fd.append('major', formData.major)
        fd.append('studyLevel', formData.studyLevel)
        fetch(`${API_BASE_URL}/api/users/upload-guide`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }).catch(() => {})
      }
    } catch {}
    onNavigate('dashboard', { ...user, onboarding_completed: 1 })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setFormData({ ...formData, guideFile: file })
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) setFormData({ ...formData, guideFile: file })
  }

  return (
    <div className="font-jakarta min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-10 relative">

      {/* Skip all */}
      <button
        onClick={skipAll}
        className="absolute top-5 right-5 text-xs font-semibold text-slate-400 hover:text-brand-dark transition-colors underline underline-offset-2"
      >
        Lewati semua →
      </button>

      {/* Card container */}
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-base">✨</span>
          </div>
          <span className="font-extrabold text-brand-dark text-lg">Mantra Skripsi</span>
        </div>

        {/* Progress */}
        <div className="flex justify-center mb-8">
          <ProgressDots current={step} total={3} />
        </div>

        {/* ── STEP 1 ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-[slideUp_0.35s_ease-out]">
            <h2 className="text-2xl font-extrabold text-brand-dark mb-1">Di mana anda belajar?</h2>
            <p className="text-slate-400 text-sm mb-7">Kami akan menyesuaikan format dokumen sesuai kampus Anda.</p>

            {/* University search */}
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Universitas</label>
            <AutocompleteInput
              placeholder="Cari nama universitas..."
              data={UNIVERSITIES}
              value={formData.university}
              onChange={(v) => setFormData({ ...formData, university: v })}
              onSelect={(v) => setFormData({ ...formData, university: v })}
            />

            {/* Study level pills */}
            <div className="mt-6 mb-8">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Jenjang Studi</label>
              <div className="flex gap-2.5">
                {['D3', 'S1', 'S2', 'S3'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFormData({ ...formData, studyLevel: lvl })}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-150
                      ${formData.studyLevel === lvl
                        ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-blue-200'
                        : 'bg-white text-slate-500 border-gray-200 hover:border-brand-blue hover:text-brand-blue'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!canNext1}
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-200
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                bg-brand-dark text-white hover:bg-slate-800 shadow-md"
            >
              Lanjut →
            </button>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-[slideUp_0.35s_ease-out]">
            {/* Back */}
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-dark text-sm font-semibold mb-6 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Kembali
            </button>

            <h2 className="text-2xl font-extrabold text-brand-dark mb-1">Apa jurusan atau bidang kajian anda?</h2>
            <p className="text-slate-400 text-sm mb-7">AI Brainstorming kami akan memberikan ide judul yang relevan dengan bidang Anda.</p>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jurusan / Bidang</label>
            <AutocompleteInput
              placeholder="Cari jurusan..."
              data={MAJORS}
              value={formData.major}
              onChange={(v) => setFormData({ ...formData, major: v })}
              onSelect={(v) => setFormData({ ...formData, major: v })}
            />

            <button
              disabled={!canNext2}
              onClick={() => setStep(3)}
              className="w-full mt-10 py-3.5 rounded-xl font-extrabold text-sm transition-all duration-200
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                bg-brand-dark text-white hover:bg-slate-800 shadow-md"
            >
              Lanjut →
            </button>
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-[slideUp_0.35s_ease-out]">
            {/* Back */}
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-dark text-sm font-semibold mb-6 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Kembali
            </button>

            <h2 className="text-2xl font-extrabold text-brand-dark mb-1">Mari sesuaikan dengan format kampus anda</h2>
            <p className="text-slate-400 text-sm mb-7">
              Muat naik fail Buku Panduan Penulisan Skripsi kampus anda agar AI kami boleh menyusun format secara automatik.
            </p>

            {/* Upload area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragging ? 'border-brand-blue bg-blue-50' : formData.guideFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-brand-blue hover:bg-blue-50/30'}`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleFileInput} className="hidden" />

              {formData.guideFile ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📄</span>
                  <p className="font-bold text-emerald-700 text-sm">{formData.guideFile.name}</p>
                  <p className="text-xs text-emerald-500">{(formData.guideFile.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, guideFile: null }) }}
                    className="mt-1 text-xs text-red-400 font-semibold hover:text-red-600 transition"
                  >
                    Hapus file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-500 text-sm">Seret file ke sini, atau</p>
                    <button className="mt-2 px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition">
                      Pilih Fail
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">Mendukung .PDF dan .DOCX</p>
                </div>
              )}
            </div>

            {/* Microcopy */}
            <p className="text-xs text-slate-400 mt-3 text-center">
              * Tidak punya? Lewati, kami akan pakai format standard.
            </p>

            <button
              onClick={() => finishOnboarding(formData.guideFile)}
              className="w-full mt-6 py-3.5 rounded-xl font-extrabold text-sm bg-brand-dark text-white hover:bg-slate-800 transition shadow-md"
            >
              Mulai! 🚀
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-300 mt-6">
          Data Anda aman dan hanya digunakan untuk personalisasi. Dapat diubah kapan saja di Settings.
        </p>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

export default OnboardingPage
