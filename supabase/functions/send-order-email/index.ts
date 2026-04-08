import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') ?? 'harvykj30@gmail.com'
const OWNER_PHONE = Deno.env.get('OWNER_PHONE') ?? '07711170485'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order } = await req.json()

    const itemsList = order.items
      .map((i: { title: string; qty: number; price: number }) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${i.title}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:left">${(i.price * i.qty).toLocaleString()} د.ع</td>
        </tr>`
      )
      .join('')

    const html = `
      <div style="font-family:Arial,sans-serif;direction:rtl;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
        <div style="background:#1a1a2e;color:#fff;padding:20px;text-align:center">
          <h1 style="margin:0;font-size:22px">🛍️ طلب جديد</h1>
          <p style="margin:4px 0;opacity:.8">رقم الطلب: #${order.id}</p>
        </div>
        <div style="padding:24px">
          <h2 style="color:#333;margin-top:0">بيانات العميل</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:6px 0;color:#666;width:130px">الاسم:</td><td style="font-weight:bold">${order.name}</td></tr>
            <tr><td style="padding:6px 0;color:#666">الهاتف:</td><td style="font-weight:bold">${order.phone}</td></tr>
            <tr><td style="padding:6px 0;color:#666">المحافظة:</td><td>${order.city || 'غير محدد'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">العنوان:</td><td>${order.address || 'غير محدد'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">الملاحظات:</td><td>${order.notes || '—'}</td></tr>
          </table>

          <h2 style="color:#333">المنتجات</h2>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:10px;text-align:right">المنتج</th>
                <th style="padding:10px;text-align:center">الكمية</th>
                <th style="padding:10px;text-align:left">السعر</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>

          <div style="background:#f9f9f9;padding:16px;margin-top:16px;border-radius:6px;text-align:left">
            <strong style="font-size:18px">المجموع: ${order.total.toLocaleString()} د.ع</strong>
          </div>

          <p style="color:#999;font-size:12px;margin-top:24px;text-align:center">
            ${new Date().toLocaleDateString('ar-IQ', { dateStyle: 'full' })}
          </p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'G-Store Orders <onboarding@resend.dev>',
        to: [OWNER_EMAIL],
        subject: `🛍️ طلب جديد #${order.id} — ${order.name}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
