import { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import AdminDashboard from '../components/admin/AdminDashboard'
import { fetchProducts, fetchOrders } from '../lib/storage'
import './Admin.css'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [p, o] = await Promise.all([fetchProducts(), fetchOrders()])
    setProducts(p)
    setOrders(o)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()

    // تحديث عند وصول طلب جديد من نفس التبويب (checkout modal)
    const handleNewOrder = async () => {
      setOrders(await fetchOrders())
      setNewOrderAlert(true)
      setTimeout(() => setNewOrderAlert(false), 4000)
    }
    window.addEventListener('g_orders_updated', handleNewOrder)

    // تحديث عند وجود تغيير في تبويب آخر
    const handleStorage = (e) => {
      if (e.key === 'g_orders' || e.key === 'g_products') {
        fetchAll()
      }
    }
    window.addEventListener('storage', handleStorage)

    // تحديث دوري كل 30 ثانية
    const interval = setInterval(fetchAll, 30000)

    return () => {
      window.removeEventListener('g_orders_updated', handleNewOrder)
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [fetchAll])

  return (
    <div className="admin-page">
      <Header adminMode />

      {/* إشعار طلب جديد */}
      {newOrderAlert && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          background: '#22c55e',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 15,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'slideIn 0.3s ease'
        }}>
          <i className="fa-solid fa-bell" />
          طلب جديد وصل! 🎉
        </div>
      )}

      <AdminDashboard
        products={products}
        orders={orders}
        loading={loading}
        onRefresh={fetchAll}
        setProducts={setProducts}
        setOrders={setOrders}
      />
    </div>
  )
}
