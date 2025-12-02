import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MenuList from './pages/MenuList'
import MenuDetail from './pages/MenuDetail'
import Cart from './pages/Cart'
import Order from './pages/Order'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import CouponWallet from './pages/CouponWallet'
import KitchenDashboard from './pages/KitchenDashboard'
import DeliveryDashboard from './pages/DeliveryDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Header />
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="/menu/:id" element={<MenuDetail />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['CUSTOMER']}>
                    <Cart />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['CUSTOMER']}>
                    <Order />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['CUSTOMER']}>
                    <Orders />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['CUSTOMER']}>
                    <OrderDetail />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['CUSTOMER']}>
                    <Profile />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coupons"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['CUSTOMER']}>
                    <CouponWallet />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['KITCHEN_STAFF']}>
                    <KitchenDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['DELIVERY_STAFF']}>
                    <DeliveryDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

