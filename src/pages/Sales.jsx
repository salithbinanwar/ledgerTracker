import { ShoppingCart, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import API from '../api/axios'
import { Navbar } from '../components/Navbar'

export const Sales = () => {
  const [products, setProducts] = useState([])
  const [salesHistory, setSalesHistory] = useState([])
  const [cart, setCart] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [amountPaid, setAmountPaid] = useState('')
  const [customerName, setCustomerName] = useState('Walking Customer')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [prodRes, salesRes] = await Promise.all([
        API.get('/products?status=Active'),
        API.get('/sales'),
      ])
      setProducts(prodRes.data)
      setSalesHistory(salesRes.data)
    } catch (err) {
      console.error('Failed to load data', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addToCart = (e) => {
    e.preventDefault()
    if (!selectedProductId) return

    const product = products.find((p) => p._id === selectedProductId)
    if (!product) return

    const qty = Number(quantity)
    if (qty <= 0) return

    if (product.stock < qty) {
      alert(`Only ${product.stock} units left in stock!`)
      return
    }

    const existingIndex = cart.findIndex((item) => item.product === product._id)
    if (existingIndex > -1) {
      const updated = [...cart]
      const newQty = updated[existingIndex].quantity + qty
      if (product.stock < newQty) {
        alert('Cannot add more than remaining stock.')
        return
      }
      updated[existingIndex].quantity = newQty
      updated[existingIndex].lineTotal = newQty * product.sellingPrice
      setCart(updated)
    } else {
      setCart([
        ...cart,
        {
          product: product._id,
          name: product.name,
          sku: product.sku,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          quantity: qty,
          lineTotal: qty * product.sellingPrice,
          lineCost: qty * product.costPrice,
        },
      ])
    }
    setQuantity(1)
    setSelectedProductId('')
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const grandTotal = cart.reduce((acc, item) => acc + item.lineTotal, 0)
  const totalCost = cart.reduce((acc, item) => acc + item.lineCost, 0)
  const totalProfit = grandTotal - totalCost

  const handleCheckout = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (cart.length === 0) {
      setError('Cart is empty. Select products to sell.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        amountPaid: amountPaid !== '' ? Number(amountPaid) : grandTotal,
        customer: { name: customerName },
      }

      const res = await API.post('/sales', payload)
      setSuccess(`Sale recorded successfully! Invoice: ${res.data.sale.saleId}`)
      setCart([])
      setAmountPaid('')
      setCustomerName('Walking Customer')
      fetchData() // Refresh product stock & sales history
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Sales & POS Checkout
          </h1>
          <p className="text-sm text-slate-500">
            Record customer purchases, update remaining stock, and calculate
            earnings automatically (৳)
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product Selector */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 space-y-4">
            <h2 className="font-bold text-slate-800 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span>Sell Products</span>
            </h2>

            <form
              onSubmit={addToCart}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                    >
                      {p.name} (Stock Left: {p.stock}) - ৳{p.sellingPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity Bought
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition shadow text-sm"
              >
                Add to Cart
              </button>
            </form>
          </div>

          {/* Right: Cart & Checkout Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
            <h2 className="font-bold text-slate-800 text-lg">
              Current Sale Cart
            </h2>

            {cart.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                Cart is empty. Select items on the left to record a sale.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                      <th className="p-3">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Total</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3 font-medium text-slate-800">
                          {item.name}{' '}
                          <span className="text-xs font-mono text-slate-400">
                            ({item.sku})
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          ৳{item.sellingPrice.toFixed(2)}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {item.quantity} units
                        </td>
                        <td className="p-3 font-bold text-emerald-600">
                          ৳{item.lineTotal.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => removeFromCart(index)}
                            className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {cart.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Cost:</span>
                  <span className="font-semibold text-slate-800">
                    ৳{totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Revenue Earned:</span>
                  <span className="font-semibold text-emerald-600">
                    ৳{grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Net Gross Profit:</span>
                  <span className="text-emerald-700">
                    ৳{totalProfit.toFixed(2)}
                  </span>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Amount Paid (৳)
                    </label>
                    <input
                      type="number"
                      placeholder={grandTotal}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition shadow text-sm disabled:opacity-50"
                >
                  {loading
                    ? 'Processing Sale...'
                    : 'Complete Sale & Update Stock'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sales History Log */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">
              Recent Sales & Revenue Log
            </h3>
            <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
              {salesHistory.length} Transactions Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                  <th className="p-3">Invoice ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items Sold</th>
                  <th className="p-3">Revenue Earned</th>
                  <th className="p-3">Profit</th>
                  <th className="p-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salesHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-6 text-center text-slate-500"
                    >
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  salesHistory.map((sale) => (
                    <tr
                      key={sale._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {sale.saleId}
                      </td>
                      <td className="p-3 text-slate-700">
                        {sale.customer?.name || 'Walking Customer'}
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {sale.items.map((i, idx) => (
                          <div key={idx}>
                            • {i.quantity}x {i.productName}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">
                        ৳{sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        ৳{sale.totalProfit.toFixed(2)}
                      </td>
                      <td className="p-3 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{sale.recordedBy?.name || 'Admin'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
