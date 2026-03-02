import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductById } from '../lib/storage'
import { useCart } from '../context/CartContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const data = fetchProductById(id)
    setProduct(data)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pd-not-found">
        <i className="fa-solid fa-box-open" style={{ fontSize: 50, color: 'var(--border-color)', marginBottom: 16 }} />
        <h2>المنتج غير موجود</h2>
        <Link to="/" className="pd-back-link">← العودة للمتجر</Link>
      </div>
    )
  }

  const outOfStock = product.quantity === 0

  function handleAdd() {
    addToCart(product, qty)
    setToast(`تمت إضافة "${product.title}" للعلاگة ✅`)
  }

  return (
    <div className="pd-page">
      <Header />
      <div className="pd-container">
        <Link to="/" className="pd-back">
          <i className="fa-solid fa-arrow-right" /> العودة إلى المتجر
        </Link>

        <div className="pd-card">
          {product.image_url && (
            <div className="pd-img-wrap">
              <img src={product.image_url} alt={product.title} className="pd-img" />
            </div>
          )}
          <div className="pd-info">
            {product.category && <span className="pd-cat">{product.category}</span>}
            <h1 className="pd-title">{product.title}</h1>
            <div className="pd-price">
              <span>{product.price.toLocaleString()}</span>
              <span className="pd-currency">د.ع</span>
            </div>
            {product.description && (
              <p className="pd-desc">{product.description}</p>
            )}

            {!outOfStock ? (
              <>
                <div className="pd-qty">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                  <input
                    type="number"
                    value={qty}
                    min="1"
                    max={product.quantity}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))}>+</button>
                </div>
                <button className="pd-add-btn" onClick={handleAdd}>
                  <i className="fa-solid fa-bag-shopping" />
                  إضافة للعلاگه
                </button>
              </>
            ) : (
              <button className="pd-oos-btn" disabled>📦 نفذ المخزون</button>
            )}

            <p className="pd-stock">
              <i className="fa-solid fa-cubes-stacked" />
              المتوفر: {product.quantity} قطعة
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <Toast message={toast} onHide={() => setToast('')} />
    </div>
  )
}
