import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kztjouywtnorkbvmtpwa.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BkOtY7izopw810yVci77lg_tZmu3B2d'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
