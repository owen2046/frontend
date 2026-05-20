import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('estates61-user') || 'null') }
    catch { return null }
  })

  // Modal state — any component can call openAuth('signin'/'signup')
  const [authModal, setAuthModal] = useState(null) // null | { view, onSuccess }

  const login = (userData) => {
    localStorage.setItem('estates61-user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('estates61-user')
    setUser(null)
  }

  // Open auth modal from anywhere
  const openAuth = useCallback((view = 'signin', onSuccess = null) => {
    setAuthModal({ view, onSuccess })
  }, [])

  const closeAuth = useCallback(() => setAuthModal(null), [])

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'estates61-user') {
        try { setUser(JSON.parse(e.newValue || 'null')) }
        catch { setUser(null) }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, openAuth, closeAuth, authModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
