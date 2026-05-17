import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext({})

const CART_KEY = 'cart_stickers'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }
      return [...prev, { ...product, qty }]
    })
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  function updateQty(id, delta) {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    )
  }

  function clearCart() {
    setCart([])
  }

  function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  }

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQty, clearCart, getTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
