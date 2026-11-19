import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BakiKhata } from './pages/BakiKhata'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { MonthlyEarnings } from './pages/MonthlyEarnings'
import { Products } from './pages/Products'
import { Register } from './pages/Register'
import { Sales } from './pages/Sales'
import { Unauthorized } from './pages/Unauthorized'

function App() {
  return (
    <Routes>
      <Route
        path="/register"
        element={<Register />}
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />
      <Route
        path="/sales"
        element={<Sales />}
      />
      <Route
        path="/baki"
        element={<BakiKhata />}
      />
      <Route
        path="/earnings"
        element={<MonthlyEarnings />}
      />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<Dashboard />}
        />
        <Route
          path="/products"
          element={<Products />}
        />
      </Route>
    </Routes>
  )
}

export default App
