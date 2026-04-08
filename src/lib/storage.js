import { supabase } from './supabase'

// ── Products ──────────────────────────────────────────────
export async function fetchProducts({ activeOnly = false } = {}) {
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })
  if (activeOnly) {
    query = query.eq('active', true)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) {
    console.error(error)
    return null
  }
  return data
}

export async function insertProduct(productData) {
  const { data, error } = await supabase.from('products').insert(productData).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, productData) {
  const { data, error } = await supabase.from('products').update(productData).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function insertManyProducts(items) {
  const { error } = await supabase.from('products').insert(items)
  if (error) throw error
}

// ── Orders ───────────────────────────────────────────────
export async function fetchOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertOrder(orderData) {
  // توليد معرّف محلي للطلب لتجنب مشاكل قراءة البيانات (RLS) للمستخدم المجهول
  const id = crypto.randomUUID()
  const payload = { ...orderData, id }
  
  const { error } = await supabase.from('orders').insert(payload)
  if (error) throw error
  
  return { ...payload, created_at: new Date().toISOString() }
}

export async function updateOrder(id, orderData) {
  const { data, error } = await supabase.from('orders').update(orderData).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteOrder(id) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}
