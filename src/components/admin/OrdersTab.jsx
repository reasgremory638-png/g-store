import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './OrdersTab.css'

const STATUS_LABELS = { pending: 'معلّق', ready: 'جاهز', delivered: 'مُسلَّم' }
const STATUS_COLORS = {
  pending: { bg: '#fff3cd', color: '#856404' },
  ready: { bg: '#d1ecf1', color: '#0c5460' },
  delivered: { bg: '#d4edda', color: '#155724' }
}
const FILTERS = ['all', 'pending', 'ready', 'delivered']

export default function OrdersTab({ orders, setOrders }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  async function changeStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  async function deleteOrder(id) {
    if (!confirm('حذف هذا الطلب؟')) return
    await supabase.from('orders').delete().eq('id', id)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  function count(s) { return s === 'all' ? orders.length : orders.filter(o => o.status === s).length }

  return (
    <div className="orders-tab">
      <div className="order-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`of-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'الكل' : STATUS_LABELS[f]}
            <span className="of-count">{count(f)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="ot-empty">لا توجد طلبات</p>
      ) : (
        filtered.map(order => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
          const items = Array.isArray(order.items) ? order.items : []
          return (
            <div key={order.id} className="order-card">
              <div className="oc-header">
                <div>
                  <span className="oc-name">{order.name}</span>
                  <span className="oc-status" style={{ background: sc.bg, color: sc.color }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="oc-meta-right">
                  <span className="oc-total">{(order.total || 0).toLocaleString()} د.ع</span>
                  <span className="oc-date">{new Date(order.created_at).toLocaleDateString('ar-IQ')}</span>
                </div>
              </div>

              <div className="oc-info">
                {order.phone && (
                  <a href={`tel:${order.phone}`} className="oc-phone">
                    <i className="fa-solid fa-phone" /> {order.phone}
                  </a>
                )}
                {order.city && <span><i className="fa-solid fa-location-dot" /> {order.city}</span>}
                {order.address && <span><i className="fa-solid fa-map" /> {order.address}</span>}
              </div>

              {items.length > 0 && (
                <div className="oc-items">
                  {items.map((item, i) => (
                    <span key={i} className="oc-item">
                      {item.title} × {item.qty}
                    </span>
                  ))}
                </div>
              )}

              <div className="oc-actions">
                {order.status !== 'pending' && (
                  <button className="oc-status-btn" onClick={() => changeStatus(order.id, 'pending')}>معلّق</button>
                )}
                {order.status !== 'ready' && (
                  <button className="oc-status-btn ready" onClick={() => changeStatus(order.id, 'ready')}>جاهز</button>
                )}
                {order.status !== 'delivered' && (
                  <button className="oc-status-btn delivered" onClick={() => changeStatus(order.id, 'delivered')}>مُسلَّم</button>
                )}
                <button className="oc-delete-btn" onClick={() => deleteOrder(order.id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
