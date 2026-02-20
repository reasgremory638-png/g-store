import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()
  const outOfStock = product.quantity === 0

  function handleAdd() {
    if (outOfStock) return
    addToCart(product, qty)
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
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
              <input
                type="number"
                className="qty-input"
                value={qty}
                min="1"
                max={product.quantity}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.quantity, q + 1))}>+</button>
            </div>
            <button className="add-to-cart-btn" onClick={handleAdd}>
              <i className="fa-solid fa-bag-shopping" />
              أضف للعلاگه
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
