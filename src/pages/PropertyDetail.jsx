import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProperties, getProperty, toggleSaved, checkSaved, submitInquiry } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'
import FormNotice from '../components/FormNotice'

// ─── helpers ────────────────────────────────────────────────────
const statusStyle = (status) => ({
  background: status === 'Ready to Move' ? '#e8f5e9' : status === 'Pre-Launch' ? '#fff8e1' : '#e3f2fd',
  color:      status === 'Ready to Move' ? '#2d7a2d' : status === 'Pre-Launch' ? '#b8860b' : '#1565c0',
})

const TABS = ['Overview', 'Highlights', 'Floor Plan', 'Amenities', 'Location', 'About Builder']

const otpBtnStyle = {
  padding: '13px 28px', background: 'var(--gold)', color: '#fff', border: 'none',
  fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.1em',
  textTransform: 'uppercase', borderRadius: '2px', cursor: 'pointer',
  transition: 'all 0.3s', display: 'inline-block',
}

export default function PropertyDetail() {
  const { id } = useParams()
  const { user, openAuth } = useAuth()

  // ── state ──
  const [property, setProperty]     = useState(null)
  const [similarProps, setSimilarProps] = useState([])
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [activeImg, setActiveImg]   = useState(0)
  const [saved, setSaved]           = useState(false)
  const [activeTab, setActiveTab]   = useState('Overview')
  const [enquiryName, setEnquiryName]   = useState('')
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [notice, setNotice] = useState(null)

  // isVerified = user is logged in
  const isVerified = Boolean(user)
  const authName = user?.name || user?.email

  // ── refs ──
  const progressRef  = useRef(null)
  const gateRef      = useRef(null)   // sits after amenities
  const tabBarRef    = useRef(null)
  const sectionRefs  = useRef({})     // keyed by tab name

  // ── load property ──
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getProperty(id)
      .then(async (res) => {
        if (cancelled) return
        const found = res.item
        setProperty(found || null)
        setNotFound(!found)
        setActiveImg(0); setSaved(false)

        // Check if this property is saved in DB
        if (user?.id && found?.id) {
          checkSaved(user.id, found.id, user.token).then(r => { if (!cancelled) setSaved(r.saved) }).catch(() => {})
        }

        if (found?.builderId) {
          const related = await getProperties({ builderId: found.builderId, limit: 4 })
          if (!cancelled) {
            setSimilarProps((related.items || []).filter(p => p.id !== found.id).slice(0, 3))
          }
        } else {
          setSimilarProps([])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProperty(null)
          setNotFound(true)
          setSimilarProps([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, user?.id, user?.token])

  // ── fade in ──
  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease'
      document.body.style.opacity = '1'
    }, 50)
    return () => clearTimeout(t)
  }, [])

  // ── scroll: progress bar + active tab + gate trigger ──
  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (progressRef.current)
        progressRef.current.style.width = (window.scrollY / total * 100).toFixed(1) + '%'

      // update active tab based on visible section
      const VH = window.innerHeight
      for (const [name, ref] of Object.entries(sectionRefs.current)) {
        if (!ref) continue
        const rect = ref.getBoundingClientRect()
        if (rect.top <= VH * 0.35 && rect.bottom > VH * 0.25) {
          setActiveTab(name)
          break
        }
      }

      // gate trigger — after amenities: redirect to signin
      if (!isVerified && gateRef.current) {
        const top = gateRef.current.getBoundingClientRect().top
        if (top < VH * 0.6) {
          openAuth('signin')
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isVerified, openAuth])

  // ── auth handlers ──
  async function handleSave() {
    if (!user) {
      openAuth('signin')
      return
    }
    const res = await toggleSaved(user.id, id, user.token)
    setSaved(res.saved)
  }

  async function handlePropertyEnquiry() {
    if (!enquiryName.trim() || !enquiryPhone.trim()) {
      setNotice({ type: 'error', message: 'Please enter your name and phone number.' })
      setTimeout(() => setNotice(null), 5000)
      return
    }
    try {
      await submitInquiry({
        name: enquiryName,
        phone: enquiryPhone,
        propertyId: property?.id || id,
        propertyName: property?.name,
        interest: 'Property callback',
        source: 'property-detail-sidebar',
        pagePath: window.location.pathname,
        requestType: 'Request callback',
      })
      setEnquiryName('')
      setEnquiryPhone('')
      setNotice({ type: 'success', message: 'Thank you. Our team will contact you within 30 minutes.' })
    } catch {
      setNotice({ type: 'error', message: 'Sorry, we could not submit your enquiry right now. Please try again in a moment.' })
    } finally {
      setTimeout(() => setNotice(null), 5000)
    }
  }

  // ── tab scroll ──
  function scrollToSection(tab) {
    const ref = sectionRefs.current[tab]
    if (!ref) return
    const y = ref.getBoundingClientRect().top + window.scrollY - 128
    window.scrollTo({ top: y, behavior: 'smooth' })
    setActiveTab(tab)
  }

  // ── guard states ──
  if (loading) return (
    <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '12px' }}>Loading…</div>
    </div>
  )
  if (notFound || !property) return (
    <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏗️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '12px' }}>Property not found</div>
      <Link to="/properties" style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back to Properties</Link>
    </div>
  )

  const bookedPct = Math.round(property.soldUnits / property.totalUnits * 100)

  return (
    <>
      <Seo
        title={`${property.name} in ${property.location || 'Chennai'}`}
        description={`${property.name} by ${property.builderName || property.builder_name || 'trusted builders'}: ${property.bhk || 'homes'} in ${property.location || 'Chennai'} with pricing, amenities, floor plan, and callback support from Estates61.`}
        keywords={`${property.name}, ${property.location}, ${property.builderName || property.builder_name || ''}, Chennai property, apartment for sale, villa for sale, RERA property`}
        path={`/properties/${property.id}`}
      />
      <div className="scroll-progress" ref={progressRef} />

      {/* ══ BREADCRUMB ══════════════════════════════════════════════ */}
      <div style={{ marginTop: '72px', padding: '14px 4vw', background: 'var(--white)', borderBottom: '1px solid var(--beige)' }}>
        <div className="breadcrumb">
          <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/properties" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Properties</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to={`/partners/${property.builderId}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{property.builderName}</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{property.name}</span>
        </div>
      </div>

      {/* ══ GALLERY ════════════════════════════════════════════════ */}
      <div style={{ background: 'var(--charcoal)', padding: '0 0 4px' }}>
        {/* Main image */}
        <div style={{ position: 'relative', height: 'clamp(300px,52vh,520px)', overflow: 'hidden' }}>
          <img
            src={property.images[activeImg]}
            alt={property.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.35s ease' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />

          {/* Tag */}
          <span style={{ position: 'absolute', top: 18, left: '4vw', background: 'var(--gold)', color: '#fff', padding: '5px 14px', borderRadius: '2px', fontSize: '0.67rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {property.tag}
          </span>

          {/* Top-right actions */}
          <div style={{ position: 'absolute', top: 16, right: '4vw', display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ background: saved ? 'var(--gold)' : 'rgba(255,255,255,0.15)', border: '1px solid ' + (saved ? 'var(--gold)' : 'rgba(255,255,255,0.4)'), backdropFilter: 'blur(8px)', color: '#fff', padding: '7px 16px', borderRadius: '2px', fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
          </div>

          {/* Counter */}
          <div style={{ position: 'absolute', bottom: 16, right: '4vw', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
            {activeImg + 1} / {property.images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div style={{ display: 'flex', gap: 4, padding: '4px 4px 0', background: 'var(--charcoal)' }}>
          {property.images.map((img, i) => (
            <div key={i} onClick={() => setActiveImg(i)} style={{ flex: 1, height: 68, overflow: 'hidden', cursor: 'pointer', opacity: activeImg === i ? 1 : 0.45, outline: activeImg === i ? '2px solid var(--gold)' : 'none', outlineOffset: '-2px', transition: 'opacity 0.25s' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ TWO-COLUMN LAYOUT ══════════════════════════════════════ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4vw', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 32, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* PROPERTY TITLE BLOCK */}
          <div style={{ padding: '28px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.67rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>{property.builderName}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--beige-mid)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.67rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{property.type}</span>
              <span style={{ ...statusStyle(property.status), padding: '3px 10px', borderRadius: '2px', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                {property.status}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,3vw,2.6rem)', fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1.1, marginBottom: 8 }}>
              {property.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>📍</span>{property.location}
            </div>

            {/* Price + key stats strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '1px solid var(--beige)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 24 }}>
              {[
                { label: 'Price', value: property.price, accent: true },
                { label: 'Configuration', value: property.bhk },
                { label: 'Area', value: property.area },
                { label: 'Possession', value: property.possession },
              ].map((s, i) => (
                <div key={i} style={{ flex: '1 1 120px', padding: '14px 18px', background: s.accent ? 'var(--navy)' : 'var(--white)', borderRight: i < 3 ? '1px solid var(--beige)' : 'none' }}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: s.accent ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: s.accent ? '1.35rem' : '1rem', fontWeight: 500, color: s.accent ? '#fff' : 'var(--charcoal)', lineHeight: 1.1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Booking progress */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span><strong style={{ color: bookedPct > 80 ? '#c0392b' : 'var(--navy)' }}>{bookedPct}%</strong> Units Booked</span>
                <span>{property.totalUnits - property.soldUnits} remaining of {property.totalUnits}</span>
              </div>
              <div style={{ height: 5, background: 'var(--beige-mid)', borderRadius: 3 }}>
                <div style={{ height: '100%', borderRadius: 3, background: bookedPct > 80 ? '#c0392b' : 'var(--gold)', width: bookedPct + '%', transition: 'width 1.2s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, paddingBottom: 20, borderBottom: '1px solid var(--beige)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--beige-light)', borderRadius: '2px', fontSize: '0.72rem', color: 'var(--charcoal-mid)' }}>
                ✓ RERA: {property.rera}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--beige-light)', borderRadius: '2px', fontSize: '0.72rem', color: 'var(--charcoal-mid)' }}>
                🏠 {property.totalUnits} Total Units
              </div>
            </div>
          </div>

          {/* ── STICKY TAB NAV ── */}
          <div ref={tabBarRef} style={{ position: 'sticky', top: 72, zIndex: 40, background: 'var(--white)', borderBottom: '1px solid var(--beige)', marginLeft: '-4vw', marginRight: 0, paddingLeft: '4vw', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => scrollToSection(tab)} style={{ padding: '14px 18px', fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderBottom: `2px solid ${activeTab === tab ? 'var(--gold)' : 'transparent'}`, background: 'none', color: activeTab === tab ? 'var(--navy)' : 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeTab === tab ? 500 : 400, transition: 'all 0.2s' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* ══ OVERVIEW ══════════════════════════════════════════ */}
          <section ref={el => sectionRefs.current['Overview'] = el} style={{ padding: '40px 0 32px' }}>
            <p className="section-label">About This Project</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 16 }}>
              Project <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Overview</em>
            </h2>
            <p style={{ fontSize: '0.97rem', color: 'var(--text-muted)', lineHeight: 1.85, fontWeight: 300, maxWidth: 680 }}>{property.desc}</p>

            {/* Overview table — like Housing.com */}
            <div style={{ marginTop: 28, border: '1px solid var(--beige)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {[
                ['Project Units',    property.totalUnits],
                ['Sizes',            property.area],
                ['Avg. Price',       property.price],
                ['Possession',       property.possession],
                ['Configuration',    property.bhk + ' · ' + property.type],
                ['RERA ID',          property.rera],
                ['Status',           property.status],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', borderBottom: i < 6 ? '1px solid var(--beige)' : 'none', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                  <div style={{ padding: '11px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 400 }}>{label}</div>
                  <div style={{ padding: '11px 16px', fontSize: '0.85rem', color: 'var(--charcoal)', fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ HIGHLIGHTS ════════════════════════════════════════ */}
          <section ref={el => sectionRefs.current['Highlights'] = el} style={{ padding: '32px 0', borderTop: '1px solid var(--beige)' }}>
            <p className="section-label">Why This Project</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 20 }}>
              Key <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Highlights</em>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
              {property.nearby.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '1px solid var(--beige)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--navy)', color: 'var(--gold-light)', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--charcoal)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FREE CONTENT ENDS — GATE AFTER AMENITIES ══════════ */}

          {/* ══ AMENITIES (FREE) ══════════════════════════════════ */}
          <section ref={el => sectionRefs.current['Amenities'] = el} style={{ padding: '32px 0', borderTop: '1px solid var(--beige)' }}>
            <p className="section-label">What's Inside</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 20 }}>
              Amenities & <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Features</em>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {property.amenities.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 100, fontSize: '0.8rem', color: 'var(--charcoal-mid)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                  {a}
                </div>
              ))}
            </div>
          </section>

          {/* ── GATE TRIGGER DIV ── sits here, right after amenities */}
          <div ref={gateRef} />

          {/* ══ GATED: FLOOR PLAN ═════════════════════════════════ */}
          {!isVerified ? (
            /* blurred teaser */
            <div style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--beige)', minHeight: 280 }}>
              <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.28, padding: '32px 0' }}>
                <div style={{ height: 20, background: 'var(--beige)', borderRadius: 4, width: '25%', marginBottom: 16 }} />
                <div style={{ height: 200, background: 'var(--beige-light)', borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 44, background: 'var(--beige-light)', borderRadius: 'var(--radius)' }} />)}
                </div>
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(250,248,244,0.96) 55%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 28 }}>
                <div style={{ textAlign: 'center', background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 'var(--radius)', padding: '18px 28px', maxWidth: 360 }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🔒</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--charcoal)', marginBottom: 4 }}>Floor plan, brochure & location details</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>Create a quick account to unlock this project.</p>
                  <button onClick={() => openAuth('signin')} style={{ ...otpBtnStyle, padding: '9px 24px' }}>
                    Sign In to View →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ══ FLOOR PLAN (unlocked) ══ */}
              <section ref={el => sectionRefs.current['Floor Plan'] = el} style={{ padding: '32px 0', borderTop: '1px solid var(--beige)' }}>
                <p className="section-label">Unit Layout</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 20 }}>
                  Floor <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Plan</em>
                </h2>
                {property.floorPlanUrl ? (
                  <div style={{ background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <img src={property.floorPlanUrl} alt={`${property.name} floor plan`} style={{ width: '100%', display: 'block', objectFit: 'contain', background: 'var(--cream)', maxHeight: 620 }} />
                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signed in as {authName || 'member'}. Floor plan unlocked.</p>
                      <a href={property.floorPlanUrl} target="_blank" rel="noreferrer" style={{ ...otpBtnStyle, padding: '10px 20px', textDecoration: 'none' }}>Open Plan</a>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--cream)', border: '2px dashed var(--beige-mid)', borderRadius: 'var(--radius-lg)', padding: '52px 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📐</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--charcoal)', marginBottom: 8 }}>Dummy Floor Plan Available</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
                      This is the test unlocked state. Add a floor plan URL in admin to show the real plan here.
                    </p>
                    <div style={{ maxWidth: 520, margin: '0 auto', aspectRatio: '4 / 3', background: '#fff', border: '1px solid var(--beige)', borderRadius: 'var(--radius)', padding: 18, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10 }}>
                      {['Living / Dining', 'Bedroom', 'Kitchen', 'Balcony'].map(label => (
                        <div key={label} style={{ border: '2px solid var(--navy)', borderRadius: 3, display: 'grid', placeItems: 'center', color: 'var(--navy)', fontSize: '0.78rem', background: 'rgba(184,148,106,0.08)' }}>{label}</div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* ══ LOCATION ══ */}
              <section ref={el => sectionRefs.current['Location'] = el} style={{ padding: '32px 0', borderTop: '1px solid var(--beige)' }}>
                <p className="section-label">Location</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 20 }}>
                  What's <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Nearby</em>
                </h2>

                {/* Map placeholder */}
                <div style={{ height: 200, background: 'var(--beige-light)', borderRadius: 'var(--radius-lg)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--beige)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(var(--beige-mid) 1px,transparent 1px),linear-gradient(90deg,var(--beige-mid) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
                  <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📍</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--charcoal)', marginBottom: 4 }}>{property.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{property.location}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
                  {property.nearby.map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 'var(--radius)' }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>📍</span>
                      <span style={{ fontSize: '0.83rem', color: 'var(--charcoal)' }}>{n}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ══ ABOUT BUILDER ═════════════════════════════════════ */}
          <section ref={el => sectionRefs.current['About Builder'] = el} style={{ padding: '32px 0', borderTop: '1px solid var(--beige)' }}>
            <p className="section-label">Developer</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 20 }}>
              About <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>{property.builderName}</em>
            </h2>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 'var(--radius-lg)', padding: '24px', flexWrap: 'wrap' }}>
              {/* Logo placeholder */}
              <div style={{ width: 60, height: 60, background: 'var(--navy)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-light)', fontWeight: 500, flexShrink: 0 }}>
                {property.builderName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: 2 }}>{property.builderName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>Verified Builder · Chennai</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--charcoal-mid)', lineHeight: 1.75, fontWeight: 300, marginBottom: 16 }}>
                  One of Chennai's most trusted residential developers with a strong track record of on-time delivery and quality construction.
                </p>
                <Link to={`/partners/${property.builderId}`} style={{ color: 'var(--gold)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  View All Projects →
                </Link>
              </div>
            </div>
          </section>

          {/* ══ SIMILAR PROJECTS ══════════════════════════════════ */}
          {similarProps.length > 0 && (
            <section style={{ padding: '32px 0 48px', borderTop: '1px solid var(--beige)' }}>
              <p className="section-label">More from {property.builderName}</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: 20 }}>
                Similar <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Projects</em>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                {similarProps.map(p => (
                  <Link key={p.id} to={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div className="prop-card">
                      <div className="prop-img" style={{ height: 150 }}>
                        <img src={p.img} alt={p.name} loading="lazy" />
                        <span className="prop-tag">{p.tag}</span>
                      </div>
                      <div className="prop-body" style={{ padding: '14px 16px' }}>
                        <div className="prop-type">{p.type}</div>
                        <div className="prop-name" style={{ fontSize: '1rem' }}>{p.name}</div>
                        <div className="prop-loc">{p.location}</div>
                        <div className="prop-price" style={{ fontSize: '1.15rem', marginBottom: 0 }}>{p.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={{ position: 'sticky', top: 112, paddingTop: 24 }}>

          {/* ENQUIRY CARD */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16, boxShadow: '0 4px 24px rgba(13,35,64,0.07)' }}>
            <div style={{ background: 'var(--navy)', padding: '18px 22px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 400, color: '#fff', marginBottom: 4 }}>Book a Consultation</div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>Free, no-obligation — we'll call you within 30 min</p>
            </div>
            <div style={{ padding: '18px 22px' }}>
              {[
                { label: 'Your Name', value: enquiryName, setter: setEnquiryName, type: 'text', placeholder: 'Full name' },
                { label: 'Mobile Number', value: enquiryPhone, setter: setEnquiryPhone, type: 'tel', placeholder: '+91 00000 00000' },
              ].map(({ label, value, setter, type, placeholder }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>{label}</div>
                  <input
                    type={type} value={value} onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '10px 13px', border: '1px solid var(--beige-mid)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--charcoal)', background: 'var(--cream)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.25s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--beige-mid)'}
                  />
                </div>
              ))}
              <button
                onClick={handlePropertyEnquiry}
                style={{ ...otpBtnStyle, width: '100%', marginBottom: 8, padding: '12px' }}
              >
                Request Callback →
              </button>
              <button
                style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid var(--beige-mid)', borderRadius: '2px', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-mid)', cursor: 'pointer', transition: 'border-color 0.25s' }}
                onClick={() => window.open('tel:07969061234')}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--charcoal)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--beige-mid)'}
              >
                📞 Call: 079 6906 1234
              </button>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--beige)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', background: 'var(--beige-light)', borderRadius: 'var(--radius)' }}>
                  <div style={{ width: 28, height: 28, background: 'var(--navy)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--gold-light)', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 1 }}>RERA Registered</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--charcoal)' }}>{property.rera}</div>
                  </div>
                </div>
              </div>

              <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: saved ? 'var(--gold)' : 'transparent', border: '1px solid ' + (saved ? 'var(--gold)' : 'var(--beige-mid)'), borderRadius: '2px', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: saved ? '#fff' : 'var(--charcoal-mid)', cursor: 'pointer', transition: 'all 0.3s', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
              </button>
            </div>
          </div>

          {/* QUICK FACTS CARD */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--beige)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--beige)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)' }}>Quick Facts</span>
            </div>
            <div style={{ padding: '4px 0' }}>
              {[
                { icon: '📅', label: 'Possession', value: property.possession },
                { icon: '🏢', label: 'Total Units', value: property.totalUnits },
                { icon: '✅', label: 'Units Sold', value: property.soldUnits + ' (' + bookedPct + '%)' },
                { icon: '📐', label: 'Area Range', value: property.area },
                { icon: '🏷️', label: 'Type', value: property.type },
              ].map(({ icon, label, value }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: i < 4 ? '1px solid var(--beige-light)' : 'none' }}>
                  <span style={{ fontSize: '0.9rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 1 }}>{label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ══ BACK BAR ══════════════════════════════════════════════ */}
      <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--beige)', padding: '20px 4vw', display: 'flex', gap: 16 }}>
        <Link to="/properties" style={{ color: 'var(--gold)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>← All Properties</Link>
        <span style={{ color: 'var(--beige-mid)' }}>|</span>
        <Link to={`/partners/${property.builderId}`} style={{ color: 'var(--gold)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>← {property.builderName} Projects</Link>
      </div>


      <style>{`
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal  { from{transform:translateY(26px);opacity:0} to{transform:translateY(0);opacity:1} }
        @media(max-width:860px){
          .pd-two-col { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
      <FormNotice notice={notice} />
    </>
  )
}
