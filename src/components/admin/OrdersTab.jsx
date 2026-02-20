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
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', city: '', address: '' })

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = !search || o.name.includes(search) || (o.phone && o.phone.includes(search))
    return matchFilter && matchSearch
  })

  async function changeStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }
  }

  async function deleteOrder(id) {
    if (!confirm('حذف هذا الطلب؟')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (!error) {
      setOrders(prev => prev.filter(o => o.id !== id))
    }
  }

  function startEdit(order) {
    setEditingId(order.id)
    setEditForm({ name: order.name, phone: order.phone || '', city: order.city || '', address: order.address || '' })
  }

  async function saveEdit(id) {
    const { error } = await supabase.from('orders').update(editForm).eq('id', id)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...editForm } : o))
      setEditingId(null)
    }
  }

  function count(s) { return s === 'all' ? orders.length : orders.filter(o => o.status === s).length }

  return (
    <div className="orders-tab">
      <div className="orders-admin-header">
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

        <div className="order-search-box">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="ابحث باسم العميل أو الهاتف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="ot-empty">لا توجد طلبات تطابق بحثك</p>
      ) : (
        filtered.map(order => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
          const items = Array.isArray(order.items) ? order.items : []
          const isEditing = editingId === order.id

          return (
            <div key={order.id} className="order-card">
              {isEditing ? (
                <div className="oc-edit-form">
                  <div className="oc-edit-grid">
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="الاسم" />
                    <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="الهاتف" />
                    <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} placeholder="المحافظة" />
                    <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} placeholder="العنوان" />
                  </div>
                  <div className="oc-edit-btns">
                    <button className="oc-save-btn" onClick={() => saveEdit(order.id)}>حفظ التعديلات</button>
                    <button className="oc-cancel-btn" onClick={() => setEditingId(null)}>إلغاء</button>
                  </div>
                </div>
              ) : (
                <>
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
                    <button className="oc-edit-link" onClick={() => startEdit(order)}>
                      <i className="fa-solid fa-pen-to-square" /> تعديل بيانات العميل
                    </button>
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
                    {order.status === 'pending' && (
                      <button className="oc-status-btn ready highlighted" onClick={() => changeStatus(order.id, 'ready')}>
                        <i className="fa-solid fa-check" /> تم التجهيز
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button className="oc-status-btn delivered" onClick={() => changeStatus(order.id, 'delivered')}>
                        <i className="fa-solid fa-truck" /> تم التسليم
                      </button>
                    )}
                    {order.status !== 'pending' && (
                      <button className="oc-status-btn" onClick={() => changeStatus(order.id, 'pending')}>إرجاع للمعلّق</button>
                    )}
                    <button className="oc-delete-btn" onClick={() => deleteOrder(order.id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
