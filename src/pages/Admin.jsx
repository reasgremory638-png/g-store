import { useState, useEffect } from 'react'
import Header from '../components/Header'
import AdminDashboard from '../components/admin/AdminDashboard'
import { supabase } from '../lib/supabase'
import './Admin.css'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    setLoading(true)
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('stickers').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false })
    ])
    setProducts(prods || [])
    setOrders(ords || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="admin-page">
      <Header adminMode />
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
