import {
  BarChart3,
  LogOut,
  ShoppingCart,
  Store,
  User as UserIcon,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Store & Baki Ledger
              </h1>
              <p className="text-xs text-slate-400">Bangladeshi Taka (৳)</p>
            </div>
          </div>

          {user && (
            <nav className="hidden md:flex space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/products"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/products')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Products & Inventory
              </Link>
              <Link
                to="/sales"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                  isActive('/sales')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Sales / POS</span>
              </Link>
              <Link
                to="/baki"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/baki')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Baki Khata
              </Link>

              {/* Monthly Earnings Analytics - Visible ONLY to Admin (Boss) */}
              {user?.role === 'Boss' && (
                <Link
                  to="/earnings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/earnings')
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>Monthly Earnings</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-200">{user.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  user.role === 'Boss'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 text-sm bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
