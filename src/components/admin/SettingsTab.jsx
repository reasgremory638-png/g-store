import { useState } from 'react'
import { insertManyProducts } from '../../lib/storage'
import './SettingsTab.css'

const SAMPLE_PRODUCTS = [
  { title: 'مسبحة عنبر أصيل', price: 15000, category: 'سبح', quantity: 50, description: 'مسبحة عنبر طبيعي بـ 99 خرزة', active: true },
  { title: 'بخور عود هندي فاخر', price: 8000, category: 'بخور', quantity: 100, description: 'بخور عود هندي أصلي برائحة مميزة', active: true },
  { title: 'مصحف تجويد مذهّب', price: 25000, category: 'مصاحف', quantity: 30, description: 'مصحف تجويد بغلاف مذهّب فاخر', active: true },
  { title: 'فانوس رمضاني كلاسيك', price: 12000, category: 'فوانيس', quantity: 40, description: 'فانوس رمضاني بالتصميم الكلاسيكي', active: true },
  { title: 'سجادة صلاة قطيفة', price: 20000, category: 'سجادات', quantity: 60, description: 'سجادة صلاة قطيفة ناعمة بألوان متعددة', active: true },
  { title: 'توزيعة ختان كاملة', price: 5000, category: 'توزيعات', quantity: 200, description: 'طقم توزيعة ختان شامل للمناسبات', active: true },
  { title: 'بخور هندي مميز', price: 6000, category: 'بخور', quantity: 80, description: 'بخور هندي عالي الجودة', active: true },
  { title: 'مسبحة برستلي فاخر', price: 22000, category: 'سبح', quantity: 25, description: 'مسبحة كريستال فاخرة برستلي', active: true },
  { title: 'ماء الورد الطبيعي', price: 4500, category: 'عطور', quantity: 70, description: 'ماء ورد طبيعي معطّر', active: true },
  { title: 'سبحة خشب صندل', price: 9000, category: 'سبح', quantity: 45, description: 'سبحة من خشب الصندل العطري', active: true },
  { title: 'مصحف جيب صغير', price: 7000, category: 'مصاحف', quantity: 120, description: 'مصحف جيب صغير سهل الحمل', active: true },
  { title: 'فانوس LED رمضاني', price: 18000, category: 'فوانيس', quantity: 35, description: 'فانوس رمضاني بإضاءة LED لوني', active: true },
  { title: 'سجادة صلاة أطفال', price: 14000, category: 'سجادات', quantity: 55, description: 'سجادة صلاة للأطفال بألوان جميلة', active: true },
  { title: 'طيب مسك خليجي', price: 11000, category: 'عطور', quantity: 65, description: 'طيب مسك خليجي أصيل', active: true },
  { title: 'توزيعة عقيقة تامة', price: 3500, category: 'توزيعات', quantity: 300, description: 'توزيعة عقيقة كاملة للمواليد', active: true },
  { title: 'عطر عود الكمبودي', price: 35000, category: 'عطور', quantity: 20, description: 'عطر عود كمبودي أصلي نادر', active: true },
  { title: 'سجادة صلاة إيرانية', price: 45000, category: 'سجادات', quantity: 15, description: 'سجادة صلاة إيرانية مطرّزة يدويًا', active: true },
  { title: 'مسبحة لؤلؤ صناعي', price: 13000, category: 'سبح', quantity: 60, description: 'مسبحة من اللؤلؤ الصناعي الأبيض', active: true },
  { title: 'بخور دهن عود', price: 17000, category: 'بخور', quantity: 40, description: 'دهن عود طبيعي مركّز', active: true },
  { title: 'طقم بخور متكامل', price: 28000, category: 'بخور', quantity: 25, description: 'طقم بخور متكامل يشمل خشب ودهن وبخور', active: true }
]

export default function SettingsTab({ onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function loadSamples() {
    if (!confirm('سيتم إضافة 20 منتج نموذجي. هل أنت متأكد؟')) return
    setLoading(true)
    try {
      await insertManyProducts(SAMPLE_PRODUCTS)
      setMsg('تم تحميل 20 منتج نموذجي بنجاح ✅')
      onRefresh()
    } catch (err) {
      setMsg('خطأ: ' + err.message)
    }
    setLoading(false)
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div className="settings-tab">
      <div className="settings-card">
        <h3 className="sc-title"><i className="fa-solid fa-database" /> قاعدة البيانات</h3>
        <div className="sc-row">
          <span>وضع التخزين</span>
          <span className="sc-val sc-green">Supabase (PostgreSQL)</span>
        </div>
        <div className="sc-row">
          <span>حالة الاتصال</span>
          <span className="sc-val sc-green"><i className="fa-solid fa-circle" /> متصل</span>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="sc-title"><i className="fa-solid fa-box" /> المنتجات النموذجية</h3>
        <p className="sc-desc">يمكنك تحميل 20 منتج نموذجي لاختبار المتجر.</p>
        {msg && <div className="sc-msg">{msg}</div>}
        <button className="sc-load-btn" onClick={loadSamples} disabled={loading}>
          {loading ? 'جاري التحميل...' : <><i className="fa-solid fa-download" /> تحميل المنتجات الافتراضية (20 منتج)</>}
        </button>
      </div>

      <div className="settings-card">
        <h3 className="sc-title"><i className="fa-brands fa-whatsapp" /> واتساب</h3>
        <div className="sc-row">
          <span className="sc-val">0774 123 8168</span>
        </div>
      </div>
    </div>
  )
}
