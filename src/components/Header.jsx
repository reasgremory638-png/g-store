import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export default function Header({ adminMode = false }) {
  const { cartCount } = useCart()
  const { logout } = useAuth()

  return (
    <header className="header">
      <nav className="header-nav">
        <div className="nav-links">
          <Link to="/" className="nav-link">الرئيسية</Link>
          <a href="/#products" className="nav-link">المنتجات</a>
        </div>

        <Link to="/" className="logo">GHARIM</Link>

        <div className="header-actions">
          {adminMode ? (
            <button className="logout-btn" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket" />
              <span>خروج</span>
            </button>
          ) : (
            <div className="cart-btn-wrapper" id="cart-toggle">
              <button className="cart-btn">
                <i className="fa-solid fa-bag-shopping" />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
