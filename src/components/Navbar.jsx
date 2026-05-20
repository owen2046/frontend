import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, openAuth } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setUserMenuOpen(false); setMobileOpen(false) }, [location.pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/partners', label: 'Partners' },
    { to: '/properties', label: 'Properties' },
    { to: '/insights', label: 'Insights' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4vw', height: scrolled ? '60px' : '72px',
        background: scrolled ? 'rgba(250,248,244,0.99)' : 'rgba(250,248,244,0.95)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,148,106,0.2)',
        transition: 'all 0.3s ease',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={logo} alt="Estates 61" style={{ height: '38px', width: 'auto' }} />
        </Link>

        {/* Desktop nav links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '36px', listStyle: 'none', margin: 0, padding: 0 }} className="nav-desktop-links">
          {links.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}
                style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: location.pathname === link.to ? '#1C1C1E' : '#3A3A3C', transition: 'color 0.3s', position: 'relative', paddingBottom: '4px' }}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="nav-desktop-links">
          {user ? (
            <>
              <Link to="/saved" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: location.pathname === '/saved' ? '#B8946A' : 'transparent', border: '1px solid ' + (location.pathname === '/saved' ? '#B8946A' : 'rgba(184,148,106,0.4)'), borderRadius: '2px', color: location.pathname === '/saved' ? '#fff' : '#B8946A', fontSize: '0.75rem', letterSpacing: '0.08em', textDecoration: 'none', transition: 'all 0.3s' }}>
                <span>♥</span><span style={{ textTransform: 'uppercase' }}>Saved</span>
              </Link>

              {/* User menu — uses ref instead of overlay so clicks inside work */}
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button onClick={() => setUserMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#0D2340', border: 'none', borderRadius: '2px', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#B8946A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  <span>{user.name?.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>{userMenuOpen ? '▲' : '▼'}</span>
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#FDFBF8', border: '1px solid #EDE5DB', borderRadius: '10px', boxShadow: '0 8px 32px rgba(13,35,64,0.12)', minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #EDE5DB', background: '#FAF8F4' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1C1C1E' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#8A7E72', marginTop: 2 }}>{user.email}</div>
                    </div>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#B91C1C', fontSize: '0.83rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      → Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => openAuth('signin')} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid rgba(184,148,106,0.5)', borderRadius: '2px', color: '#B8946A', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,148,106,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Sign In
              </button>
              <button onClick={() => openAuth('signup')} style={{ padding: '10px 24px', background: '#0D2340', color: '#fff', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '2px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#B8946A'}
                onMouseLeave={e => e.currentTarget.style.background = '#0D2340'}>
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="nav-hamburger"
          style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer' }}>
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#1C1C1E', transition: 'all 0.3s', transform: mobileOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#1C1C1E', transition: 'all 0.3s', opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#1C1C1E', transition: 'all 0.3s', transform: mobileOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#FAF8F4', zIndex: 99, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '28px' }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 300, color: '#1C1C1E', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#B8946A'}
              onMouseLeave={e => e.target.style.color = '#1C1C1E'}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/saved" onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#B8946A', textDecoration: 'none' }}>♥ Saved</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { setMobileOpen(false); openAuth('signin') }} style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#B8946A', background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => { setMobileOpen(false); openAuth('signup') }} style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#0D2340', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Up</button>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:1px; background:#B8946A; transform:scaleX(0); transition:transform 0.3s; }
        .nav-link:hover::after, .nav-link.active::after { transform:scaleX(1); }
        @media (max-width: 768px) { .nav-desktop-links { display: none !important; } .nav-hamburger { display: flex !important; } }
      `}</style>
    </>
  )
}