import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { insertOrder } from '../lib/storage'
import './CheckoutModal.css'

const IRAQI_CITIES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك',
  'الأنبار', 'ذي قار', 'ديالى', 'بابل', 'السليمانية', 'ميسان',
  'الديوانية', 'صلاح الدين', 'دهوك', 'المثنى', 'واسط'
]

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function CheckoutModal({ onClose, onSuccess }) {
  const { cart, getTotal, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' })
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
      // 1. حفظ الطلب في Supabase → يظهر فوراً في الداش بورد
      const orderData = {
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, qty: item.qty })),
        total: getTotal(),
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        notes: form.notes,
        status: 'pending'
      }
      const newOrder = await insertOrder(orderData)

      // إرسال حدث storage لتحديث الداش بورد في نفس المتصفح
      window.dispatchEvent(new Event('g_orders_updated'))

      // 2. إرسال إيميل عبر Resend (Supabase Edge Function)
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ order: newOrder }),
        })
      } catch (emailErr) {
        // الإيميل اختياري — الطلب يُحفظ حتى لو فشل الإيميل
        console.warn('فشل إرسال الإيميل:', emailErr)
      }

      clearCart()
      onSuccess('تم استلام طلبك بنجاح! سيتم التواصل معك قريباً ✅')
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
            <label htmlFor="customerName">الاسم الكامل *</label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="err-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">رقم الهاتف *</label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              placeholder="07XXXXXXXXX"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="err-msg">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="customerCity">المحافظة</label>
            <select id="customerCity" name="customerCity" value={form.city} onChange={e => handleChange('city', e.target.value)}>
              <option value="">اختر المحافظة</option>
              {IRAQI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="customerAddress">العنوان التفصيلي</label>
            <input
              id="customerAddress"
              name="customerAddress"
              type="text"
              placeholder="الحي، الشارع، رقم البيت..."
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerNotes">ملاحظات إضافية</label>
            <textarea
              id="customerNotes"
              name="customerNotes"
              placeholder="أي تعليمات خاصة..."
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="checkout-total">
            <span>المجموع: </span>
            <strong>{getTotal().toLocaleString()} د.ع</strong>
          </div>

          <button type="submit" className="submit-order-btn" disabled={loading}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> جاري إرسال الطلب...</>
            ) : (
              <><i className="fa-solid fa-paper-plane" /> تأكيد الطلب</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
