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

// ── Delivery fee logic ─────────────────────────────────────
function getDeliveryFee(city) {
  if (!city) return 0
  if (city === 'البصرة') return 4000
  return 5000
}

export default function CheckoutModal({ onClose, onSuccess }) {
  const { cart, getTotal, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', landmark: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const subtotal = getTotal()
  const deliveryFee = getDeliveryFee(form.city)
  const grandTotal = subtotal + deliveryFee

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
      // 1. حفظ الطلب في Supabase
      const orderData = {
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, qty: item.qty })),
        total: grandTotal,
        subtotal,
        delivery_fee: deliveryFee,
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        landmark: form.landmark,
        notes: form.notes,
        status: 'pending'
      }
      const newOrder = await insertOrder(orderData)

      // إرسال حدث لتحديث الداش بورد
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
          {/* الاسم */}
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

          {/* الهاتف */}
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

          {/* المحافظة */}
          <div className="form-group">
            <label htmlFor="customerCity">المحافظة</label>
            <select id="customerCity" name="customerCity" value={form.city} onChange={e => handleChange('city', e.target.value)}>
              <option value="">اختر المحافظة</option>
              {IRAQI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* المنطقة */}
          <div className="form-group">
            <label htmlFor="customerAddress">المنطقة</label>
            <input
              id="customerAddress"
              name="customerAddress"
              type="text"
              placeholder="الحي، الشارع"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
            />
          </div>

          {/* أقرب نقطة دالة */}
          <div className="form-group">
            <label htmlFor="customerLandmark">اقرب نقطة دالة</label>
            <input
              id="customerLandmark"
              name="customerLandmark"
              type="text"
              placeholder="اقرب نقطة لبيتك"
              value={form.landmark}
              onChange={e => handleChange('landmark', e.target.value)}
            />
          </div>

          {/* ملاحظات */}
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

          {/* ── ملخص السعر ── */}
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toLocaleString()} د.ع</span>
            </div>
            <div className="checkout-summary-row delivery">
              <span>
                <i className="fa-solid fa-truck" />
                أجرة التوصيل
                {form.city && <em> ({form.city})</em>}
              </span>
              <span>
                {deliveryFee === 0
                  ? <span className="delivery-free">اختر المحافظة</span>
                  : `${deliveryFee.toLocaleString()} د.ع`}
              </span>
            </div>
            <div className="checkout-summary-row total">
              <span>المجموع الكلي</span>
              <strong>{grandTotal.toLocaleString()} د.ع</strong>
            </div>
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
