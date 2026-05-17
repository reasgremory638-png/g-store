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

const ORDER_CORE_FIELDS = ['items', 'total', 'name', 'phone', 'city', 'address', 'notes', 'status']
const ORDER_EXTENDED_FIELDS = ['subtotal', 'delivery_fee', 'landmark']

function pickFields(obj, keys) {
  const out = {}
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== '') out[key] = obj[key]
  }
  return out
}

function buildOrderPayload(orderData) {
  const id = crypto.randomUUID()
  const address = [orderData.address, orderData.landmark].filter(Boolean).join(' — ')
  const core = pickFields({ ...orderData, address: address || orderData.address }, ORDER_CORE_FIELDS)
  const extended = pickFields(orderData, ORDER_EXTENDED_FIELDS)
  return { id, ...core, ...extended }
}

export async function insertOrder(orderData) {
  // توليد معرّف محلي للطلب لتجنب مشاكل قراءة البيانات (RLS) للمستخدم المجهول
  let payload = buildOrderPayload(orderData)

  let { error } = await supabase.from('orders').insert(payload)
  if (error?.code === 'PGRST204') {
    // Schema may not have subtotal / delivery_fee / landmark yet — retry with core fields only
    const { id, ...core } = pickFields(payload, ['id', ...ORDER_CORE_FIELDS])
    payload = { id, ...core }
    ;({ error } = await supabase.from('orders').insert(payload))
  }
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
