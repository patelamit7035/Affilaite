import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/supabase`
  : 'https://muajwelavkdzwwglaudj.supabase.co'

export const supabase = createClient(
  supabaseUrl,
  'sb_publishable_Vbw4yLeWaADSKNVKotl5Wg_KEFyISxC'
)
