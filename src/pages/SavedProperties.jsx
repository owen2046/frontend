import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { getSavedProperties, toggleSaved } from '../api/client'
import Seo from '../components/Seo'


export default function SavedProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const progressRef = useRef(null)
  const { user, openAuth } = useAuth()

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }

    getSavedProperties(user.id, user.token)
      .then(res => setProperties(res.items || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [user?.id, user?.token])

  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease'
      document.body.style.opacity = '1'
    }, 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (progressRef.current)
        progressRef.current.style.width = (window.scrollY / total * 100).toFixed(1) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (properties.length === 0) return
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [properties])

  async function handleUnsave(propertyId) {
    if (!user?.id) { openAuth('signin'); return }
    await toggleSaved(user.id, propertyId, user.token)
    setProperties(prev => prev.filter(p => p.id !== propertyId))
  }

  const tagColor = (tag) => {
    if (tag === 'Ready to Move') return { background: '#0D2340', color: '#fff' }
    if (tag === 'Pre-Launch') return { background: '#B8946A', color: '#fff' }
    if (tag === 'Ultra Luxury' || tag === 'Luxury') return { background: '#7A5C3A', color: '#fff' }
    return { background: '#1C1C1E', color: '#fff' }
  }

  // ── Not logged in ──
  if (!loading && !user) {
    return (
      <>
        <div className="scroll-progress" ref={progressRef} />
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--cream)', padding: '120px 4vw 80px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--beige)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem', marginBottom: '28px',
          }}>♡</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)',
            fontWeight: 300, color: 'var(--charcoal)', marginBottom: '16px',
          }}>Your Wishlist is Waiting</h1>
          <p style={{
            color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.8,
            fontSize: '0.95rem', marginBottom: '36px',
          }}>
            Sign in to save properties you love and access them here anytime.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => openAuth('signin')} style={{ padding: '13px 36px', background: 'var(--navy)', color: '#fff', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign In</button>
            <button onClick={() => openAuth('signup')} style={{ padding: '13px 36px', background: 'var(--gold)', color: '#fff', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Create Account</button>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
        {/* ADD THIS */}
        <Seo
          title="Saved Properties"
          description="View and manage your saved properties on Estates61 — bookmarked apartments, villas, and builder projects in Chennai."
          keywords="saved properties, bookmarked listings, Chennai real estate, Estates61"
          path="/saved"
        />
    
        <div className="scroll-progress" ref={progressRef} />
       

      {/* HERO */}
      <section style={{
        position: 'relative', height: '320px', overflow: 'hidden',
        marginTop: '72px', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '0 4vw 48px',
        background: 'var(--navy)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0D2340 0%, #1A3A5C 60%, #0D2340 100%)',
        }} />
        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(45deg, #B8946A 0, #B8946A 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb" style={{ marginBottom: '12px' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <span className="breadcrumb-sep" style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Saved</span>
          </div>
          <div style={{
            display: 'inline-block', padding: '4px 14px',
            border: '1px solid rgba(184,148,106,0.4)', borderRadius: '2px',
            color: 'var(--gold)', fontSize: '0.68rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: '14px',
          }}>My Wishlist</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.5vw,3.5rem)',
            fontWeight: 300, color: '#fff', lineHeight: 1.05, marginBottom: '10px',
          }}>
            {user?.name ? (
              <>{user.name.split(' ')[0]}'s <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Saved Properties</em></>
            ) : (
              <>Your <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Saved Properties</em></>
            )}
          </h1>
          {!loading && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', letterSpacing: '0.06em' }}>
              {properties.length === 0
                ? 'No properties saved yet'
                : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} saved`}
            </p>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <div style={{ background: 'var(--beige-light)', minHeight: '60vh', padding: '48px 4vw 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem' }}>Loading your saved properties…</div>
          </div>
        ) : properties.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--beige)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', color: 'var(--text-muted)',
            }}>♡</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', fontWeight: 300 }}>
              Nothing saved yet
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.7 }}>
              Tap the ♡ Save button on any property page to add it here for easy comparison.
            </p>
            <Link to="/properties" style={{
              padding: '12px 32px', background: 'var(--charcoal)', color: '#fff',
              fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
              borderRadius: '2px', textDecoration: 'none', marginTop: '8px',
            }}>Browse Properties</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {properties.map((p, i) => (
              <div key={p.id} className="reveal"
                style={{ position: 'relative', animationDelay: `${i * 0.06}s` }}>
                {/* Remove button */}
                <button
                  onClick={() => handleUnsave(p.id)}
                  title="Remove from saved"
                  style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 10,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.95)', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1rem', color: '#B8946A',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#B8946A'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = '#B8946A' }}
                >♥</button>

                <Link to={`/properties/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="prop-card" style={{ height: '100%' }}>
                    <div className="prop-img">
                      <img src={p.img} alt={p.name} loading="lazy" />
                      {p.tag && (
                        <span className="prop-tag" style={{ ...tagColor(p.tag), position: 'absolute', top: 14, left: 14 }}>
                          {p.tag}
                        </span>
                      )}
                      <span style={{
                        position: 'absolute', top: 14, right: 52,
                        background: 'rgba(250,248,244,0.92)', color: 'var(--charcoal)',
                        fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: '2px', fontWeight: 600,
                        backdropFilter: 'blur(4px)',
                      }}>
                        {p.builder_name || p.builderName}
                      </span>
                    </div>
                    <div className="prop-body">
                      <div className="prop-type">{p.type}</div>
                      <div className="prop-name">{p.name}</div>
                      <div className="prop-loc">{p.location}</div>
                      <div className="prop-price">{p.price}</div>
                      <div className="prop-specs">
                        <span>{p.bhk}</span>
                        <span>{p.area}</span>
                        <span style={{ color: p.status === 'Ready to Move' ? '#2d7a2d' : 'var(--text-muted)' }}>
                          {p.status}
                        </span>
                      </div>
                      {/* Booking progress */}
                      {p.total_units > 0 && (
                        <div style={{ marginTop: '14px' }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '0.68rem', color: 'var(--text-muted)',
                            letterSpacing: '0.06em', marginBottom: '6px',
                          }}>
                            <span>{p.sold_units} units sold</span>
                            <span>{Math.round(p.sold_units / p.total_units * 100)}% booked</span>
                          </div>
                          <div style={{ height: '3px', background: 'var(--beige-mid)', borderRadius: '2px' }}>
                            <div style={{
                              height: '100%', borderRadius: '2px', background: 'var(--gold)',
                              width: `${Math.round(p.sold_units / p.total_units * 100)}%`,
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: '16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '9px 22px',
                          background: 'var(--charcoal)', color: '#fff',
                          fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                          borderRadius: '2px', fontFamily: 'var(--font-body)',
                        }}>
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
