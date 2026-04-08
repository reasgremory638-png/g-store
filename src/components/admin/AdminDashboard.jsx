import { useState } from 'react'
import StatsCards from './StatsCards'
import ProductsTab from './ProductsTab'
import OrdersTab from './OrdersTab'
import SettingsTab from './SettingsTab'
import './AdminDashboard.css'

const TABS = [
  { id: 'products', label: 'المنتجات', icon: 'fa-box' },
  { id: 'orders', label: 'الطلبات', icon: 'fa-receipt' },
  { id: 'settings', label: 'الإعدادات', icon: 'fa-gear' }
]

export default function AdminDashboard({ products, orders, loading, onRefresh, setProducts, setOrders }) {
  const [activeTab, setActiveTab] = useState('products')

  const activeProducts = products.filter(p => p.active)
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="admin-dashboard">
      <div className="admin-header-area">
        <h1 className="admin-title">
          <i className="fa-solid fa-chart-line" />
          لوحة التحكم
        </h1>
        <button className="refresh-btn" onClick={onRefresh}>
          <i className="fa-solid fa-rotate-right" />
          تحديث
        </button>
      </div>

      <StatsCards
        activeCount={activeProducts.length}
        ordersCount={orders.length}
        totalSales={totalSales}
      />

      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <>
            {activeTab === 'products' && (
              <ProductsTab products={products} onRefresh={onRefresh} setProducts={setProducts} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab orders={orders} setOrders={setOrders} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab onRefresh={onRefresh} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
