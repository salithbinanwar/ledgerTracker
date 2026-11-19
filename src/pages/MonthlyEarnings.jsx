import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Download, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import API from '../api/axios'
import { Navbar } from '../components/Navbar'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
)

export const MonthlyEarnings = () => {
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMonthlyData = async () => {
    try {
      const res = await API.get('/sales/monthly')
      setReport(res.data)
    } catch (err) {
      console.error('Failed to load monthly earnings', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyData()
  }, [])

  // Export Excel / CSV Function
  const exportToExcelCSV = () => {
    if (report.length === 0) {
      alert('No earnings data available to export.')
      return
    }

    let csvContent =
      'data:text/csv;charset=utf-8,Month,Total Sales Transactions,Total Revenue (BDT),Total Cost (BDT),Net Profit (BDT)\n'

    report.forEach((row) => {
      csvContent += `"${row.month}",${row.totalSalesCount},${row.totalRevenue.toFixed(2)},${row.totalCost.toFixed(2)},${row.totalProfit.toFixed(2)}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `Monthly_Earnings_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Chart Data configuration
  const months = report.map((r) => r.month)
  const revenues = report.map((r) => r.totalRevenue)
  const profits = report.map((r) => r.totalProfit)

  const pieChartData = {
    labels: months.length > 0 ? months : ['No Data'],
    datasets: [
      {
        label: 'Revenue Share (৳)',
        data: revenues.length > 0 ? revenues : [1],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6',
          '#64748b',
        ],
        borderWidth: 1,
      },
    ],
  }

  const barChartData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue (৳)',
        data: revenues,
        backgroundColor: '#10b981',
      },
      {
        label: 'Net Profit (৳)',
        data: profits,
        backgroundColor: '#3b82f6',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-amber-500" />
              <span>Monthly Earnings & Profit Analytics</span>
            </h1>
            <p className="text-sm text-slate-500">
              Comprehensive financial performance overview and Excel spreadsheet
              export
            </p>
          </div>

          <button
            onClick={exportToExcelCSV}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium shadow text-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (Excel/CSV)</span>
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider self-start">
              Monthly Revenue Share
            </h3>
            <div className="w-full max-w-xs h-64 flex justify-center items-center">
              <Pie data={pieChartData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">
              Revenue vs Net Profit
            </h3>
            <div className="h-64 flex justify-center items-center">
              {report.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  No sales data available for chart.
                </p>
              ) : (
                <Bar
                  data={barChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Monthly Table Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">
              Monthly Earnings Summary Table
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                  <th className="p-4">Month / Year</th>
                  <th className="p-4">Transactions</th>
                  <th className="p-4">Total Revenue (৳)</th>
                  <th className="p-4">Total Cost (COGS) (৳)</th>
                  <th className="p-4">Net Profit (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-slate-500"
                    >
                      Loading monthly earnings...
                    </td>
                  </tr>
                ) : report.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-slate-500"
                    >
                      No monthly earnings records found yet.
                    </td>
                  </tr>
                ) : (
                  report.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-900">
                        {item.month}
                      </td>
                      <td className="p-4 text-slate-700">
                        {item.totalSalesCount} sales
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        ৳{item.totalRevenue.toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-600">
                        ৳{item.totalCost.toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-blue-600">
                        ৳{item.totalProfit.toFixed(2)}
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
