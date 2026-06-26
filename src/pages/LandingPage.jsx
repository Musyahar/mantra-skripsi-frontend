// LandingPage.jsx — Halaman Publik/Marketing Mantra Skripsi
// Dikonversi dari HTML + Tailwind CDN ke React component

function LandingPage({ onNavigate }) {

  const navLinks = [
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Bimbingan Mentor', href: '#fitur' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'Harga', href: '#harga' },
  ]

  const stats = [
    { value: '1.240', label: 'Skripsi Selesai' },
    { value: '96%', label: 'Lolos Sidang Pertama' },
    { value: '3x', label: 'Lebih Cepat Selesai' },
  ]

  const features = [
    {
      icon: '🤖',
      title: 'AI Super Cepat',
      desc: 'Brainstorming judul, auto-format, parafrase, citation manager. Kelar hitungan menit.',
      bg: 'bg-blue-50',
      accent: 'text-blue-600',
    },
    {
      icon: '🎓',
      title: 'Bimbingan Mentor Gratis',
      desc: 'Sesi mingguan bareng mentor asli — bahas progres, jawab pertanyaan langsung.',
      bg: 'bg-emerald-50',
      accent: 'text-emerald-600',
    },
    {
      icon: '⚖️',
      title: 'Simulasi Sidang',
      desc: 'Bukan dosen AI. Mentor manusia yang ngerti rasanya sidang sungguhan.',
      bg: 'bg-violet-50',
      accent: 'text-violet-600',
    },
  ]

  const testimonials = [
    {
      name: 'Siti Rahayu',
      univ: 'UGM — Hukum',
      avatar: 'SR',
      avatarBg: 'bg-pink-100 text-pink-700',
      quote: 'Bab 3 yang tadinya muter-muter selama 2 bulan, selesai dalam seminggu setelah pakai Mantra Skripsi. Mentor-nya sabar banget!',
      stars: 5,
    },
    {
      name: 'Budi Santoso',
      univ: 'UI — Teknik Informatika',
      avatar: 'BS',
      avatarBg: 'bg-blue-100 text-blue-700',
      quote: 'Fitur auto-format sesuai template kampus beneran ngebantu. Gak perlu lagi ngatur margin manual berjam-jam.',
      stars: 5,
    },
    {
      name: 'Dewi Kurnia',
      univ: 'UNPAD — Ekonomi',
      avatar: 'DK',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      quote: 'Simulasi sidangnya bikin saya jauh lebih percaya diri. Pertanyaan dosen pas sidang beneran udah pernah saya latihan.',
      stars: 5,
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratis',
      period: '',
      desc: 'Coba semua fitur dasar tanpa kartu kredit.',
      features: ['5 sesi AI per bulan', 'Template dasar', 'Komunitas pengguna'],
      cta: 'Mulai Gratis',
      ctaStyle: 'border border-gray-200 text-brand-dark hover:border-brand-blue hover:text-brand-blue',
      featured: false,
    },
    {
      name: 'Pro',
      price: 'Rp 149.000',
      period: '/ bulan',
      desc: 'Untuk mahasiswa yang serius ingin cepat selesai.',
      features: ['AI tanpa batas', 'Format otomatis kampus', '2 sesi mentor/bulan', 'Simulasi sidang', 'Prioritas dukungan'],
      cta: 'Pilih Pro',
      ctaStyle: 'bg-brand-blue text-white hover:bg-blue-700',
      featured: true,
    },
    {
      name: 'Intensif',
      price: 'Rp 349.000',
      period: '/ bulan',
      desc: 'Mentoring intensif untuk deadline mepet.',
      features: ['Semua fitur Pro', '8 sesi mentor/bulan', 'WhatsApp mentor langsung', 'Revisi tidak terbatas', 'Garansi lulus sidang*'],
      cta: 'Hubungi Kami',
      ctaStyle: 'border border-gray-200 text-brand-dark hover:border-brand-blue hover:text-brand-blue',
      featured: false,
    },
  ]

  const footerLinks = [
    {
      heading: 'Perusahaan',
      links: ['Tentang Kami', 'Karir', 'Blog', 'Syarat & Ketentuan'],
    },
    {
      heading: 'Resource',
      links: ['Video Tutorial', 'Panduan Pengguna', 'Template Skripsi', 'Gabung Komunitas'],
    },
    {
      heading: 'Kontak',
      links: ['halo@mantraskripsi.com', 'WhatsApp: 0812-xxxx-xxxx'],
    },
  ]

  return (
    <div className="font-jakarta bg-surface text-slate-600 min-h-screen">

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-lg leading-none">✨</span>
            </div>
            <span className="font-extrabold text-2xl text-brand-dark tracking-tight">
              Mantra Skripsi
            </span>
          </div>

          <div className="hidden lg:flex space-x-8 font-semibold text-sm text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-brand-blue transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-sm text-slate-700 hover:text-brand-blue transition-colors duration-200 px-3 py-2"
            >
              Masuk
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="bwa-btn bg-brand-blue text-white font-bold text-sm py-3 px-6 rounded-full hover:bg-blue-700 transition-all duration-300"
              style={{ transition: '0.3s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Coba Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-accent border border-orange-200 rounded-full px-4 py-1.5 mb-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <span className="text-sm">🚀</span>
          <span className="font-bold tracking-widest text-xs uppercase">Lulus Lebih Cepat</span>
        </div>

        <h1 className="text-5xl lg:text-6xl font-extrabold text-brand-dark mb-6 leading-tight max-w-4xl mx-auto">
          Skripsimu Selesai Lebih Cepat —<br className="hidden md:block" />
          Dibimbing AI dan Mentor Asli
        </h1>

        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Bukan cuma dibantu AI. Brainstorming judul, auto-format, sampai simulasi sidang — ditemani mentor manusia yang siap bantu kapan kamu butuh.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="bg-brand-blue text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = ''
            }}
          >
            Coba Gratis Sekarang →
          </button>
          <a
            href="#cara-kerja"
            className="font-semibold py-4 px-8 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors duration-200 text-slate-700"
          >
            Lihat Cara Kerja
          </a>
        </div>

        <p className="mt-12 text-xs font-semibold text-slate-300 tracking-widest uppercase">
          SKRIPSI · TESIS · DISERTASI · PROPOSAL · BAB 1 · DAFTAR PUSTAKA
        </p>

        {/* Hero visual hint */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-100 p-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="ml-2 bg-gray-100 rounded-md px-6 py-1 text-xs text-gray-400 font-mono">mantraskripsi.com/dashboard</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '📋 Bab 1', progress: 100, color: 'bg-emerald-500' },
              { label: '🔬 Bab 3', progress: 65, color: 'bg-brand-blue' },
              { label: '📊 Bab 4', progress: 20, color: 'bg-violet-500' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm font-bold text-brand-dark mb-2">{item.label}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className={`${item.color} h-1.5 rounded-full transition-all duration-700`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400">{item.progress}% selesai</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700">💬 AI sedang membantu revisi Bab 3 metodologi...</p>
            </div>
            <div className="bg-brand-blue text-white text-xs font-bold px-4 rounded-xl flex items-center">Kirim</div>
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-gray-100" id="cara-kerja">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-2">Bukan Cuma Klaim — Ini Buktinya</p>
          <h2 className="text-3xl font-extrabold text-brand-dark mb-12">
            Sudah Ribuan Mahasiswa yang Buktikan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="group">
                <h3 className="text-5xl font-extrabold text-brand-blue mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </h3>
                <p className="text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────── */}
      <section className="py-24" id="fitur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-3">Kenapa Mantra Skripsi?</p>
            <h2 className="text-4xl font-extrabold text-brand-dark">
              Ada Manusia Sungguhan di Belakangmu
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              AI kami yang canggih dikombinasikan dengan mentor berpengalaman — bukan chatbot generik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-white p-8 rounded-3xl border border-gray-100 cursor-default"
                style={{ transition: '0.3s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center text-2xl mb-6`}>
                  {feat.icon}
                </div>
                <h3 className={`font-extrabold text-xl mb-3 text-brand-dark`}>{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-24 bg-brand-dark text-white" id="cara-kerja-detail">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-3">Mudah Banget Dimulai</p>
          <h2 className="text-4xl font-extrabold text-white mb-16">3 Langkah Menuju Wisuda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { step: '01', title: 'Daftar & Setup', desc: 'Buat akun dalam 30 detik. Upload buku panduan kampusmu — AI langsung belajar format skripsimu.' },
              { step: '02', title: 'Kerjakan Bersama AI', desc: 'Mulai dari brainstorming judul, buat outline, sampai nulis bab per bab — AI siap menemani.' },
              { step: '03', title: 'Review dengan Mentor', desc: 'Sesi mingguan dengan mentor manusia. Tanya apa saja, dapat feedback langsung, siap sidang.' },
            ].map((s) => (
              <div key={s.step} className="relative pl-6 md:pl-8 border-l border-blue-800/60 z-0">
                <span className="text-6xl md:text-[80px] leading-none font-extrabold text-blue-900/40 absolute left-4 md:left-8 -top-4 md:-top-6 select-none -z-10">{s.step}</span>
                <div className="pt-8 md:pt-10 relative">
                  <h3 className="font-bold text-xl text-white mb-3">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14">
            <button
              onClick={() => onNavigate('register')}
              className="bg-brand-blue text-white font-bold py-4 px-10 rounded-full hover:bg-blue-600 transition-all duration-300"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.40)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Mulai Sekarang — Gratis
            </button>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24 bg-white" id="testimoni">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-3">Testimoni</p>
            <h2 className="text-4xl font-extrabold text-brand-dark">
              Mereka Sudah Wisuda. Giliranmu.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-surface p-8 rounded-3xl border border-gray-100"
                style={{ transition: '0.3s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.07)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.univ}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50" id="harga">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-3">Harga Transparan</p>
            <h2 className="text-4xl font-extrabold text-brand-dark">Mulai Gratis, Upgrade Kapanpun</h2>
            <p className="mt-4 text-slate-500">Tidak ada biaya tersembunyi. Cancel kapan saja.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-3xl border ${plan.featured
                  ? 'bg-brand-dark text-white border-brand-dark shadow-2xl scale-105'
                  : 'bg-white border-gray-100'
                }`}
              >
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ⭐ Terpopuler
                  </div>
                )}
                <h3 className={`font-extrabold text-xl mb-1 ${plan.featured ? 'text-white' : 'text-brand-dark'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`font-extrabold text-3xl ${plan.featured ? 'text-white' : 'text-brand-dark'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.featured ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('register')}
                  className={`w-full py-3 px-6 rounded-full font-bold text-sm transition-all duration-300 ${plan.featured
                    ? 'bg-brand-blue text-white hover:bg-blue-600'
                    : plan.ctaStyle
                  }`}
                  onMouseEnter={(e) => {
                    if (plan.featured) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">
            *Garansi lulus sidang berlaku dengan syarat dan ketentuan. Hubungi tim kami untuk info lengkap.
          </p>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-20 bg-brand-blue text-white text-center px-6">
        <h2 className="text-4xl font-extrabold mb-4">Skripsimu Bisa Selesai Sekarang</h2>
        <p className="text-blue-200 mb-8 max-w-xl mx-auto">
          Bergabung dengan 1.240+ mahasiswa yang sudah wisuda bersama Mantra Skripsi.
        </p>
        <button
          onClick={() => onNavigate('register')}
          className="bg-white text-brand-blue font-extrabold py-4 px-10 rounded-full hover:bg-blue-50 transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Daftar Sekarang — Gratis
        </button>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          {/* Brand */}
          <div>
            <h4 className="font-extrabold text-xl text-white mb-4">Mantra Skripsi</h4>
            <p className="text-slate-400 leading-relaxed">
              Platform AI dan bimbingan mentor untuk membantu mahasiswa menyelesaikan skripsi lebih cepat.
            </p>
            <div className="flex gap-3 mt-6">
              {['ig', 'tw', 'yt'].map((soc) => (
                <div key={soc} className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-brand-blue hover:text-brand-blue cursor-pointer transition-colors duration-200 text-xs font-bold uppercase">
                  {soc}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4 className="font-bold text-white mb-4">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link} className="text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2025 Mantra Skripsi. Semua hak dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
