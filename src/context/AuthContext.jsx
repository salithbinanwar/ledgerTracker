import { createContext, useContext, useEffect, useState } from 'react'
import API from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuthStatus = async () => {
    try {
      const res = await API.get('/auth/me')
      setUser(res.data)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const login = async (username, password) => {
    const res = await API.post('/auth/login', { username, password })
    setUser(res.data)
    return res.data
  }

  const logout = async () => {
    await API.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
