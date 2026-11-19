import { AlertTriangle, Package, Plus, Search, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export const ManagerDashboard = ({ onOpenAddProduct }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockCount: 0,
  })
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/products')
      const products = res.data

      const totalProducts = products.length
      const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0)
      const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold)

      setStats({
        totalProducts,
        totalUnits,
        lowStockCount: lowStock.length,
      })
      setLowStockItems(lowStock)
    } catch (err) {
      console.error('Failed to load manager dashboard metrics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Quick Stat Cards */}
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

      {/* Action Hub for Store Manager */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Manager Operational Controls</h2>
          <p className="text-slate-300 text-sm mt-1">
            Register new inventory items or update stock quantities directly.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium shadow transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
          <Link
            to="/products"
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2.5 rounded-lg font-medium transition"
          >
            <Search className="w-5 h-5" />
            <span>Product Catalog</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Alert Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">
              Low Stock Inventory Alerts
            </h3>
          </div>
          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
            {lowStockItems.length} items need restock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-3">SKU & Item</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Threshold</th>
                <th className="p-3">Selling Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-slate-500"
                  >
                    Checking stock levels...
                  </td>
                </tr>
              ) : lowStockItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
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
                      <span className="block text-xs text-slate-500 font-mono">
                        SKU: {item.sku}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-rose-600">
                      {item.stock} units
                    </td>
                    <td className="p-3 text-slate-500">
                      {item.lowStockThreshold} units
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
    </div>
  )
}
