import { Store, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await API.post('/users/register', {
        ...formData,
        role: 'Boss', // Force role to be Boss/Admin
      })
      setSuccess('Admin account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
            Admin Registration
          </h1>
          <p className="text-xs text-slate-500">
            Create your administrative account
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Monir"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="e.g. monir"
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
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition shadow flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            <span>
              {loading ? 'Creating Account...' : 'Register Admin Account'}
            </span>
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Already have an account? Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
