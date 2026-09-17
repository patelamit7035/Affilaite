import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/supabase`
  : 'https://xilhjacybwljxctpugqw.supabase.co'

export const supabase = createClient(
  supabaseUrl,
  'sb_publishable_mFpNE6QZ5A4q8llRBdo_GQ_Row2uUFb'
)
