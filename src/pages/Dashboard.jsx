import {
  AlertTriangle,
  Check,
  Copy,
  Package,
  Plus,
  Shield,
  ShoppingCart,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockCount: 0,
  })
  const [lowStockItems, setLowStockItems] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedText, setCopiedText] = useState('')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showManagerModal, setShowManagerModal] = useState(false)

  // Forms
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    costPrice: '',
    sellingPrice: '',
    lowStockThreshold: 5,
    description: '',
  })

  const [managerForm, setManagerForm] = useState({
    name: '',
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchDashboardData = async () => {
    try {
      const productRes = await API.get('/products')
      const products = productRes.data

      const totalProducts = products.length
      const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0)
      const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold)

      setStats({
        totalProducts,
        totalUnits,
        lowStockCount: lowStock.length,
      })
      setLowStockItems(lowStock)

      if (user?.role === 'Boss') {
        const userRes = await API.get('/users')
        const managerList = userRes.data.filter((u) => u.role === 'Manager')
        setManagers(managerList)
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopiedText(`${label}:${text}`)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const handleDeleteManager = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete manager "${name}"?`))
      return

    try {
      await API.delete(`/users/${id}`)
      setSuccess(`Manager "${name}" deleted successfully.`)
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete manager')
    }
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await API.post('/products', formData)
      setSuccess('Product registered successfully!')
      setShowAddModal(false)
      setFormData({
        name: '',
        category: '',
        stock: '',
        costPrice: '',
        sellingPrice: '',
        lowStockThreshold: 5,
        description: '',
      })
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product')
    }
  }

  const handleCreateManager = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await API.post('/users', {
        name: managerForm.name,
        username: managerForm.username,
        password: managerForm.password,
        role: 'Manager',
      })
      setSuccess(`Manager account "${managerForm.name}" created successfully!`)
      setShowManagerModal(false)
      setManagerForm({ name: '', username: '', password: '' })
      fetchDashboardData()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create manager account',
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 mb-1">
              {user?.role === 'Boss' ? (
                <Shield className="w-5 h-5 text-amber-500" />
              ) : (
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              )}
              <h2 className="text-xl font-bold">
                {user?.role === 'Boss'
                  ? 'Boss Executive Dashboard'
                  : 'Store Manager Dashboard'}
              </h2>
            </div>
            <p className="text-slate-600 text-sm">
              Welcome back,{' '}
              <strong className="text-slate-900">{user?.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'Boss' && (
              <button
                onClick={() => setShowManagerModal(true)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium shadow transition text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Manager Account</span>
              </button>
            )}

            <Link
              to="/sales"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow transition text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Record Sale (POS)</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium shadow transition text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Available Products
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.totalProducts}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Total Stock Units
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.totalUnits}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Low-Stock Warnings
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {stats.lowStockCount}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Boss-Only: Store Managers Table with Copy & Delete */}
        {user?.role === 'Boss' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-slate-800">
                  Store Managers Team
                </h3>
              </div>
              <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
                {managers.length} Active Managers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                    <th className="p-3">Manager Name</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Password</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {managers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-4 text-center text-slate-500"
                      >
                        No store managers created yet.
                      </td>
                    </tr>
                  ) : (
                    managers.map((mgr) => (
                      <tr
                        key={mgr._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="p-3 font-semibold text-slate-800">
                          {mgr.name}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">
                              {mgr.username}
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(mgr.username, `user-${mgr._id}`)
                              }
                              className="p-1 text-slate-500 hover:text-slate-800 transition"
                              title="Copy Username"
                            >
                              {copiedText ===
                              `user-${mgr._id}:${mgr.username}` ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">
                              {mgr.plainPassword || '••••••••'}
                            </span>
                            {mgr.plainPassword && (
                              <button
                                onClick={() =>
                                  handleCopy(
                                    mgr.plainPassword,
                                    `pass-${mgr._id}`,
                                  )
                                }
                                className="p-1 text-slate-500 hover:text-slate-800 transition"
                                title="Copy Password"
                              >
                                {copiedText ===
                                `pass-${mgr._id}:${mgr.plainPassword}` ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() =>
                              handleDeleteManager(mgr._id, mgr.name)
                            }
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            title="Delete Manager"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-800">
                Low Stock Inventory Alerts
              </h3>
            </div>
            <Link
              to="/products"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              View Full Catalog &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                  <th className="p-3">Product ID & Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Added By</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-slate-500"
                    >
                      Loading stock status...
                    </td>
                  </tr>
                ) : lowStockItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-emerald-600 font-medium"
                    >
                      All inventory stock levels are healthy!
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">
                          {item.name}
                        </span>
                        <span className="block text-xs font-mono font-bold text-slate-500">
                          ID: {item.sku}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{item.category}</td>
                      <td className="p-3 text-xs text-slate-600 font-medium">
                        {item.createdBy?.name
                          ? `Added by ${item.createdBy.name}`
                          : 'N/A'}
                      </td>
                      <td className="p-3 font-bold text-rose-600">
                        {item.stock} units
                      </td>
                      <td className="p-3 font-medium text-emerald-600">
                        ৳{item.sellingPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Register New Product
              </h2>

              <form
                onSubmit={handleCreateProduct}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Lipstick"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g. Cosmetics"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cost Price (৳)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: e.target.value })
                      }
                      placeholder="12"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Selling Price (৳)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellingPrice: e.target.value,
                        })
                      }
                      placeholder="20"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="40"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm shadow"
                  >
                    Register Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Manager Modal */}
        {showManagerModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowManagerModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Create Manager Account
              </h2>

              <form
                onSubmit={handleCreateManager}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={managerForm.name}
                    onChange={(e) =>
                      setManagerForm({ ...managerForm, name: e.target.value })
                    }
                    placeholder="e.g. Rahim Manager"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={managerForm.username}
                    onChange={(e) =>
                      setManagerForm({
                        ...managerForm,
                        username: e.target.value,
                      })
                    }
                    placeholder="e.g. manager1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    value={managerForm.password}
                    onChange={(e) =>
                      setManagerForm({
                        ...managerForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="e.g. Pass123!"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManagerModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm shadow"
                  >
                    Create Manager
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
