import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { full_name, phone, email, password } = await request.json()

    if (!full_name || !phone || !email || !password) {
      return NextResponse.json({ error: 'Please fill all fields.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xilhjacybwljxctpugqw.supabase.co'
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

    if (!adminKey) {
      return NextResponse.json(
        { error: 'Server signup key is missing. Add SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.' },
        { status: 500 }
      )
    }

    const admin = createClient(supabaseUrl, adminKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        phone: phone.trim()
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 400 })
    }

    return NextResponse.json({
      ok: true,
      user_id: data.user?.id,
      message: 'Account created successfully.'
    })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to create account.' }, { status: 500 })
  }
}
