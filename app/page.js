'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

function Notice({ type = 'notice', children }) {
  if (!children) return null
  return <div className={`${type === 'error' ? 'notice error' : type === 'success' ? 'notice success' : 'notice'}`}>{children}</div>
}

export default function Home() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [adminLeads, setAdminLeads] = useState([])
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [authForm, setAuthForm] = useState({ full_name: '', phone: '', email: '', password: '' })
  const [leadForm, setLeadForm] = useState({ full_name: '', email: '', phone: '' })
  const [refCode, setRefCode] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRefCode((params.get('ref') || '').trim().toUpperCase())

    supabase.from('fos_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setSettings(data || null))

    supabase.auth.getSession().then(({ data }) => setSession(data.session || null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    loadDashboard()
  }, [session])

  async function loadDashboard() {
    setError('')
    const uid = session?.user?.id
    if (!uid) return

    const { data: profileData, error: profileError } = await supabase
      .from('fos_profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle()

    if (profileError) {
      setError(profileError.message)
      return
    }

    setProfile(profileData)

    if (profileData?.role === 'admin') {
      const [usersResult, leadsResult] = await Promise.all([
        supabase.from('fos_profiles').select('id,full_name,email,phone,affiliate_code,role,status,created_at').order('created_at', { ascending: false }),
        supabase.from('fos_leads').select('id,full_name,email,phone,affiliate_code,affiliate_id,source,status,created_at').order('created_at', { ascending: false })
      ])
      setAdminUsers(usersResult.data || [])
      setAdminLeads(leadsResult.data || [])
    } else {
      const [statsResult, leadsResult] = await Promise.all([
        supabase.rpc('fos_affiliate_stats'),
        supabase.rpc('fos_affiliate_leads')
      ])
      setStats(statsResult.data || null)
      setLeads(leadsResult.data || [])
    }
  }

  const affiliateNameMap = useMemo(() => {
    const map = {}
    adminUsers.forEach((u) => { map[u.id] = u.full_name || u.email || u.affiliate_code })
    return map
  }, [adminUsers])

  async function submitAuth(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm)
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to create account')

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password
        })
        if (loginError) throw loginError

        setMessage('Account created successfully. No confirmation email was sent.')
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password
        })
        if (loginError) throw loginError
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function submitLead(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { data, error: leadError } = await supabase.rpc('fos_register_lead', {
        p_full_name: leadForm.full_name,
        p_email: leadForm.email,
        p_phone: leadForm.phone,
        p_affiliate_code: refCode || null,
        p_source: 'affiliate_link'
      })
      if (leadError) throw leadError
      setLeadSubmitted(true)
      setMessage(data?.ok ? 'Thank you. Your details have been submitted.' : 'Submitted successfully.')
    } catch (err) {
      setError(err.message || 'Unable to submit form')
    } finally {
      setBusy(false)
    }
  }

  async function claimAdmin() {
    setBusy(true)
    setError('')
    const { error: claimError } = await supabase.rpc('fos_claim_owner_admin')
    setBusy(false)
    if (claimError) return setError(claimError.message)
    setMessage('Admin access activated.')
    await loadDashboard()
  }

  async function copyLink() {
    const link = `${window.location.origin}/?ref=${profile.affiliate_code}`
    await navigator.clipboard.writeText(link)
    setMessage('Affiliate link copied.')
  }

  async function logout() {
    await supabase.auth.signOut()
    setProfile(null)
    setStats(null)
    setLeads([])
    setAdminUsers([])
    setAdminLeads([])
  }

  if (refCode && !session) {
    return (
      <main className="wrap">
        <div className="topbar">
          <div>
            <div className="brand">FunnelOS Affiliate</div>
            <div className="sub">Referral Registration</div>
          </div>
          <span className="pill">Ref: {refCode}</span>
        </div>

        <div className="card auth">
          <h1>{settings?.product_name || 'FunnelOS'}</h1>
          <p className="muted">Fill out the form below. Your lead will be connected to the person who shared this referral link.</p>
          <Notice type="error">{error}</Notice>
          <Notice type="success">{message}</Notice>
          {!leadSubmitted && (
            <form onSubmit={submitLead}>
              <div className="field"><label>Full Name</label><input required value={leadForm.full_name} onChange={(e) => setLeadForm({ ...leadForm, full_name: e.target.value })} /></div>
              <div className="field"><label>Email</label><input type="email" required value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input required value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} /></div>
              <button className="btn" disabled={busy}>{busy ? 'Submitting...' : 'Submit'}</button>
            </form>
          )}
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main>
        <section className="hero">
          <div className="brand">FunnelOS Affiliate</div>
          <h1>Share. Track Leads. Grow.</h1>
          <p>Create your account, get your referral link, share it, and see your generated leads inside your own dashboard.</p>
        </section>
        <div className="card auth">
          <div className="tabs">
            <button className={`btn ${mode === 'login' ? '' : 'alt'}`} onClick={() => setMode('login')}>Login</button>
            <button className={`btn ${mode === 'signup' ? '' : 'alt'}`} onClick={() => setMode('signup')}>Sign Up</button>
          </div>
          <Notice type="error">{error}</Notice>
          <Notice type="success">{message}</Notice>
          <form onSubmit={submitAuth}>
            {mode === 'signup' && <>
              <div className="field"><label>Full Name</label><input required value={authForm.full_name} onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input required value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} /></div>
            </>}
            <div className="field"><label>Email</label><input type="email" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} /></div>
            <div className="field"><label>Password</label><input type="password" minLength="6" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} /></div>
            <button className="btn" disabled={busy}>{busy ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}</button>
          </form>
        </div>
      </main>
    )
  }

  if (!profile) {
    return <main className="wrap"><div className="card">Loading dashboard...</div></main>
  }

  if (profile.role === 'admin') {
    return (
      <main className="wrap">
        <div className="topbar">
          <div><div className="brand">FunnelOS Affiliate Admin</div><div className="sub">Users and leads</div></div>
          <button className="btn alt" onClick={logout}>Logout</button>
        </div>
        <Notice type="error">{error}</Notice>
        <Notice type="success">{message}</Notice>
        <div className="grid">
          <div className="card"><div className="muted">Registered Users</div><div className="metric">{adminUsers.length}</div></div>
          <div className="card"><div className="muted">Total Leads</div><div className="metric">{adminLeads.length}</div></div>
          <div className="card"><div className="muted">Product</div><div className="metric" style={{fontSize:22}}>{settings?.product_name || 'FunnelOS'}</div></div>
        </div>

        <div className="sectionTitle">All Leads</div>
        <div className="card tablewrap"><table className="table"><thead><tr><th>Lead</th><th>Email</th><th>Phone</th><th>Affiliate User</th><th>Code</th><th>Date</th></tr></thead><tbody>
          {adminLeads.map((lead) => <tr key={lead.id}><td>{lead.full_name}</td><td>{lead.email}</td><td>{lead.phone}</td><td>{affiliateNameMap[lead.affiliate_id] || 'Direct'}</td><td>{lead.affiliate_code || '-'}</td><td>{new Date(lead.created_at).toLocaleString()}</td></tr>)}
          {!adminLeads.length && <tr><td colSpan="6">No leads yet.</td></tr>}
        </tbody></table></div>

        <div className="sectionTitle">All Users</div>
        <div className="card tablewrap"><table className="table"><thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Affiliate Code</th><th>Role</th></tr></thead><tbody>
          {adminUsers.map((user) => <tr key={user.id}><td>{user.full_name || '-'}</td><td>{user.email}</td><td>{user.phone || '-'}</td><td>{user.affiliate_code}</td><td>{user.role}</td></tr>)}
        </tbody></table></div>
      </main>
    )
  }

  const affiliateLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile.affiliate_code}` : ''

  return (
    <main className="wrap">
      <div className="topbar">
        <div><div className="brand">FunnelOS Affiliate</div><div className="sub">Welcome, {profile.full_name || profile.email}</div></div>
        <div style={{display:'flex',gap:8}}>
          {session.user.email === 'patelamit7035@gmail.com' && <button className="btn alt" onClick={claimAdmin} disabled={busy}>Make Me Admin</button>}
          <button className="btn alt" onClick={logout}>Logout</button>
        </div>
      </div>
      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <div className="grid">
        <div className="card"><div className="muted">Product</div><div className="metric" style={{fontSize:22}}>{settings?.product_name || 'FunnelOS'}</div></div>
        <div className="card"><div className="muted">Clicks</div><div className="metric">{stats?.clicks ?? 0}</div></div>
        <div className="card"><div className="muted">Leads</div><div className="metric">{stats?.leads ?? 0}</div></div>
        <div className="card"><div className="muted">Affiliate Code</div><div className="metric" style={{fontSize:20}}>{profile.affiliate_code}</div></div>
      </div>

      <div className="sectionTitle">Your Affiliate Link</div>
      <div className="card">
        <div className="linkbox"><input readOnly value={affiliateLink} /><button className="btn" onClick={copyLink}>Copy Link</button></div>
        <p className="muted">Share this link. Anyone who fills the form from your link will be connected to your account.</p>
      </div>

      <div className="sectionTitle">Your Leads</div>
      <div className="card tablewrap"><table className="table"><thead><tr><th>Lead Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Date</th></tr></thead><tbody>
        {leads.map((lead) => <tr key={lead.lead_id}><td>{lead.lead_name}</td><td>{lead.email_masked}</td><td>{lead.phone_masked}</td><td>{lead.lead_status}</td><td>{new Date(lead.registered_at).toLocaleString()}</td></tr>)}
        {!leads.length && <tr><td colSpan="5">No leads yet. Share your affiliate link to get your first lead.</td></tr>}
      </tbody></table></div>
    </main>
  )
}
