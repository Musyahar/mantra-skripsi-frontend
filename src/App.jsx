import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import BillingPage from './pages/BillingPage'
import OnboardingPage from './pages/OnboardingPage'
import './App.css'

// ─── Page Map ─────────────────────────────────────────────
// login | dashboard | mentor-dashboard | admin-dashboard | onboarding | register | forgot-password | billing

function getInitialState() {
  try {
    const raw = localStorage.getItem('mantra_auth_session')
    if (!raw) return { page: 'landing', user: null }

    const session = JSON.parse(raw)
    const user = session?.user

    if (!user) return { page: 'landing', user: null }

    // If user has never completed onboarding, send them there
    if (!user.onboarding_completed) return { page: 'onboarding', user }

    return { page: 'dashboard', user }
  } catch {
    localStorage.removeItem('mantra_auth_session')
    return { page: 'login', user: null }
  }
}

function App() {
  const [{ page, user }, setState] = useState(getInitialState)

  const navigate = (nextPage, nextUser = user) => {
    setState({ page: nextPage, user: nextUser })

    // Sync session when user data changes (e.g. after onboarding)
    if (nextUser) {
      try {
        const raw = localStorage.getItem('mantra_auth_session')
        if (raw) {
          const session = JSON.parse(raw)
          session.user = { ...session.user, ...nextUser }
          localStorage.setItem('mantra_auth_session', JSON.stringify(session))
        }
      } catch {
        // ignore storage errors
      }
    }
  }

  // ── Route Rendering ──────────────────────────────────────
  switch (page) {
    case 'dashboard':
      return <UserDashboard user={user} onNavigate={navigate} />

    case 'onboarding':
      return <OnboardingPage user={user} onNavigate={navigate} />

    case 'register':
      return <RegisterPage onNavigate={navigate} />

    case 'forgot-password':
      window.location.href = '/lupa-password'
      return null

    case 'billing':
      return <BillingPage user={user} onNavigate={navigate} />

    case 'landing':
      return <LandingPage onNavigate={navigate} />

    case 'login':
    default:
      return <LoginPage onNavigate={navigate} />
  }
}

export default App
