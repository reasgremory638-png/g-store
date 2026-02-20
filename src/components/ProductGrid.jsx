import ProductCard from './ProductCard'
import { Link } from 'react-router-dom'
import './ProductGrid.css'

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="pg-empty">
        <i className="fa-solid fa-triangle-exclamation pg-empty-icon" style={{color:'#ef4444'}} />
        <h3>حدث خطأ في تحميل المنتجات</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="pg-empty">
        <i className="fa-solid fa-box-open pg-empty-icon" />
        <h3>لا توجد منتجات حالياً</h3>
        <p>لم يتم إضافة أي منتجات بعد. يمكن للمسؤول إضافتها من لوحة التحكم.</p>
        <Link to="/admin" className="pg-admin-link">
          <i className="fa-solid fa-screwdriver-wrench" />
          الذهاب للوحة التحكم
        </Link>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
