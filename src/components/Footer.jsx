import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copy">© 2025 متجر غريم — جميع الحقوق محفوظة</p>
        <div className="footer-icons">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="footer-icon">
            <i className="fa-brands fa-instagram" />
          </a>
          <a href="https://wa.me/9647711170485" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="footer-icon">
            <i className="fa-brands fa-whatsapp" />
          </a>
        </div>
        <Link to="/admin" className="admin-hidden-link">الإدارة</Link>
      </div>
    </footer>
  )
}
