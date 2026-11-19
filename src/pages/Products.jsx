import {
  AlertTriangle,
  Archive,
  Edit3,
  Plus,
  Search,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import API from '../api/axios'
import { Navbar } from '../components/Navbar'

export const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    costPrice: '',
    sellingPrice: '',
    lowStockThreshold: 5,
    description: '',
  })

  const [stockAdjustment, setStockAdjustment] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchProducts = async () => {
    try {
      const res = await API.get(`/products?search=${search}`)
      setProducts(res.data)
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, {
          ...formData,
          stockAdjustment: stockAdjustment ? Number(stockAdjustment) : 0,
          reason: adjustmentReason,
        })
        setSuccess('Product updated successfully!')
      } else {
        await API.post('/products', formData)
        setSuccess('Product registered with auto-generated ID!')
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleArchive = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to change/remove this product status?',
      )
    )
      return
    try {
      await API.patch(`/products/${id}/archive`)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      stock: '',
      costPrice: '',
      sellingPrice: '',
      lowStockThreshold: 5,
      description: '',
    })
    setStockAdjustment('')
    setAdjustmentReason('')
  }

  const openEditModal = (prod) => {
    setEditingProduct(prod)
    setFormData({
      name: prod.name,
      category: prod.category,
      stock: prod.stock,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      lowStockThreshold: prod.lowStockThreshold,
      description: prod.description || '',
    })
    setStockAdjustment('')
    setAdjustmentReason('')
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Store Inventory Catalog
            </h1>
            <p className="text-sm text-slate-500">
              Manage products, prices, and stock levels in Bangladeshi Taka (৳)
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null)
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow transition text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Search Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Product Name or Auto ID (e.g., A1204)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold tracking-wider">
                  <th className="p-4">Product ID & Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Added By</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Cost Price</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-6 text-center text-slate-500"
                    >
                      Loading products catalog...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-6 text-center text-slate-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const isLowStock = prod.stock <= prod.lowStockThreshold
                    return (
                      <tr
                        key={prod._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">
                            {prod.name}
                          </div>
                          <span className="inline-block mt-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            ID: {prod.sku}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{prod.category}</td>
                        <td className="p-4 text-xs font-medium text-slate-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {prod.createdBy?.name
                                ? `Added by ${prod.createdBy.name}`
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}
                            >
                              {prod.stock} units
                            </span>
                            {isLowStock && (
                              <span title="Low Stock Warning">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          ৳{prod.costPrice.toFixed(2)}
                        </td>
                        <td className="p-4 font-medium text-emerald-600">
                          ৳{prod.sellingPrice.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              prod.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Edit / Adjust Stock"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(prod._id)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            title="Archive / Delete"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                {editingProduct
                  ? `Edit Product (${editingProduct.sku})`
                  : 'Register New Product'}
              </h2>
              {!editingProduct && (
                <p className="text-xs text-slate-500 mb-4">
                  A unique product ID will be automatically generated upon
                  creation.
                </p>
              )}

              <form
                onSubmit={handleSubmit}
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {!editingProduct ? (
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Manual Stock Adjustment
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Add / Deduct (+/-)
                        </label>
                        <input
                          type="number"
                          value={stockAdjustment}
                          onChange={(e) => setStockAdjustment(e.target.value)}
                          placeholder="e.g. 10 or -5"
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Reason
                        </label>
                        <input
                          type="text"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                          placeholder="Restock / Damage"
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Low Stock Warning Limit
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow"
                  >
                    {editingProduct ? 'Save Changes' : 'Register Product'}
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
