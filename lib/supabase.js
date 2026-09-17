import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/supabase`
  : 'https://ezncqwoxblmatlexxfvr.supabase.co'

export const supabase = createClient(
  supabaseUrl,
  'sb_publishable_E9tNcSu50uEvJ-XUSYoKvg_zQmuhksJ'
)
