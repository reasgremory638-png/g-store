import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copy"></p>
        <div className="footer-icons">
         <p> Website By - Control - </p>
        </div>
        <Link to="/admin" className="admin-hidden-link">الإدارة</Link>
      </div>
    </footer>
  )
}
