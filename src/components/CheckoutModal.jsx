import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import './CheckoutModal.css'

const IRAQI_CITIES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك',
  'الأنبار', 'ذي قار', 'ديالى', 'بابل', 'السليمانية', 'ميسان',
  'الديوانية', 'صلاح الدين', 'دهوك', 'المثنى', 'واسط'
]

export default function CheckoutModal({ onClose, onSuccess }) {
  const { cart, getTotal, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'الاسم مطلوب'
    if (!form.phone.trim()) e.phone = 'رقم الهاتف مطلوب'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const orderData = {
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, qty: item.qty })),
        total: getTotal(),
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        status: 'pending'
      }

      const { error } = await supabase.from('orders').insert([orderData])
      if (error) throw error

      // Build WhatsApp message
      const items = cart.map(i => `• ${i.title} × ${i.qty} = ${(i.price * i.qty).toLocaleString()} د.ع`).join('\n')
      const msg = `🛍️ *طلب جديد من متجر غريم*\n\n👤 الاسم: ${form.name}\n📱 الهاتف: ${form.phone}\n🏙️ المحافظة: ${form.city || 'غير محدد'}\n📍 العنوان: ${form.address || 'غير محدد'}\n\n📦 *المنتجات:*\n${items}\n\n💰 *المجموع الكلي: ${getTotal().toLocaleString()} د.ع*`

      clearCart()
      window.open(`https://wa.me/9647741238168?text=${encodeURIComponent(msg)}`, '_blank')
      onSuccess('تم إرسال طلبك بنجاح! 🎉')
      onClose()
    } catch (err) {
      console.error(err)
      onSuccess('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>📋 إتمام الطلب</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label>الاسم الكامل *</label>
            <input
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="err-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>رقم الهاتف *</label>
            <input
              type="tel"
              placeholder="07XXXXXXXXX"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="err-msg">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>المحافظة</label>
            <select value={form.city} onChange={e => handleChange('city', e.target.value)}>
              <option value="">اختر المحافظة</option>
              {IRAQI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>العنوان التفصيلي</label>
            <input
              type="text"
              placeholder="الحي، الشارع، رقم البيت..."
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
            />
          </div>

          <div className="checkout-total">
            <span>المجموع: </span>
            <strong>{getTotal().toLocaleString()} د.ع</strong>
          </div>

          <button type="submit" className="submit-order-btn" disabled={loading}>
            {loading ? (
              <>جاري إرسال الطلب...</>
            ) : (
              <><i className="fa-brands fa-whatsapp" /> تأكيد وإرسال عبر واتساب</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
