import {
  ChevronDown,
  ChevronUp,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import API from '../api/axios'
import { Navbar } from '../components/Navbar'

export const BakiKhata = () => {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [transactionType, setTransactionType] = useState('Debit')
  const [expandedCustomerId, setExpandedCustomerId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    paymentAmount: '',
    note: '',
  })

  const [cart, setCart] = useState([])
  const [currentProductId, setCurrentProductId] = useState('')
  const [currentQty, setCurrentQty] = useState(1)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        API.get('/baki'),
        API.get('/products?status=Active'),
      ])
      setCustomers(custRes.data)
      setProducts(prodRes.data)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addProductToCart = () => {
    if (!currentProductId) return
    const prod = products.find((p) => p._id === currentProductId)
    if (!prod) return

    const qty = Number(currentQty)
    if (qty <= 0) return

    if (prod.stock < qty) {
      alert(`Only ${prod.stock} units available in stock!`)
      return
    }

    const existing = cart.find((item) => item.productId === prod._id)
    if (existing) {
      const newQty = existing.quantity + qty
      setCart(
        cart.map((item) =>
          item.productId === prod._id
            ? {
                ...item,
                quantity: newQty,
                lineTotal: newQty * prod.sellingPrice,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          productId: prod._id,
          name: prod.name,
          sku: prod.sku,
          sellingPrice: prod.sellingPrice,
          quantity: qty,
          lineTotal: qty * prod.sellingPrice,
        },
      ])
    }
    setCurrentProductId('')
    setCurrentQty(1)
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const automaticDueTotal = cart.reduce((acc, item) => acc + item.lineTotal, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (transactionType === 'Payment') {
        await API.post('/baki', {
          customerId: selectedCustomer._id,
          type: 'Payment (Cash Received)',
          paymentAmount: Number(formData.paymentAmount),
          note: formData.note,
        })
        setSuccess('Payment recorded successfully!')
      } else {
        await API.post('/baki', {
          customerId: selectedCustomer ? selectedCustomer._id : undefined,
          name: formData.name,
          phone: formData.phone,
          type: 'Debit (Credit Given)',
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          note: formData.note,
        })
        setSuccess('Baki credit recorded and stock deducted automatically!')
      }

      setShowModal(false)
      resetForm()
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed')
    }
  }

  const resetForm = () => {
    setSelectedCustomer(null)
    setTransactionType('Debit')
    setFormData({ name: '', phone: '', paymentAmount: '', note: '' })
    setCart([])
  }

  const openNewCustomerModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openTransactionModal = (cust, type) => {
    setSelectedCustomer(cust)
    setTransactionType(type)
    setFormData({
      name: cust.name,
      phone: cust.phone || '',
      paymentAmount: '',
      note: '',
    })
    setCart([])
    setShowModal(true)
  }

  const toggleExpand = (id) => {
    setExpandedCustomerId(expandedCustomerId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Baki Khata (Credit Ledger)
            </h1>
            <p className="text-sm text-slate-500">
              Track customer credit dues, items purchased, and who recorded them
              in Taka (৳)
            </p>
          </div>

          <button
            onClick={openNewCustomerModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow text-sm transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Credit Customer</span>
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

        {/* Customer Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Total Due (Baki)</th>
                  <th className="p-4">Transaction History & Items Bought</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-slate-500"
                    >
                      Loading ledger...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-slate-500"
                    >
                      No credit customers recorded yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => {
                    const isExpanded = expandedCustomerId === cust._id
                    return (
                      <>
                        <tr
                          key={cust._id}
                          className="hover:bg-slate-50"
                        >
                          <td className="p-4 font-semibold text-slate-900">
                            {cust.name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {cust.phone || 'N/A'}
                          </td>
                          <td className="p-4 font-bold text-rose-600">
                            ৳{cust.totalDue.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleExpand(cust._id)}
                              className="flex items-center space-x-1 text-xs font-medium text-emerald-600 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>
                                {cust.transactions.length} Transactions
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() =>
                                openTransactionModal(cust, 'Payment')
                              }
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium text-xs transition"
                            >
                              Receive Payment
                            </button>
                            <button
                              onClick={() =>
                                openTransactionModal(cust, 'Debit')
                              }
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-medium text-xs transition"
                            >
                              Add More Baki
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Transaction & Itemized Breakdown */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan="5"
                              className="bg-slate-50 p-4 border-t border-slate-100"
                            >
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Itemized Purchase & Payment History:
                                </h4>
                                <div className="space-y-2">
                                  {cust.transactions.map((tx, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                                    >
                                      <div className="flex justify-between items-center font-medium">
                                        <span
                                          className={
                                            tx.type.includes('Debit')
                                              ? 'text-rose-600 font-bold'
                                              : 'text-emerald-600 font-bold'
                                          }
                                        >
                                          {tx.type} — ৳{tx.amount.toFixed(2)}
                                        </span>
                                        <span className="text-slate-400">
                                          {new Date(
                                            tx.createdAt,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>

                                      {/* Show what items were bought */}
                                      {tx.items && tx.items.length > 0 && (
                                        <div className="pl-2 border-l-2 border-emerald-500 my-1 space-y-0.5 text-slate-700">
                                          <p className="font-semibold text-slate-800">
                                            Items Bought:
                                          </p>
                                          {tx.items.map((itm, iIdx) => (
                                            <div
                                              key={iIdx}
                                              className="flex justify-between"
                                            >
                                              <span>
                                                • {itm.quantity}x{' '}
                                                {itm.productName} ({itm.sku})
                                              </span>
                                              <span className="font-medium">
                                                ৳{itm.lineTotal.toFixed(2)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {tx.note && (
                                        <p className="text-slate-500 italic">
                                          Note: {tx.note}
                                        </p>
                                      )}

                                      {/* Added by Manager Name */}
                                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                        <User className="w-3 h-3 text-slate-400" />
                                        <span>
                                          Added by:{' '}
                                          <strong>
                                            {tx.recordedBy?.name || 'Admin'}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedCustomer
                  ? transactionType === 'Payment'
                    ? `Receive Payment from ${selectedCustomer.name}`
                    : `Add Baki Items for ${selectedCustomer.name}`
                  : 'New Credit Customer & Items'}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!selectedCustomer && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Rahim Miah"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="017xxxxxxxx"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                {transactionType === 'Payment' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Payment Amount Received (৳)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.paymentAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentAmount: e.target.value,
                        })
                      }
                      placeholder="500"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-800">
                      Select Products Taken on Baki
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={currentProductId}
                        onChange={(e) => setCurrentProductId(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-white"
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((p) => (
                          <option
                            key={p._id}
                            value={p._id}
                          >
                            {p.name} (Stock: {p.stock}) - ৳{p.sellingPrice}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={currentQty}
                        onChange={(e) => setCurrentQty(e.target.value)}
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-white"
                        placeholder="Qty"
                      />
                      <button
                        type="button"
                        onClick={addProductToCart}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>

                    {cart.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <table className="w-full text-xs bg-white rounded-lg border">
                          <thead>
                            <tr className="bg-slate-100 border-b">
                              <th className="p-2 text-left">Product</th>
                              <th className="p-2">Qty</th>
                              <th className="p-2">Total</th>
                              <th className="p-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cart.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-b"
                              >
                                <td className="p-2 font-medium">{item.name}</td>
                                <td className="p-2 text-center">
                                  {item.quantity}
                                </td>
                                <td className="p-2 text-emerald-600 font-bold">
                                  ৳{item.lineTotal.toFixed(2)}
                                </td>
                                <td className="p-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(idx)}
                                    className="text-rose-600 hover:text-rose-800"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="flex justify-between items-center pt-2 font-bold text-sm text-slate-800">
                          <span>Automatic Due Amount:</span>
                          <span className="text-rose-600 text-base">
                            ৳{automaticDueTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Note / Description
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="e.g. Will pay next week"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm shadow"
                  >
                    Save Entry
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
