import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const outOfStock = product.quantity === 0

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function handleQtyChange(e, delta) {
    e.preventDefault()
    e.stopPropagation()
    if (delta === -1) setQty(q => Math.max(1, q - 1))
    else setQty(q => Math.min(product.quantity, q + 1))
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-img-link">
        <div className="product-img-wrap">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="product-img" loading="lazy" />
          ) : (
            <div className="product-img-placeholder">
              <i className="fa-solid fa-image" />
            </div>
          )}
          {product.category && (
            <span className="product-category-badge">{product.category}</span>
          )}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>

        <div className="product-price-box">
          <span className="product-price">{product.price.toLocaleString()}</span>
          <span className="price-currency">د.ع</span>
        </div>

        {!outOfStock ? (
          <>
            <div className="qty-control" onClick={e => e.stopPropagation()}>
              <button className="qty-btn" onClick={e => handleQtyChange(e, -1)}>-</button>
              <input
                type="number"
                className="qty-input"
                value={qty}
                min="1"
                max={product.quantity}
                onChange={e => { e.stopPropagation(); setQty(Math.max(1, parseInt(e.target.value) || 1)) }}
                onClick={e => e.stopPropagation()}
              />
              <button className="qty-btn" onClick={e => handleQtyChange(e, 1)}>+</button>
            </div>
            <button
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
            >
              <i className={`fa-solid ${added ? 'fa-check' : 'fa-bag-shopping'}`} />
              {added ? 'تمت الإضافة ✓' : 'أضف للعلاگه'}
            </button>
          </>
        ) : (
          <button className="out-of-stock-btn" disabled>
            📦 نفذ المخزون
          </button>
        )}
      </div>
    </div>
  )
}

