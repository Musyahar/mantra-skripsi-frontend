import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function MentorDashboard({ user, onNavigate }) {
  // state for onboarding
  const [onboardingPhase, setOnboardingPhase] = useState('questionnaire') // questionnaire, tour, completed
  const [questionStep, setQuestionStep] = useState(1)
  const [tourStep, setTourStep] = useState(0)

  const [formData, setFormData] = useState({
    expertise: '',
    availability: ''
  })

  useEffect(() => {
    if (user?.onboarding_completed) {
      setOnboardingPhase('completed')
    }
  }, [user])

  const handleNextQuestion = () => {
    if (questionStep < 2) {
      setQuestionStep(questionStep + 1)
    } else {
      setOnboardingPhase('tour')
    }
  }

  const handleFinishTour = async () => {
    setOnboardingPhase('completed')
    try {
      const raw = localStorage.getItem('mantra_auth_session')
      if (raw) {
         const session = JSON.parse(raw)
         if(session.user) {
            session.user.onboarding_completed = 1
            localStorage.setItem('mantra_auth_session', JSON.stringify(session))
         }
      }
    } catch(e) {}
  }

  const tourStepsData = [
    {
      id: 'tour-slot',
      title: 'Slot Waktu Bimbingan',
      desc: 'Atur jadwal ketersediaan Anda agar mahasiswa dapat memesan sesi bimbingan.'
    },
    {
      id: 'tour-wallet',
      title: 'Dompet & Penarikan',
      desc: 'Lihat saldo komisi Anda dan ajukan penarikan dana langsung ke rekening Anda.'
    },
    {
      id: 'tour-log',
      title: 'Evaluasi Bimbingan',
      desc: 'Isi log evaluasi setelah setiap sesi bimbingan untuk melacak progres mahasiswa.'
    }
  ]

  return (
    <div className="font-jakarta bg-surface min-h-screen text-slate-600 relative overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 py-3.5 relative">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-sm leading-none">✨</span>
            </div>
            <span className="font-extrabold text-brand-dark text-base">Mantra Skripsi</span>
            <span className="hidden sm:block text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full ml-1">
              Portal Mentor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-700 overflow-hidden">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : (user?.name?.[0]?.toUpperCase() || 'M')}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-brand-dark">{user?.name || 'Mentor'}</span>
            <button
              onClick={() => { localStorage.removeItem('mantra_auth_session'); onNavigate('landing') }}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-brand-dark mb-1">
            Selamat datang, {user?.name?.split(' ')[0] || 'Mentor'} 👋
          </h1>
          <p className="text-slate-400 text-sm">Kelola jadwal dan pantau penghasilan Anda di Dasbor Utama ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          
          <div id="tour-slot" className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 ${tourStep === 0 && onboardingPhase === 'tour' ? 'relative z-50 shadow-[0_0_30px_rgba(255,255,255,1)] border-emerald-500 scale-105' : 'border-transparent shadow-sm hover:shadow-md'}`}>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-4">📅</div>
            <h2 className="text-base font-bold text-brand-dark mb-2">Mengatur Slot Waktu</h2>
            <p className="text-sm text-slate-500 mb-4 h-10">Tentukan kapan Anda tersedia untuk sesi bimbingan.</p>
            <button className="px-4 py-2 w-full bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition">Atur Jadwal</button>
          </div>

          <div id="tour-wallet" className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 ${tourStep === 1 && onboardingPhase === 'tour' ? 'relative z-50 shadow-[0_0_30px_rgba(255,255,255,1)] border-amber-500 scale-105' : 'border-transparent shadow-sm hover:shadow-md'}`}>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-4">💳</div>
            <h2 className="text-base font-bold text-brand-dark mb-2">Dompet & Penarikan</h2>
            <p className="text-sm text-slate-500 mb-4 h-10">Lihat komisi Anda dan ajukan withdrawal (penarikan dana).</p>
            <button className="px-4 py-2 w-full bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition">Lihat Dompet</button>
          </div>

          <div id="tour-log" className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 ${tourStep === 2 && onboardingPhase === 'tour' ? 'relative z-50 shadow-[0_0_30px_rgba(255,255,255,1)] border-blue-500 scale-105' : 'border-transparent shadow-sm hover:shadow-md'}`}>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4">📋</div>
            <h2 className="text-base font-bold text-brand-dark mb-2">Log Evaluasi Bimbingan</h2>
            <p className="text-sm text-slate-500 mb-4 h-10">Isi evaluasi dan catatan untuk setiap mahasiswa setelah sesi.</p>
            <button className="px-4 py-2 w-full bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition">Isi Log</button>
          </div>

        </div>

        <div className="mt-8 text-right">
           <button className="text-xs text-red-400 font-semibold hover:text-red-600 underline transition">
             Hapus Akun Saya (Hak Hapus Data)
           </button>
        </div>

      </main>

      {/* ─── ONBOARDING OVERLAYS ─── */}
      {onboardingPhase === 'questionnaire' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
           <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
             <div className="flex gap-2 mb-8">
               {[1,2].map(step => (
                 <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= questionStep ? 'bg-emerald-500' : 'bg-gray-100'}`} />
               ))}
             </div>

             {questionStep === 1 && (
               <div className="animate-[slideUp_0.3s_ease-out]">
                 <h3 className="text-xl font-extrabold text-brand-dark mb-2">Apa bidang keahlian utama Anda?</h3>
                 <input 
                   type="text" 
                   placeholder="Contoh: Machine Learning, Data Science"
                   value={formData.expertise}
                   onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                   className="w-full px-5 py-3.5 mt-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none mb-4 transition-colors"
                 />
               </div>
             )}

             {questionStep === 2 && (
               <div className="animate-[slideUp_0.3s_ease-out]">
                 <h3 className="text-xl font-extrabold text-brand-dark mb-2">Berapa jam ketersediaan Anda per minggu?</h3>
                 <div className="space-y-3 mt-4">
                   {['< 5 Jam', '5 - 10 Jam', '10 - 20 Jam', '> 20 Jam'].map(opt => (
                     <button key={opt} onClick={() => setFormData({...formData, availability: opt})}
                       className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all ${formData.availability === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-100 text-slate-600 hover:border-emerald-200'}`}>
                       {opt}
                     </button>
                   ))}
                 </div>
               </div>
             )}

             <div className="mt-8 flex justify-end">
               <button 
                 onClick={handleNextQuestion}
                 disabled={(questionStep === 1 && !formData.expertise.trim()) || (questionStep === 2 && !formData.availability)}
                 className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition shadow-md"
               >
                 {questionStep < 2 ? 'Selanjutnya →' : 'Mulai Menjadi Mentor'}
               </button>
             </div>
           </div>
        </div>
      )}

      {/* PRODUCT TOUR OVERLAY */}
      {onboardingPhase === 'tour' && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-[1px] transition-all pointer-events-auto">
          <div className={`absolute z-50 bg-white rounded-3xl p-6 w-[calc(100%-2rem)] sm:w-full max-w-sm shadow-2xl animate-[slideUp_0.4s_ease-out] ${tourStep === 2 ? 'bottom-8 left-4 sm:left-8' : 'bottom-8 right-4 sm:right-8'}`}>
             <div className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wider">
               PANDUAN ({tourStep + 1}/3)
             </div>
             <h3 className="text-xl font-extrabold text-brand-dark mb-2">{tourStepsData[tourStep].title}</h3>
             <p className="text-slate-500 text-sm mb-6">{tourStepsData[tourStep].desc}</p>
             <div className="flex items-center justify-between">
               <div className="flex gap-1.5">
                  {[0,1,2].map(step => (
                    <div key={step} className={`w-2 h-2 rounded-full transition-all ${step === tourStep ? 'bg-emerald-500 w-4' : 'bg-gray-200'}`} />
                  ))}
               </div>
               <button 
                 onClick={() => {
                   if (tourStep < 2) setTourStep(tourStep + 1)
                   else handleFinishTour()
                 }}
                 className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
               >
                 {tourStep < 2 ? 'Lanjut →' : 'Mulai Sekarang! 🚀'}
               </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(4px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

export default MentorDashboard
