import { useState, useCallback } from 'react'
import PasswordInput from '../components/PasswordInput'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// ─── Validation helpers ────────────────────────────────────
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^(\+62|62|0)[0-9]{8,13}$/

function validateIdentifier(value) {
  const v = value.trim()
  if (!v) return 'Email atau No. HP wajib diisi'
  if (!emailPattern.test(v) && !phonePattern.test(v)) {
    return 'Masukkan format email (contoh@email.com) atau nomor HP (08xx / +62xx)'
  }
  return null
}

// ─── SVG Icons ─────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const QuoteIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M8 28V20C8 14.477 12.477 10 18 10h1v4h-1c-3.314 0-6 2.686-6 6v1h6v7H8zm16 0V20c0-5.523 4.477-10 10-10h1v4h-1c-3.314 0-6 2.686-6 6v1h6v7h-10z" fill="rgba(243,201,105,0.35)"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
)

// ─── Component ─────────────────────────────────────────────
function LoginPage({ onNavigate }) {
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const updateField = useCallback((e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setFieldErrors((fe) => ({ ...fe, [name]: null }))
    setErrorMsg('')
  }, [])

  const redirectByRole = useCallback((user) => {
    // If user never completed onboarding, show the wizard first
    if (!user.onboarding_completed) {
      onNavigate('onboarding', user)
    } else {
      onNavigate('dashboard', user)
    }
  }, [onNavigate])


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return

    // Client-side validation
    const identifierError = validateIdentifier(form.identifier)
    if (identifierError) {
      setFieldErrors({ identifier: identifierError })
      return
    }
    if (!form.password) {
      setFieldErrors({ password: 'Password wajib diisi' })
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.identifier.trim(), password: form.password }),
      })
      const result = await res.json()

      if (!res.ok) {
        setErrorMsg(result.message || 'Email atau password salah, coba lagi.')
        return
      }

      // Simpan session
      localStorage.setItem('mantra_auth_session', JSON.stringify(result.data))

      // Redirect berdasarkan role & onboarding
      redirectByRole(result.data.user)
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server. Periksa koneksi internetmu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    setErrorMsg('')

    try {
      if (!GOOGLE_CLIENT_ID) {
        setErrorMsg('Login Google belum tersedia. Hubungi tim Mantra Skripsi.')
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
              setErrorMsg(result.message || 'Login Google gagal, coba lagi.')
              return
            }

            localStorage.setItem('mantra_auth_session', JSON.stringify(result.data))
            redirectByRole(result.data.user)
          } catch {
            setErrorMsg('Terjadi kesalahan saat login dengan Google.')
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

  return (
    <main className="font-jakarta min-h-[100svh] grid grid-cols-1 lg:grid-cols-2 bg-surface">
      {/* ── LEFT: Form ── */}
      <section className="flex flex-col items-center justify-center p-8 lg:p-12 overflow-y-auto" aria-label="Form Login">
        <div className="w-full max-w-[420px] flex flex-col">

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-3xl bg-brand-blue flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <span className="text-white text-2xl leading-none">✨</span>
            </div>
            <span className="text-sm font-extrabold text-brand-blue tracking-wide uppercase mb-5">Mantra Skripsi</span>
            <h1 className="text-[26px] font-extrabold text-brand-dark text-center mb-1.5">Masuk ke akun Anda</h1>
            <p className="text-slate-400 text-sm text-center">Lanjutkan bimbingan skripsimu</p>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-12 rounded-3xl border border-gray-200 bg-white flex items-center justify-center gap-2.5 text-sm font-bold text-slate-600 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            {isGoogleLoading ? <SpinnerIcon /> : <GoogleIcon />}
            <span>{isGoogleLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-slate-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

            {/* Email / No HP */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-identifier" className="text-sm font-bold text-brand-dark">Email atau No. HP</label>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={updateField}
                placeholder="contoh@email.com atau 0812xxxx"
                autoComplete="username"
                disabled={isLoading}
                required
                className={`w-full h-12 px-4 rounded-2xl border-2 text-sm text-slate-600 bg-white outline-none transition-all duration-300
                  ${fieldErrors.identifier ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-blue-100'}`}
              />
              {fieldErrors.identifier && (
                <p className="text-xs text-red-500 font-medium mt-1" role="alert">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-bold text-brand-dark">Password</label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('forgot-password') }}
                  className="text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors"
                >
                  Lupa password?
                </a>
              </div>
              <PasswordInput
                id="login-password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Password kamu"
                autoComplete="current-password"
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 font-medium mt-1" role="alert">{fieldErrors.password}</p>
              )}
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
              disabled={isLoading}
              className={`w-full h-12 mt-2 rounded-3xl flex items-center justify-center gap-2 font-bold text-white transition-all duration-300 hover:-translate-y-1
                ${isLoading ? 'bg-blue-400 cursor-not-allowed opacity-80' : 'bg-brand-blue hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
            >
              {isLoading && <SpinnerIcon />}
              <span>{isLoading ? 'Masuk...' : 'Masuk'}</span>
            </button>
          </form>

          {/* Footer */}
          <footer className="text-center mt-8 flex flex-col gap-3">
            <p className="text-sm font-medium text-slate-500">
              Belum punya akun?{' '}
              <a href="/register" onClick={(e) => { e.preventDefault(); onNavigate('register') }} className="text-brand-blue font-bold hover:underline">
                Daftar di sini
              </a>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed px-4">
              Dengan masuk, kamu menyetujui{' '}
              <a href="/syarat-ketentuan" className="underline hover:text-slate-600">Syarat &amp; Ketentuan</a>
              {' '}dan{' '}
              <a href="/kebijakan-privasi" className="underline hover:text-slate-600">Kebijakan Privasi</a>
              {' '}Mantra Skripsi.
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

export default LoginPage
