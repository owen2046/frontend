import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createClient } from '@supabase/supabase-js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase client for password reset (uses anon key on frontend)
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

async function apiFetch(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

const inp = (focused) => ({
  width: '100%', padding: '12px 14px',
  border: `1px solid ${focused ? '#B8946A' : '#D9CEC2'}`,
  borderRadius: '6px', fontFamily: 'var(--font-body)',
  fontSize: '0.93rem', color: 'var(--charcoal)',
  background: '#FDFBF8', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
})

function InputField({ label, type = 'text', value, onChange, placeholder, autoFocus, prefix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.67rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8A7E72', marginBottom: 6 }}>
        {label}
      </label>
      {prefix ? (
        <div style={{ display: 'flex', border: `1px solid ${focused ? '#B8946A' : '#D9CEC2'}`, borderRadius: '6px', overflow: 'hidden', transition: 'border-color 0.2s', background: '#FDFBF8' }}>
          <span style={{ padding: '12px 12px', color: '#8A7E72', fontSize: '0.88rem', borderRight: '1px solid #D9CEC2', flexShrink: 0, whiteSpace: 'nowrap' }}>{prefix}</span>
          <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
            style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '0.93rem', color: 'var(--charcoal)' }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        </div>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          autoFocus={autoFocus} style={inp(focused)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      )}
    </div>
  )
}

function ErrorBox({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '9px 13px', marginBottom: 14, fontSize: '0.82rem', color: '#B91C1C' }}>
      {msg}
    </div>
  )
}

function SubmitBtn({ loading, label, loadingLabel }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '13px',
      background: loading ? '#C9BFB5' : '#0D2340',
      color: '#fff', border: 'none', borderRadius: '6px',
      fontFamily: 'var(--font-body)', fontSize: '0.8rem',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background 0.25s', marginTop: 4,
    }}
      onMouseEnter={e => { if (!loading) e.target.style.background = '#B8946A' }}
      onMouseLeave={e => { if (!loading) e.target.style.background = '#0D2340' }}
    >
      {loading ? loadingLabel : label}
    </button>
  )
}

// ─── SIGN IN VIEW ────────────────────────────────────────
function SignInView({ onSwitch, onSuccess, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/signin', { email: email.trim().toLowerCase(), password })
      login({ ...res.user, token: res.token })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputField label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
      <InputField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
      <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -6 }}>
        <button type="button" onClick={() => onSwitch('forgot')} style={{ background: 'none', border: 'none', color: '#B8946A', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}>
          Forgot password?
        </button>
      </div>
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading} label="Sign In →" loadingLabel="Signing in…" />
      <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.82rem', color: '#8A7E72' }}>
        Don't have an account?{' '}
        <button type="button" onClick={() => onSwitch('signup')} style={{ background: 'none', border: 'none', color: '#B8946A', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, padding: 0 }}>
          Sign Up
        </button>
      </p>
    </form>
  )
}

// ─── SIGN UP VIEW ────────────────────────────────────────
function SignUpView({ onSwitch, onSuccess, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    if (form.name.trim().length < 2) { setError('Please enter your full name'); return }
    if (form.phone.replace(/\D/g, '').length < 10) { setError('Enter a valid 10-digit phone number'); return }
    if (!form.email.includes('@')) { setError('Enter a valid email address'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/signup', {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ''),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      login({ ...res.user, token: res.token })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputField label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" autoFocus />
      <InputField label="Phone Number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" prefix="🇮🇳 +91" />
      <InputField label="Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
      <InputField label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" />
      <InputField label="Confirm Password" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Re-enter password" />
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading} label="Create Account →" loadingLabel="Creating account…" />
      <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.82rem', color: '#8A7E72' }}>
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('signin')} style={{ background: 'none', border: 'none', color: '#B8946A', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, padding: 0 }}>
          Sign In
        </button>
      </p>
    </form>
  )
}

// ─── FORGOT PASSWORD VIEW ────────────────────────────────
function ForgotView({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/forgot-password', { email: email.trim().toLowerCase() })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
      <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>📧</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 10 }}>Check your inbox</h3>
      <p style={{ fontSize: '0.85rem', color: '#8A7E72', lineHeight: 1.75, marginBottom: 20 }}>
        We've sent a reset link to <strong style={{ color: 'var(--charcoal)' }}>{email}</strong>.<br />
        Click the link in the email to set a new password.
      </p>
      <p style={{ fontSize: '0.76rem', color: '#B5A898', marginBottom: 22 }}>
        Didn't get it? Check spam or{' '}
        <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', color: '#B8946A', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.76rem', padding: 0 }}>try again</button>.
      </p>
      <button onClick={() => onSwitch('signin')} style={{ background: 'none', border: '1px solid #D9CEC2', borderRadius: '6px', padding: '9px 24px', color: 'var(--charcoal)', fontSize: '0.78rem', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        ← Back to Sign In
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: '0.85rem', color: '#8A7E72', lineHeight: 1.7, marginBottom: 18 }}>
        Enter your email and we'll send you a link to reset your password.
      </p>
      <InputField label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading} label="Send Reset Link →" loadingLabel="Sending…" />
      <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.82rem', color: '#8A7E72' }}>
        <button type="button" onClick={() => onSwitch('signin')} style={{ background: 'none', border: 'none', color: '#B8946A', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0 }}>
          ← Back to Sign In
        </button>
      </p>
    </form>
  )
}

// ─── RESET PASSWORD VIEW (after clicking email link) ─────
function ResetView({ onClose }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!supabase) { setError('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'); return }
    setLoading(true)
    try {
      // Supabase handles the session from the URL hash automatically
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw new Error(err.message)
      // Get updated user profile
      const { data: { user: sbUser } } = await supabase.auth.getUser()
      if (sbUser) {
        const profile = { id: sbUser.id, name: sbUser.user_metadata?.name || sbUser.email.split('@')[0], email: sbUser.email, phone: sbUser.user_metadata?.phone || '' }
        login(profile)
      }
      setDone(true)
      // Clean up URL hash
      window.history.replaceState(null, '', window.location.pathname)
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
      <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>✅</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 10 }}>Password Updated!</h3>
      <p style={{ fontSize: '0.85rem', color: '#8A7E72', lineHeight: 1.75, marginBottom: 24 }}>
        Your password has been changed successfully.<br />You are now signed in.
      </p>
      <button onClick={onClose} style={{ padding: '12px 32px', background: '#0D2340', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        Continue →
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: '0.85rem', color: '#8A7E72', lineHeight: 1.7, marginBottom: 18 }}>
        Enter your new password below.
      </p>
      <InputField label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoFocus />
      <InputField label="Confirm New Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter new password" />
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading} label="Update Password →" loadingLabel="Updating…" />
    </form>
  )
}

// ─── MAIN MODAL ──────────────────────────────────────────
const TITLES = {
  signin: 'Welcome Back',
  signup: 'Create Account',
  forgot: 'Reset Password',
  reset: 'Set New Password',
}

const SUBTITLES = {
  signin: 'Sign in to save properties and access exclusive details',
  signup: 'Join Estates61 to save and track your dream properties',
  forgot: "We'll email you a secure link to reset your password",
  reset: 'Choose a strong password for your account',
}

export default function AuthModal({ defaultView = 'signin', onClose, onSuccess }) {
  const [view, setView] = useState(defaultView)
  const overlayRef = useRef(null)

  useEffect(() => { setView(defaultView) }, [defaultView])

  // Close on Escape (but NOT for reset view — user must complete it)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && view !== 'reset') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, view])

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const isReset = view === 'reset'

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current && !isReset) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(13,35,64,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        animation: 'fadeOverlay 0.2s ease',
      }}
    >
      <div style={{
        background: '#FDFBF8', borderRadius: '16px',
        width: '100%', maxWidth: 420,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(13,35,64,0.22)',
        animation: 'slideUp 0.25s ease',
        position: 'relative',
      }}>
        {/* Close button — hidden for reset view */}
        {!isReset && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.06)', border: 'none',
            cursor: 'pointer', fontSize: '1rem', color: '#8A7E72',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
          >✕</button>
        )}

        {/* Header */}
        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid #EDE5DB', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: '#0D2340', marginBottom: 12 }}>
            Estates<span style={{ color: '#B8946A' }}>61</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', margin: '0 0 6px' }}>
            {TITLES[view]}
          </h2>
          <p style={{ fontSize: '0.83rem', color: '#8A7E72', margin: 0, lineHeight: 1.6 }}>
            {SUBTITLES[view]}
          </p>
        </div>

        {/* Sign In / Sign Up tabs */}
        {(view === 'signin' || view === 'signup') && (
          <div style={{ display: 'flex', margin: '0 32px 20px', border: '1px solid #EDE5DB', borderRadius: '8px', overflow: 'hidden' }}>
            {['signin', 'signup'].map(v => (
              <button key={v} type="button" onClick={() => setView(v)} style={{
                flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
                background: view === v ? '#0D2340' : 'transparent',
                color: view === v ? '#fff' : '#8A7E72',
                fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}>
                {v === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {/* Form area */}
        <div style={{ padding: '0 32px 28px' }}>
          {view === 'signin' && <SignInView onSwitch={setView} onSuccess={onSuccess} onClose={onClose} />}
          {view === 'signup' && <SignUpView onSwitch={setView} onSuccess={onSuccess} onClose={onClose} />}
          {view === 'forgot' && <ForgotView onSwitch={setView} />}
          {view === 'reset' && <ResetView onClose={onClose} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeOverlay { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
