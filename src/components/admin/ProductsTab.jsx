import { useState } from 'react'
import { insertProduct, updateProduct, deleteProduct } from '../../lib/storage'
import './ProductsTab.css'

// ── Utility: read file → base64 ────────────────────────────
function readFileAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

// ── Multi-image picker shared component ───────────────────
function MultiImagePicker({ images, onChange, label = 'صور المنتج' }) {
  const [progress, setProgress] = useState(0)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setProgress(30)
    const base64s = await Promise.all(files.map(readFileAsBase64))
    setProgress(100)
    setTimeout(() => setProgress(0), 800)
    onChange([...images, ...base64s])
    e.target.value = ''
  }

  function removeImage(idx) {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="apt-field full">
      <label>{label}</label>
      <input type="file" accept="image/*" multiple onChange={handleFiles} />
      {progress > 0 && (
        <div className="img-progress"><div style={{ width: `${progress}%` }} /></div>
      )}
      {images.length > 0 && (
        <div className="multi-img-grid">
          {images.map((src, i) => (
            <div key={i} className="multi-img-item">
              <img src={src} alt={`img-${i}`} />
              {i === 0 && <span className="multi-img-badge">رئيسية</span>}
              <button type="button" className="multi-img-remove" onClick={() => removeImage(i)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Add Product Form ───────────────────────────────────────
function AddProductForm({ onRefresh }) {
  const [form, setForm] = useState({ title: '', price: '', category: '', quantity: 100, description: '', active: true })
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.price) return
    setSubmitting(true)
    try {
      const [mainImg, ...extras] = images
      await insertProduct({
        title: form.title,
        price: parseInt(form.price),
        category: form.category,
        quantity: parseInt(form.quantity),
        description: form.description,
        active: form.active,
        image_url: mainImg || null,
        extra_images: extras.length ? extras : null,
      })
      setForm({ title: '', price: '', category: '', quantity: 100, description: '', active: true })
      setImages([])
      onRefresh()
    } catch (err) {
      console.error(err)
      alert('فشل إضافة المنتج')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      <h3 className="apt-title"><i className="fa-solid fa-plus" /> إضافة منتج جديد</h3>
      <div className="apt-grid">
        <div className="apt-field">
          <label>اسم المنتج *</label>
          <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="مثال: مسبحة عنبر" required />
        </div>
        <div className="apt-field">
          <label>السعر (د.ع) *</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="5000" required />
        </div>
        <div className="apt-field">
          <label>التصنيف</label>
          <input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="مثال: سبح" />
        </div>
        <div className="apt-field">
          <label>الكمية</label>
          <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} min="0" />
        </div>
      </div>
      <div className="apt-field full">
        <label>الوصف</label>
        <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="وصف المنتج..." rows={3} />
      </div>

      <MultiImagePicker images={images} onChange={setImages} label="صور المنتج (الأولى تصبح الصورة الرئيسية)" />

      <div className="apt-check">
        <input type="checkbox" id="active-check" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} />
        <label htmlFor="active-check">مفعّل في المتجر</label>
      </div>
      <button type="submit" className="apt-submit" disabled={submitting}>
        {submitting ? 'جاري الإضافة...' : <><i className="fa-solid fa-plus" /> إضافة المنتج</>}
      </button>
    </form>
  )
}

// ── Product Row ────────────────────────────────────────────
function ProductRow({ product, onRefresh }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: product.title, price: product.price, category: product.category || '', quantity: product.quantity, description: product.description || '' })
  const [saving, setSaving] = useState(false)

  // Collect existing images for editing
  const existingImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(Array.isArray(product.extra_images) ? product.extra_images : []),
  ]
  const [images, setImages] = useState(existingImages)

  const qtyColor = product.quantity === 0 ? '#ef4444' : product.quantity < 10 ? '#f59e0b' : '#22c55e'

  async function handleSave() {
    setSaving(true)
    try {
      const [mainImg, ...extras] = images
      await updateProduct(product.id, {
        title: form.title,
        price: parseInt(form.price),
        category: form.category,
        quantity: parseInt(form.quantity),
        description: form.description,
        image_url: mainImg || null,
        extra_images: extras.length ? extras : null,
      })
      setEditing(false)
      onRefresh()
    } catch (err) {
      console.error(err)
      alert('فشل حفظ التعديل')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`حذف "${product.title}"؟`)) return
    try {
      await deleteProduct(product.id)
      onRefresh()
    } catch (err) {
      console.error(err)
      alert('فشل حذف المنتج')
    }
  }

  return (
    <div className="product-row">
      <div className="pr-main">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="pr-img" />
        ) : (
          <div className="pr-img-ph"><i className="fa-solid fa-image" /></div>
        )}
        <div className="pr-details">
          <p className="pr-name">{product.title}</p>
          <p className="pr-meta">{product.price.toLocaleString()} د.ع · {product.category || 'بدون تصنيف'}</p>
          {product.description && <p className="pr-desc">{product.description.slice(0, 80)}{product.description.length > 80 ? '...' : ''}</p>}
        </div>
        <span className="pr-qty-badge" style={{ background: qtyColor + '20', color: qtyColor }}>
          {product.quantity} قطعة
        </span>
        {/* image count badge */}
        {(existingImages.length > 1) && (
          <span className="pr-img-count"><i className="fa-solid fa-images" /> {existingImages.length}</span>
        )}
      </div>

      {editing ? (
        <div className="pr-edit-form">
          <div className="pr-edit-grid">
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="الاسم" />
            <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="السعر" />
            <input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="التصنيف" />
            <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} placeholder="الكمية" />
          </div>
          <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="الوصف" className="pr-desc-input" />
          <MultiImagePicker images={images} onChange={setImages} label="الصور (اسحب لإعادة الترتيب، الأولى رئيسية)" />
          <div className="pr-edit-actions">
            <button className="pr-save-btn" onClick={handleSave} disabled={saving}>{saving ? 'جاري...' : 'حفظ'}</button>
            <button className="pr-cancel-btn" onClick={() => { setEditing(false); setImages(existingImages) }}>إلغاء</button>
          </div>
        </div>
      ) : (
        <div className="pr-actions">
          <button className="pr-edit-btn" onClick={() => setEditing(true)}><i className="fa-solid fa-pen" /> تعديل</button>
          <button className="pr-delete-btn" onClick={handleDelete}><i className="fa-solid fa-trash" /> حذف</button>
        </div>
      )}
    </div>
  )
}

export default function ProductsTab({ products, onRefresh }) {
  return (
    <div className="products-tab">
      <AddProductForm onRefresh={onRefresh} />
      <div className="products-list">
        <h3 className="pl-title">المنتجات ({products.length})</h3>
        {products.length === 0 ? (
          <p className="pl-empty">لا توجد منتجات بعد</p>
        ) : (
          products.map(p => <ProductRow key={p.id} product={p} onRefresh={onRefresh} />)
        )}
      </div>
    </div>
  )
}
