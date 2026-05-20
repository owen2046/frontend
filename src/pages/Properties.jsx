import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getProperties, getBuilders } from '../api/client'
import Seo from '../components/Seo'

export default function Properties() {
  const [search, setSearch] = useState('')
  const [selectedBuilder, setSelectedBuilder] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [properties, setProperties] = useState([])
  const [builders, setBuilders] = useState([])
  const [loading, setLoading] = useState(true)
  const progressRef = useRef(null)

  // Fetch builders
  useEffect(() => {
    getBuilders().then(res => setBuilders(res.items || []))
  }, [])

  // Fetch properties with filters
  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (selectedBuilder !== 'all') params.builderId = selectedBuilder
    if (selectedType !== 'all') params.type = selectedType
    if (selectedStatus !== 'all') params.status = selectedStatus
    if (sortBy !== 'default') params.sortBy = sortBy

    getProperties(params)
      .then(res => setProperties(res.items || []))
      .finally(() => setLoading(false))
  }, [search, selectedBuilder, selectedType, selectedStatus, sortBy])

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
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [properties])

  const tagColor = (tag) => {
    if (tag === 'Ready to Move') return { background: '#0D2340', color: '#fff' }
    if (tag === 'Pre-Launch') return { background: '#B8946A', color: '#fff' }
    if (tag === 'Ultra Luxury' || tag === 'Luxury') return { background: '#7A5C3A', color: '#fff' }
    return { background: '#1C1C1E', color: '#fff' }
  }

  return (
    <>
      <Seo
        title="Properties for Sale in Chennai"
        description="Browse verified apartments, villas, plots, and builder projects for sale in Chennai with filters by location, builder, property type, budget, and possession status."
        keywords="properties for sale Chennai, apartments for sale Chennai, villas Chennai, plots Chennai, builder projects Chennai, RERA verified properties"
        path="/properties"
      />
      <div className="scroll-progress" ref={progressRef} />

      {/* HERO */}
      <section style={{
        position: 'relative', height: '380px', overflow: 'hidden',
        marginTop: '72px', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '0 4vw 52px'
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80&auto=format"
            alt="Properties" loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(13,35,64,0.7) 0%,rgba(13,35,64,0.2) 60%,rgba(28,28,30,0.55) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb">
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Properties</span>
          </div>
          <div className="page-hero-tag">All Properties</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,5vw,4rem)',
            fontWeight: 300, color: '#fff', lineHeight: 1.05, marginBottom: '12px'
          }}>
            Find Your <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Perfect Property</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 300, maxWidth: '440px', lineHeight: 1.7 }}>
            Browse {properties.length}+ curated properties from Chennai's most trusted builders.
          </p>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <div style={{
        background: 'var(--white)', padding: '28px 4vw',
        borderBottom: '1px solid var(--beige)', position: 'sticky', top: '72px', zIndex: 50
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--cream)', border: '1px solid var(--beige-mid)',
          borderRadius: 'var(--radius)', padding: '0 16px', marginBottom: '18px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by builder, location, project name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--charcoal)',
              padding: '14px 0'
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1
            }}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={selectedBuilder} onChange={e => setSelectedBuilder(e.target.value)} style={filterSelectStyle}>
            <option value="all">All Builders</option>
            {builders.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={filterSelectStyle}>
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
          </select>

          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={filterSelectStyle}>
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="ready-to-move">Ready to Move</option>
            <option value="pre-launch">Pre-Launch</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={filterSelectStyle}>
            <option value="default">Sort By</option>
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {(search || selectedBuilder !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => { setSearch(''); setSelectedBuilder('all'); setSelectedType('all'); setSelectedStatus('all'); setSortBy('default') }}
              style={{
                padding: '9px 18px', background: 'transparent', border: '1px solid var(--beige-mid)',
                borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                color: 'var(--text-muted)', cursor: 'pointer', letterSpacing: '0.08em'
              }}
            >
              Clear Filters
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {loading ? 'Loading...' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
          </span>
        </div>
      </div>

      {/* PROPERTIES GRID */}
      <div style={{ background: 'var(--beige-light)', padding: '48px 4vw 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem' }}>Loading properties...</div>
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--charcoal)', marginBottom: '8px' }}>No properties found</div>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {properties.map((p, i) => (
              <Link to={`/properties/${p.id}`} key={p.id} className="reveal"
                style={{ textDecoration: 'none', display: 'block', animationDelay: `${i * 0.05}s` }}>
                <div className="prop-card" style={{ height: '100%' }}>
                  <div className="prop-img">
                    <img src={p.img} alt={p.name} loading="lazy" />
                    <span className="prop-tag" style={{ ...tagColor(p.tag), position: 'absolute', top: 14, left: 14 }}>
                      {p.tag}
                    </span>
                    <span style={{
                      position: 'absolute', top: 14, right: 14,
                      background: 'rgba(250,248,244,0.92)', color: 'var(--charcoal)',
                      fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '3px 10px', borderRadius: '2px', fontWeight: 600,
                      backdropFilter: 'blur(4px)'
                    }}>
                      {p.builder_name}
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
                    <div style={{ marginTop: '14px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '0.68rem', color: 'var(--text-muted)',
                        letterSpacing: '0.06em', marginBottom: '6px'
                      }}>
                        <span>{p.sold_units} units sold</span>
                        <span>{Math.round(p.sold_units / p.total_units * 100)}% booked</span>
                      </div>
                      <div style={{ height: '3px', background: 'var(--beige-mid)', borderRadius: '2px' }}>
                        <div style={{
                          height: '100%', borderRadius: '2px', background: 'var(--gold)',
                          width: `${Math.round(p.sold_units / p.total_units * 100)}%`,
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '9px 22px',
                        background: 'var(--charcoal)', color: '#fff',
                        fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        borderRadius: '2px', fontFamily: 'var(--font-body)'
                      }}>
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const filterSelectStyle = {
  padding: '9px 16px',
  border: '1px solid var(--beige-mid)',
  borderRadius: 'var(--radius)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.78rem',
  color: 'var(--charcoal)',
  background: 'var(--white)',
  outline: 'none',
  cursor: 'pointer',
  letterSpacing: '0.05em'
}
