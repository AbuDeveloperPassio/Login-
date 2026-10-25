import { useEffect, useState } from 'react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { getMe } from './api'

const TOKEN_KEY = 'auth_token'

export default function App() {
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [view, setView] = useState('dashboard')
  const [checking, setChecking] = useState(true)

  // Restore the session if a token is saved
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) {
      setChecking(false)
      return
    }

    getMe(saved)
      .then((data) => {
        setToken(saved)
        setUser(data.user)
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecking(false))
  }, [])

  function handleAuth({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token)
    setToken(token)
    setUser(user)
    setView('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setView('dashboard')
    setMode('login')
  }

  if (checking) {
    return (
      <div className="page">
        <p className="loading">Loading...</p>
      </div>
    )
  }

  if (user) {
    const isAdmin = user.role === 'admin'

    if (isAdmin && view === 'admin') {
      return (
        <Admin
          token={token}
          user={user}
          onBack={() => setView('dashboard')}
          onLogout={handleLogout}
        />
      )
    }

    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onAdmin={isAdmin ? () => setView('admin') : undefined}
      />
    )
  }

  return <Auth mode={mode} onSwitch={setMode} onAuth={handleAuth} />
}
