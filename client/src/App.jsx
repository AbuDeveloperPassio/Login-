import { useEffect, useState } from 'react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import { getMe } from './api'

const TOKEN_KEY = 'auth_token'

export default function App() {
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // Restore the session if a token is saved
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setChecking(false)
      return
    }

    getMe(token)
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecking(false))
  }, [])

  function handleAuth({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
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
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return <Auth mode={mode} onSwitch={setMode} onAuth={handleAuth} />
}
