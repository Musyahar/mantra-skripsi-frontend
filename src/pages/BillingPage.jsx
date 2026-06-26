import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('mantra_auth_session'))?.token || null
  } catch { return null }
}

// ─── Plans Data ──────────────────────────────────────────────
const PLANS = {
  monthly: [
    {
      id: 'starter',
      name: 'Starter',
      price: null,
      priceDisplay: 'Gratis',
      period: '',
      desc: 'Coba Mantra Skripsi tanpa risiko.',
      color: 'border-gray-200',
      badge: null,
      features: [
        { text: '5 pesan AI per hari', included: true },
        { text: 'Template dasar', included: true },
        { text: 'Komunitas pengguna', included: true },
        { text: 'Bimbingan mentor', included: false },
        { text: 'Format otomatis kampus', included: false },
        { text: 'Simulasi sidang', included: false },
      ],
      cta: 'Paket Saat Ini',
      ctaDisabled: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 149000,
      priceDisplay: 'Rp 149.000',
      period: '/ bulan',
      desc: 'Untuk mahasiswa yang serius ingin cepat selesai.',
      color: 'border-brand-blue',
      badge: '🔥 Terpopuler',
      badgeBg: 'bg-brand-blue',
      features: [
        { text: 'AI tanpa batas', included: true },
        { text: 'Format otomatis kampus', included: true },
        { text: '2 sesi mentor / bulan', included: true },
        { text: 'Simulasi sidang AI', included: true },
        { text: 'Prioritas dukungan', included: true },
        { text: 'Mentor langsung WhatsApp', included: false },
      ],
      cta: 'Pilih Pro',
      featured: true,
    },
    {
      id: 'intensif',
      name: 'Intensif',
      price: 349000,
      priceDisplay: 'Rp 349.000',
      period: '/ bulan',
      desc: 'Mentoring intensif untuk deadline mepet.',
      color: 'border-violet-300',
      badge: '🎓 Paling Lengkap',
      badgeBg: 'bg-violet-600',
      features: [
        { text: 'Semua fitur Pro', included: true },
        { text: '8 sesi mentor / bulan', included: true },
        { text: 'Mentor langsung WhatsApp', included: true },
        { text: 'Revisi tidak terbatas', included: true },
        { text: 'Review dokumen 48 jam', included: true },
        { text: 'Garansi lulus sidang*', included: true },
      ],
      cta: 'Pilih Intensif',
    },
  ],
  quarterly: [
    {
      id: 'starter',
      name: 'Starter',
      price: null,
      priceDisplay: 'Gratis',
      period: '',
      desc: 'Coba Mantra Skripsi tanpa risiko.',
      color: 'border-gray-200',
      badge: null,
      features: [
        { text: '5 pesan AI per hari', included: true },
        { text: 'Template dasar', included: true },
        { text: 'Komunitas pengguna', included: true },
        { text: 'Bimbingan mentor', included: false },
        { text: 'Format otomatis kampus', included: false },
        { text: 'Simulasi sidang', included: false },
      ],
      cta: 'Paket Saat Ini',
      ctaDisabled: true,
    },
    {
      id: 'pro_3',
      name: 'Pro',
      price: 399000,
      priceDisplay: 'Rp 399.000',
      pricePerMonth: 'Rp 133.000/bln',
      saving: 'Hemat Rp 48.000',
      period: '/ 3 bulan',
      desc: 'Harga terbaik untuk pengerjaan skripsi 3 bulan.',
      color: 'border-brand-blue',
      badge: '🔥 Terpopuler',
      badgeBg: 'bg-brand-blue',
      features: [
        { text: 'AI tanpa batas', included: true },
        { text: 'Format otomatis kampus', included: true },
        { text: '2 sesi mentor / bulan', included: true },
        { text: 'Simulasi sidang AI', included: true },
        { text: 'Prioritas dukungan', included: true },
        { text: 'Mentor langsung WhatsApp', included: false },
      ],
      cta: 'Pilih Pro 3 Bulan',
      featured: true,
    },
    {
      id: 'intensif_3',
      name: 'Intensif',
      price: 899000,
      priceDisplay: 'Rp 899.000',
      pricePerMonth: 'Rp 300.000/bln',
      saving: 'Hemat Rp 148.000',
      period: '/ 3 bulan',
      desc: 'Mentoring penuh selama 3 bulan sampai sidang.',
      color: 'border-violet-300',
      badge: '🎓 Paling Lengkap',
      badgeBg: 'bg-violet-600',
      features: [
        { text: 'Semua fitur Pro', included: true },
        { text: '8 sesi mentor / bulan', included: true },
        { text: 'Mentor langsung WhatsApp', included: true },
        { text: 'Revisi tidak terbatas', included: true },
        { text: 'Review dokumen 48 jam', included: true },
        { text: 'Garansi lulus sidang*', included: true },
      ],
      cta: 'Pilih Intensif 3 Bulan',
    },
  ],
}

// ─── Spinner ─────────────────────────────────────────────────
function Spinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  )
}

// ─── Plan Card ───────────────────────────────────────────────
function PlanCard({ plan, onSelect, loadingId }) {
  const isLoading = loadingId === plan.id
  const isDisabled = !!loadingId

  return (
    <div className={`relative bg-white rounded-3xl border-2 ${plan.color} p-7 flex flex-col transition-all duration-300
      ${plan.featured ? 'shadow-2xl scale-[1.03]' : 'hover:shadow-lg hover:-translate-y-1'}`}>

      {plan.badge && (
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${plan.badgeBg} text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap`}>
          {plan.badge}
        </div>
      )}

      <div className="mb-5">
        <h3 className="font-extrabold text-xl text-brand-dark mb-1">{plan.name}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{plan.desc}</p>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-3xl text-brand-dark">{plan.priceDisplay}</span>
          {plan.period && <span className="text-slate-400 text-sm">{plan.period}</span>}
        </div>
        {plan.pricePerMonth && (
          <p className="text-xs text-slate-400 mt-0.5">{plan.pricePerMonth}</p>
        )}
        {plan.saving && (
          <p className="text-xs font-bold text-emerald-600 mt-1">✓ {plan.saving}</p>
        )}
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {plan.features.map(f => (
          <li key={f.text} className={`flex items-center gap-2.5 text-sm
            ${f.included ? 'text-brand-dark' : 'text-slate-300'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0
              ${f.included ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}`}>
              {f.included ? '✓' : '✗'}
            </span>
            <span className={f.included ? 'font-medium' : 'line-through'}>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => !plan.ctaDisabled && onSelect(plan.id)}
        disabled={isDisabled || plan.ctaDisabled}
        className={`w-full py-3 rounded-3xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1
          ${plan.ctaDisabled
            ? 'bg-gray-100 text-slate-400 cursor-default hover:translate-y-0'
            : plan.featured
              ? 'bg-brand-blue text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              : plan.id.includes('intensif')
                ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                : 'border-2 border-brand-blue text-brand-blue hover:bg-blue-50'
          }
          ${isDisabled && !plan.ctaDisabled ? 'opacity-60 cursor-not-allowed hover:translate-y-0' : ''}`}
      >
        {isLoading ? <><Spinner size={16} /> Memproses...</> : plan.cta}
      </button>
    </div>
  )
}

// ─── Main BillingPage ────────────────────────────────────────
function BillingPage({ user, onNavigate }) {
  const [billing, setBilling] = useState('monthly')
  const [loadingId, setLoadingId] = useState(null)
  const [error, setError] = useState('')
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)

  // Load subscription status
  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${API_BASE_URL}/api/billing/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSubscriptionInfo(d.data) })
      .catch(() => {})
  }, [])

  // Load Midtrans Snap JS
  useEffect(() => {
    const existingScript = document.getElementById('midtrans-snap')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'midtrans-snap'
      const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      script.src = isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '')
      document.body.appendChild(script)
    }
  }, [])

  const handleSelectPlan = async (planId) => {
    setLoadingId(planId)
    setError('')

    try {
      const token = getToken()
      if (!token) {
        onNavigate('login')
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/billing/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'MIDTRANS_NOT_CONFIGURED') {
          setError('💳 Payment gateway belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di file .env backend.')
        } else {
          setError(data.message || 'Gagal membuat transaksi. Coba lagi.')
        }
        setLoadingId(null)
        return
      }

      const { snap_token, client_key, is_production } = data.data

      // Load the Snap script with the correct client key
      const existingScript = document.getElementById('midtrans-snap')
      if (existingScript) {
        existingScript.setAttribute('data-client-key', client_key)
      }

      // Open Midtrans Snap popup
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: (result) => {
            console.log('[Midtrans] Payment success:', result)
            // Update session subscription
            const raw = localStorage.getItem('mantra_auth_session')
            if (raw) {
              try {
                const session = JSON.parse(raw)
                const expiry = new Date()
                expiry.setDate(expiry.getDate() + (planId.includes('_3') ? 90 : 30))
                session.user.subscription_expires_at = expiry.toISOString()
                session.user.subscription_status = 'active'
                localStorage.setItem('mantra_auth_session', JSON.stringify(session))
              } catch {}
            }
            onNavigate('dashboard', { ...user, subscription_status: 'active' })
          },
          onPending: (result) => {
            console.log('[Midtrans] Payment pending:', result)
            setError('Pembayaran sedang diproses. Silakan selesaikan pembayaranmu.')
          },
          onError: (result) => {
            console.error('[Midtrans] Payment error:', result)
            setError('Pembayaran gagal. Coba lagi atau pilih metode pembayaran lain.')
          },
          onClose: () => {
            // User closed the popup
            setLoadingId(null)
          },
        })
      } else {
        // Snap.js belum load — fallback ke redirect
        window.open(data.data.redirect_url, '_blank')
        setLoadingId(null)
      }
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
      setLoadingId(null)
    } finally {
      // Don't clear loadingId here — it's cleared when popup closes
      if (!window.snap) setLoadingId(null)
    }
  }

  const currentPlans = PLANS[billing]

  const isExpired = !subscriptionInfo ||
    subscriptionInfo.subscription_status === 'free' ||
    subscriptionInfo.subscription_status === 'expired'

  return (
    <div className="font-jakarta min-h-screen bg-surface">

      {/* ─── NAVBAR ──────────────────────────────────────── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 py-3.5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => onNavigate('dashboard', user)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200">
                <span className="text-white text-sm leading-none">✨</span>
              </div>
              <span className="font-extrabold text-brand-dark text-sm">Mantra Skripsi</span>
            </button>
          </div>
          <button onClick={() => onNavigate('dashboard', user)}
            className="text-sm font-semibold text-slate-500 hover:text-brand-dark transition-colors flex items-center gap-1.5">
            ← Kembali ke Dashboard
          </button>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="pt-16 pb-10 text-center px-6">
        {/* Current subscription status */}
        {subscriptionInfo && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold
            ${isExpired ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            {isExpired
              ? 'Kamu saat ini menggunakan paket Gratis'
              : `Subscription aktif hingga ${new Date(subscriptionInfo.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </div>
        )}

        <h1 className="text-4xl lg:text-5xl font-extrabold text-brand-dark mb-4 leading-tight">
          Pilih Paket yang Tepat Untukmu
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10">
          Mulai gratis, upgrade kapanpun. Tidak ada biaya tersembunyi, cancel kapan saja.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200
              ${billing === 'monthly' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400'}`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setBilling('quarterly')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2
              ${billing === 'quarterly' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400'}`}
          >
            3 Bulan
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Hemat 11%
            </span>
          </button>
        </div>
      </section>

      {/* ─── PLAN CARDS ───────────────────────────────────── */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
                {error.includes('MIDTRANS') && (
                  <p className="text-xs text-red-500 mt-1">
                    Daftar di <a href="https://dashboard.midtrans.com/register" target="_blank" rel="noreferrer" className="underline font-bold">dashboard.midtrans.com</a> untuk mendapatkan API key.
                  </p>
                )}
              </div>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0 text-lg leading-none">×</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {currentPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                loadingId={loadingId}
              />
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            *Garansi lulus sidang berlaku dengan syarat dan ketentuan. Hubungi tim kami untuk detail lengkap.
            <br />Pembayaran aman diproses oleh Midtrans. Mantra Skripsi tidak menyimpan data kartu kredit kamu.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-brand-dark text-center mb-10">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Apakah ada masa percobaan gratis?',
                a: 'Ya! Paket Starter gratis selamanya dengan 5 pesan AI per hari. Kamu bisa merasakan manfaat Mantra Skripsi tanpa perlu kartu kredit.',
              },
              {
                q: 'Bisa cancel subscription kapan saja?',
                a: 'Tentu! Tidak ada kontrak jangka panjang. Kamu bisa berhenti berlangganan kapan saja dan akses Pro tetap aktif hingga periode berakhir.',
              },
              {
                q: 'Metode pembayaran apa yang diterima?',
                a: 'Kami menerima transfer bank, kartu kredit/debit, GoPay, OVO, DANA, dan semua metode yang didukung Midtrans.',
              },
              {
                q: 'Bagaimana cara kerja sesi bimbingan mentor?',
                a: 'Setelah berlangganan, kamu bisa booking sesi video call atau chat dengan mentor sesuai jadwal yang tersedia. Mentor adalah akademisi dan praktisi yang terseleksi.',
              },
              {
                q: 'Apakah AI bisa memahami format skripsi kampusku?',
                a: 'Ya! Setelah kamu upload buku panduan kampus saat onboarding, AI kami mempelajari aturan format spesifik kampusmu — margin, font, struktur bab, dan lainnya.',
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HISTORY ─────────────────────────────────────── */}
      {subscriptionInfo?.transactions?.length > 0 && (
        <section className="py-12 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-extrabold text-brand-dark mb-5">Riwayat Transaksi</h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {subscriptionInfo.transactions.map((tx, i) => (
                <div key={tx.order_id}
                  className={`flex items-center justify-between px-5 py-4 gap-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                  <div className="min-w-0">
                    <p className="font-bold text-brand-dark text-sm capitalize">{tx.plan} — {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.amount)}</p>
                    <p className="text-xs text-slate-400">{tx.order_id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                      ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-600'}`}>
                      {tx.status === 'success' ? 'Berhasil' : tx.status === 'pending' ? 'Menunggu' : 'Gagal'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(tx.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

// ─── FAQ Item (accordion) ─────────────────────────────────────
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-brand-dark text-sm">{question}</span>
        <span className={`text-gray-400 flex-shrink-0 text-lg transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-gray-100 pt-3">
          {answer}
        </div>
      )}
    </div>
  )
}

export default BillingPage
