import { useState } from 'react'
import { useCart } from '../context/CartContext'
import './CartModal.css'

export default function CartModal({ onClose, onCheckout }) {
  const { cart, removeFromCart, updateQty, clearCart, getTotal } = useCart()

  return (
    <div className="overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2 className="cart-modal-title">🛍️ علاگه المشتريات</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <i className="fa-solid fa-bag-shopping cart-empty-icon" />
            <p>علاگتك فارغة</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="cart-item-img" />
                    )}
                    <div>
                      <p className="cart-item-name">{item.title}</p>
                      <p className="cart-item-unit">{item.price.toLocaleString()} د.ع</p>
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-qty">
                      <button className="cqty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                      <span className="cqty-val">{item.qty}</span>
                      <button className="cqty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="cart-item-total">
                      {(item.price * item.qty).toLocaleString()} د.ع
                    </span>
                    <button className="cart-item-delete" onClick={() => removeFromCart(item.id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>المجموع الكلي:</span>
                <span className="cart-total-amount">{getTotal().toLocaleString()} د.ع</span>
              </div>
              <div className="cart-actions">
                <button className="cart-clear-btn" onClick={clearCart}>
                  <i className="fa-solid fa-trash" />
                  تفريغ
                </button>
                <button className="cart-close-btn" onClick={onClose}>
                  إغلاق
                </button>
                <button className="cart-checkout-btn" onClick={onCheckout}>
                  <i className="fa-solid fa-check" />
                  تأكيد الطلب
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
