// localStorage-based data layer (replaces Supabase)

const PRODUCTS_KEY = 'g_products'
const ORDERS_KEY = 'g_orders'

function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ── Products ──────────────────────────────────────────────
export function fetchProducts({ activeOnly = false } = {}) {
  let products = getProducts()
  if (activeOnly) products = products.filter(p => p.active)
  return [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function fetchProductById(id) {
  return getProducts().find(p => p.id === id) || null
}

export function insertProduct(data) {
  const products = getProducts()
  const newProduct = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString()
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export function updateProduct(id, data) {
  const products = getProducts()
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) return null
  products[idx] = { ...products[idx], ...data }
  saveProducts(products)
  return products[idx]
}

export function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id)
  saveProducts(products)
}

export function insertManyProducts(items) {
  const products = getProducts()
  const newItems = items.map(item => ({
    ...item,
    id: generateId(),
    created_at: new Date().toISOString()
  }))
  saveProducts([...products, ...newItems])
}

// ── Orders ───────────────────────────────────────────────
export function fetchOrders() {
  return [...getOrders()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function insertOrder(data) {
  const orders = getOrders()
  const newOrder = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  saveOrders(orders)
  return newOrder
}

export function updateOrder(id, data) {
  const orders = getOrders()
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return null
  orders[idx] = { ...orders[idx], ...data }
  saveOrders(orders)
  return orders[idx]
}

export function deleteOrder(id) {
  const orders = getOrders().filter(o => o.id !== id)
  saveOrders(orders)
}
