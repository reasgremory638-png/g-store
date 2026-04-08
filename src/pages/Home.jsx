import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Filters from '../components/Filters'
import ProductGrid from '../components/ProductGrid'
import CartModal from '../components/CartModal'
import CheckoutModal from '../components/CheckoutModal'
import Toast from '../components/Toast'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../lib/storage'
import './Home.css'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [toast, setToast] = useState('')
  const { cartCount } = useCart()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        let data = await fetchProducts({ activeOnly: true })
        
        // إذا كان المتجر فارغاً، أضف عينات تجريبية
        if (data.length === 0) {
          const m = await import('../lib/storage')
          await m.insertManyProducts([
            { title: 'مصحف تهجد فاخر', price: 25000, category: 'مصاحف', image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500', active: true },
            { title: 'بخور عود ملكي', price: 15000, category: 'بخور', image: 'https://images.unsplash.com/photo-1595990000000-000000000000?q=80&w=500', active: true }
          ])
          window.location.reload()
        }
        
        setProducts(data)
      } catch (err) {
        setError(err.message)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
    return cats
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
      const matchCat = !category || p.category === category
      return matchSearch && matchCat
    })
  }, [products, search, category])

  function handleCartToggle() {
    setShowCart(v => !v)
  }

  function handleCheckout() {
    setShowCart(false)
    setShowCheckout(true)
  }

  function handleOrderSuccess(msg) {
    setToast(msg)
  }

  return (
    <div className="home-page">
      {/* Wrap header to handle cart click */}
      <div onClick={(e) => {
        if (e.target.closest('#cart-toggle')) handleCartToggle()
      }}>
        <Header />
      </div>

      <Hero />
      <Filters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onReset={() => { setSearch(''); setCategory('') }}
      />
      <main>
        <ProductGrid products={filtered} loading={loading} error={error} />
      </main>
      <Footer />

      {showCart && (
        <CartModal
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
        />
      )}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
      <Toast message={toast} onHide={() => setToast('')} />
    </div>
  )
}
