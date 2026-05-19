import { createContext, useContext, useEffect, useState } from 'react'
import { fetchProductsByIds } from '../lib/storage'

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
    async function refreshCartDetails() {
      if (cart.length === 0) return
      try {
        const ids = cart.map(item => item.id)
        const products = await fetchProductsByIds(ids)
        if (!products || products.length === 0) return

        setCart(prev => {
          return prev.map(item => {
            const dbProduct = products.find(p => p.id === item.id)
            if (dbProduct) {
              return { ...dbProduct, qty: item.qty }
            }
            return item
          })
        })
      } catch (err) {
        console.error('Failed to refresh cart details:', err)
      }
    }
    refreshCartDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const serialized = cart.map(item => {
      const cleanItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty
      }
      if (item.image_url && !item.image_url.startsWith('data:')) {
        cleanItem.image_url = item.image_url
      }
      return cleanItem
    })
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(serialized))
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err)
    }
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
