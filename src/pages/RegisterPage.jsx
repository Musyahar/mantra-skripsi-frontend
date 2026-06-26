import { useState, useCallback, useRef } from 'react'
import PasswordInput from '../components/PasswordInput'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// ─── Validation helpers ────────────────────────────────────
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^(\+62|62|0)[0-9]{8,13}$/

// ─── SVG Icons ─────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
)

const QuoteIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M8 28V20C8 14.477 12.477 10 18 10h1v4h-1c-3.314 0-6 2.686-6 6v1h6v7H8zm16 0V20c0-5.523 4.477-10 10-10h1v4h-1c-3.314 0-6 2.686-6 6v1h6v7h-10z" fill="rgba(243,201,105,0.35)"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2 6 5 9 10 3"/>
  </svg>
)

// ─── Password Strength ─────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-600']
const strengthLabels = ['Lemah', 'Cukup', 'Baik', 'Kuat']

// ─── Custom Checkbox ───────────────────────────────────────
function CustomCheckbox({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 py-0.5 cursor-pointer select-none group">
      <div
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all duration-200
          ${checked ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 group-hover:border-brand-blue'}`}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' && onChange(!checked)}
      >
        {checked && <CheckIcon />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
        {children}
      </span>
    </label>
  )
}

// ─── Component ─────────────────────────────────────────────
function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({ name: '', identifier: '', password: '' })
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [emailStatus, setEmailStatus] = useState(null) // null | 'checking' | 'exists' | 'ok'
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const emailCheckTimeout = useRef(null)
  const passwordStrength = getPasswordStrength(form.password)

  const update = useCallback((e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setFieldErrors((fe) => ({ ...fe, [name]: null }))
    setErrorMsg('')
    if (name === 'identifier') setEmailStatus(null)
  }, [])

  // Real-time: check if email already exists on blur
  const handleIdentifierBlur = useCallback(async () => {
    const val = form.identifier.trim()
    if (!val || !emailPattern.test(val)) return

    setEmailStatus('checking')
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val }),
      })
      const data = await res.json()
      setEmailStatus(data.exists ? 'exists' : 'ok')
    } catch {
      setEmailStatus(null)
    }
  }, [form.identifier])

  const redirectToOnboarding = useCallback((user) => {
    // Onboarding is now handled inside UserDashboard wrapper
    onNavigate('dashboard', user)
  }, [onNavigate])

  // Google Sign Up
  const handleGoogleSignup = async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    setErrorMsg('')

    try {
      if (!GOOGLE_CLIENT_ID) {
        setErrorMsg('Daftar dengan Google belum tersedia. Hubungi tim Mantra Skripsi.')
        setIsGoogleLoading(false)
        return
      }

      if (!window.google) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://accounts.google.com/gsi/client'
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_token: response.credential }),
            })
            const result = await res.json()

            if (!res.ok) {
              setErrorMsg(result.message || 'Daftar dengan Google gagal, coba lagi.')
              return
            }

            localStorage.setItem('mantra_auth_session', JSON.stringify(result.data))
            // Always redirect to onboarding — even if existing user, ensure onboarding is checked
            const user = result.data.user
            onNavigate('dashboard', user)
          } catch {
            setErrorMsg('Terjadi kesalahan saat mendaftar dengan Google.')
          } finally {
            setIsGoogleLoading(false)
          }
        },
      })

      window.google.accounts.id.prompt()
    } catch {
      setErrorMsg('Tidak dapat memuat layanan Google. Periksa koneksimu.')
      setIsGoogleLoading(false)
    }
  }

  // Manual Register
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading || !agreed) return

    // Validate
    const errors = {}
    if (!form.name.trim()) errors.name = 'Nama lengkap wajib diisi'
    const id = form.identifier.trim()
    if (!id) {
      errors.identifier = 'Email atau No. HP wajib diisi'
    } else if (!emailPattern.test(id) && !phonePattern.test(id)) {
      errors.identifier = 'Masukkan format email (contoh@email.com) atau nomor HP (08xx / +62xx)'
    }
    if (!form.password) {
      errors.password = 'Password wajib diisi'
    } else if (form.password.length < 8) {
      errors.password = 'Password minimal 8 karakter'
    }
    if (emailStatus === 'exists') {
      errors.identifier = 'Email ini sudah terdaftar.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const payload = {
        name: form.name.trim(),
        email: emailPattern.test(id) ? id.toLowerCase() : undefined,
        phone: phonePattern.test(id) ? id : undefined,
        password: form.password,
        role: 'mahasiswa',
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok) {
        setErrorMsg(result.message || 'Pendaftaran gagal. Coba lagi.')
        return
      }

      localStorage.setItem('mantra_auth_session', JSON.stringify(result.data))
      // Selalu ke Onboarding setelah register baru
      redirectToOnboarding(result.data.user)
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server. Periksa koneksi internetmu.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormReady = agreed && !isLoading && emailStatus !== 'exists'
  const showPasswordHint = form.password.length > 0 && form.password.length < 8
  const showStrengthBar = form.password.length >= 8

  return (
    <main className="font-jakarta min-h-[100svh] grid grid-cols-1 lg:grid-cols-2 bg-surface">
      {/* ── LEFT: Form ── */}
      <section className="flex flex-col items-center justify-center p-8 lg:p-12 overflow-y-auto" aria-label="Form Pendaftaran">
        <div className="w-full max-w-[420px] flex flex-col">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-3xl bg-brand-blue flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <span className="text-white text-2xl leading-none">✨</span>
            </div>
            <span className="text-sm font-extrabold text-brand-blue tracking-wide uppercase mb-5">Mantra Skripsi</span>
            <h1 className="text-[26px] font-extrabold text-brand-dark text-center mb-1.5">Buat akun baru</h1>
            <p className="text-slate-400 text-sm text-center leading-relaxed">Mulai skripsimu dengan AI &amp; bimbingan mentor</p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full h-12 rounded-3xl border border-gray-200 bg-white flex items-center justify-center gap-2.5 text-sm font-bold text-slate-600 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            {isGoogleLoading ? <SpinnerIcon /> : <GoogleIcon />}
            <span>{isGoogleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-slate-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

            {/* Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-name" className="text-sm font-bold text-brand-dark">Nama Lengkap</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                value={form.name}
                onChange={update}
                placeholder="Nama kamu"
                autoComplete="name"
                disabled={isLoading}
                required
                className={`w-full h-12 px-4 rounded-2xl border-2 text-sm text-slate-600 bg-white outline-none transition-all duration-300
                  ${fieldErrors.name ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-blue-100'}`}
              />
              {fieldErrors.name && <p className="text-xs text-red-500 font-medium mt-1" role="alert">{fieldErrors.name}</p>}
            </div>

            {/* Email / No HP */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-identifier" className="text-sm font-bold text-brand-dark">Email atau No. HP</label>
              <div className="relative">
                <input
                  id="reg-identifier"
                  name="identifier"
                  type="text"
                  value={form.identifier}
                  onChange={update}
                  onBlur={handleIdentifierBlur}
                  placeholder="nama@email.com atau 0812xxxx"
                  autoComplete="username"
                  disabled={isLoading}
                  required
                  className={`w-full h-12 pl-4 pr-10 rounded-2xl border-2 text-sm text-slate-600 bg-white outline-none transition-all duration-300
                    ${(fieldErrors.identifier || emailStatus === 'exists') ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : emailStatus === 'ok' ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                      : 'border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-blue-100'}`}
                />
                {/* Status indicator */}
                {emailStatus === 'checking' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <SpinnerIcon />
                  </div>
                )}
                {emailStatus === 'ok' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Email exists warning */}
              {emailStatus === 'exists' && (
                <div className="flex items-center gap-2 p-3 mt-1 rounded-lg bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>
                    Email terdaftar. <button type="button" onClick={() => onNavigate('login')} className="underline hover:text-orange-700">Login di sini</button>
                  </span>
                </div>
              )}
              {fieldErrors.identifier && !emailStatus && (
                <p className="text-xs text-red-500 font-medium mt-1" role="alert">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-bold text-brand-dark">Password</label>
              <PasswordInput
                id="reg-password"
                name="password"
                value={form.password}
                onChange={update}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                disabled={isLoading}
              />
              
              {showPasswordHint && (
                <p className="text-xs text-red-500 font-medium mt-1">Password minimal 8 karakter</p>
              )}

              {/* Password strength */}
              {showStrengthBar && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map(level => (
                      <div key={level} className={`flex-1 rounded-full transition-colors duration-300
                        ${passwordStrength >= level ? strengthColors[passwordStrength - 1] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-bold text-right ${
                    passwordStrength === 1 ? 'text-red-500' :
                    passwordStrength === 2 ? 'text-orange-500' :
                    passwordStrength === 3 ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>
                    {strengthLabels[passwordStrength - 1]}
                  </p>
                </div>
              )}
              
              {fieldErrors.password && !showPasswordHint && (
                <p className="text-xs text-red-500 font-medium mt-1" role="alert">{fieldErrors.password}</p>
              )}
            </div>

            {/* Checkbox */}
            <div className="mt-2">
              <CustomCheckbox checked={agreed} onChange={setAgreed}>
                Saya menyetujui <a href="/syarat-ketentuan" className="text-brand-blue hover:underline">Syarat &amp; Ketentuan</a> dan <a href="/kebijakan-privasi" className="text-brand-blue hover:underline">Kebijakan Privasi</a> yang berlaku.
              </CustomCheckbox>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 mt-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormReady}
              className={`w-full h-12 mt-2 rounded-3xl flex items-center justify-center gap-2 font-bold text-white transition-all duration-300 hover:-translate-y-1
                ${!isFormReady ? 'bg-gray-300 cursor-not-allowed opacity-60' 
                 : isLoading ? 'bg-blue-400 cursor-not-allowed opacity-80' 
                 : 'bg-brand-blue hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
            >
              {isLoading && <SpinnerIcon />}
              <span>{isLoading ? 'Mendaftar...' : 'Buat Akun'}</span>
            </button>
          </form>

          {/* Footer */}
          <footer className="text-center mt-8">
            <p className="text-sm font-medium text-slate-500">
              Sudah punya akun?{' '}
              <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('login') }} className="text-brand-blue font-bold hover:underline">
                Masuk di sini
              </a>
            </p>
          </footer>

        </div>
      </section>

      {/* ── RIGHT: Visual & Motivasi ── */}
      <section className="hidden lg:flex relative bg-gradient-to-br from-indigo-900 to-brand-dark flex-col items-center justify-end overflow-hidden pb-16">
        
        {/* Badge */}
        <div className="absolute top-10 left-10 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          <span className="text-xs font-bold text-white">Platform Bimbingan Skripsi #1</span>
        </div>

        {/* Stats Strip */}
        <div className="absolute top-10 right-10 z-10 flex gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-lg font-extrabold text-yellow-400 leading-none">12rb+</span>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide leading-tight">Mahasiswa<br/>Lulus</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-lg font-extrabold text-yellow-400 leading-none">4.9/5</span>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide leading-tight">Rating<br/>Pengguna</span>
          </div>
        </div>

        {/* Hero Image */}
        <img
          src="/login-hero.png"
          alt="Mahasiswa yang berhasil wisuda"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091120] via-[#091120]/60 to-transparent" />

        {/* Quote Box */}
        <div className="relative z-10 max-w-[400px] px-8 text-center">
          <div className="flex justify-center mb-4">
            <QuoteIcon />
          </div>
          <blockquote className="text-lg font-bold text-white leading-relaxed mb-4 italic">
            "Selesaikan skripsimu secepat mungkin, kemudian bangun kariermu secara baik sedini mungkin."
          </blockquote>
          <cite className="text-xs font-bold text-yellow-400 tracking-wider uppercase">
            — Founder of Mantra Skripsi
          </cite>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage
