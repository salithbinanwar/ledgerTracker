import { ArrowRight, Store } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-600 rounded-xl text-white shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Store & Baki Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition shadow flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            to="/register"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Need to create an account? Register here &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
