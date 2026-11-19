import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 max-w-md text-center">
        <ShieldX className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          You do not have permission to access this resource. Please contact the
          Store Owner (Boss) if you require permission.
        </p>
        <Link
          to="/"
          className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
