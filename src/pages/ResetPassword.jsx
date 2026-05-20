import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new one.')
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      setDone(true)
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FAF8F4', padding: '40px 20px',
  }
  const cardStyle = {
    background: '#fff', border: '1px solid #EDE5DB', borderRadius: '12px',
    padding: '40px 36px', width: '100%', maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(13,35,64,0.08)',
  }

  if (done) return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, color: '#1C1C1E', marginBottom: 10 }}>
          Password Updated!
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#8A7E72', lineHeight: 1.75, marginBottom: 28 }}>
          Your password has been changed. You can now sign in with your new password.
        </p>
        <button onClick={() => navigate('/')} style={{ padding: '12px 32px', background: '#0D2340', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Go to Home →
        </button>
      </div>
    </div>
  )

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: '#1C1C1E', marginBottom: 6 }}>
          Set New Password
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#8A7E72', marginBottom: 28 }}>
          Choose a strong password for your account.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A7E72', marginBottom: 6 }}>
              New Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters" disabled={!token}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #D9CEC2', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-body)', background: token ? '#fff' : '#f5f5f5', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A7E72', marginBottom: 6 }}>
              Confirm Password
            </label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter new password" disabled={!token}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #D9CEC2', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-body)', background: token ? '#fff' : '#f5f5f5', boxSizing: 'border-box' }} />
          </div>
          {error && (
            <p style={{ color: '#B91C1C', fontSize: '0.82rem', marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', borderRadius: '6px' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading || !token}
            style={{ width: '100%', padding: '13px', background: token ? '#0D2340' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: token ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}>
            {loading ? 'Updating…' : 'Update Password →'}
          </button>
        </form>
      </div>
    </div>
  )
}