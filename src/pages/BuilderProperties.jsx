import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBuilder, getProperties } from '../api/client'
import Seo from '../components/Seo'

export default function BuilderProperties() {
  const { builderId } = useParams()
  const [builder, setBuilder] = useState(null)
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const progressRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getBuilder(builderId),
      getProperties({ builderId, limit: 200 }),
    ])
      .then(([builderRes, propertiesRes]) => {
        if (cancelled) return
        setBuilder(builderRes.item || null)
        setProps(propertiesRes.items || [])
      })
      .catch(() => {
        if (!cancelled) {
          setBuilder(null)
          setProps([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [builderId])

  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease'
      document.body.style.opacity = '1'
    }, 50)
    return () => clearTimeout(t)
  }, [builderId])

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
  }, [selectedType, selectedStatus])

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '12px' }}>Loading...</div>
      </div>
    )
  }

  if (!builder) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏗️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '12px' }}>Builder not found</div>
        <Link to="/partners" style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back to Partners</Link>
      </div>
    )
  }

  const filtered = props.filter(p => {
    const matchType = selectedType === 'all' || p.type.toLowerCase() === selectedType
    const matchStatus = selectedStatus === 'all' || p.status.toLowerCase().replace(/ /g, '-') === selectedStatus
    return matchType && matchStatus
  })

  const tagColor = (tag) => {
    if (tag === 'Ready to Move') return { background: '#0D2340', color: '#fff' }
    if (tag === 'Pre-Launch') return { background: '#B8946A', color: '#fff' }
    if (tag === 'Ultra Luxury' || tag === 'Luxury') return { background: '#7A5C3A', color: '#fff' }
    return { background: '#1C1C1E', color: '#fff' }
  }

  const readyCount = props.filter(p => p.status === 'Ready to Move').length
  const ongoingCount = props.filter(p => p.status === 'Ongoing').length
  const prelaunchCount = props.filter(p => p.status === 'Pre-Launch').length

  return (
    <>
      <Seo
        title={`${builder.name} Properties`}
        description={`Explore verified ${builder.name} projects, apartments, villas, plots, pricing, possession status, and property details with Estates61.`}
        keywords={`${builder.name} properties, ${builder.name} Chennai, builder projects Chennai, apartments for sale, verified properties`}
        path={`/partners/${builderId}`}
      />
      <div className="scroll-progress" ref={progressRef} />

      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '420px', overflow: 'hidden',
        marginTop: '72px', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '0 4vw 56px',
        background: 'var(--navy)'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(184,148,106,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(184,148,106,0.06) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--gold)' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb" style={{ marginBottom: '28px' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <span className="breadcrumb-sep">›</span>
            <Link to="/partners" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Partners</Link>
            <span className="breadcrumb-sep">›</span>
            <span>{builder.name}</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', background: 'rgba(184,148,106,0.15)',
            border: '1px solid rgba(184,148,106,0.4)', borderRadius: '100px',
            fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--gold-light)', marginBottom: '20px'
          }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%', display: 'inline-block' }} />
            {builder.badge} · {builder.since}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,5.5vw,5rem)',
            fontWeight: 300, color: '#fff', lineHeight: 1.05,
            marginBottom: '16px', letterSpacing: '-0.01em'
          }}>
            {builder.name}<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Properties</em>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem',
            fontWeight: 300, maxWidth: '480px', lineHeight: 1.75, marginBottom: '36px'
          }}>
            Explore all {props.length} verified {builder.name} projects listed exclusively through Estates61.
          </p>

          <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
            {[
              { num: props.length, label: 'Total Projects' },
              { num: ongoingCount, label: 'Ongoing' },
              { num: readyCount, label: 'Ready to Move' },
              { num: prelaunchCount, label: 'Pre-Launch' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px 32px', borderRight: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 300, color: 'var(--gold-light)', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div style={{
        background: 'var(--white)', padding: '20px 4vw',
        borderBottom: '1px solid var(--beige)',
        display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
        position: 'sticky', top: '72px', zIndex: 50
      }}>
        <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginRight: '4px' }}>Filter</span>

        {[['all', 'All'], ['apartment', 'Apartments'], ['villa', 'Villas'], ['plot', 'Plots']].map(([val, label]) => (
          <button key={val} onClick={() => setSelectedType(val)} style={{
            padding: '8px 18px', borderRadius: '2px', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            border: '1px solid ' + (selectedType === val ? 'var(--navy)' : 'var(--beige-mid)'),
            background: selectedType === val ? 'var(--navy)' : 'transparent',
            color: selectedType === val ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.25s'
          }}>{label}</button>
        ))}

        <div style={{ width: '1px', height: '24px', background: 'var(--beige-mid)', margin: '0 4px' }} />

        {[['all', 'All Status'], ['ongoing', 'Ongoing'], ['ready-to-move', 'Ready'], ['pre-launch', 'Pre-Launch']].map(([val, label]) => (
          <button key={val} onClick={() => setSelectedStatus(val)} style={{
            padding: '8px 18px', borderRadius: '2px', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            border: '1px solid ' + (selectedStatus === val ? 'var(--gold)' : 'var(--beige-mid)'),
            background: selectedStatus === val ? 'var(--gold)' : 'transparent',
            color: selectedStatus === val ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.25s'
          }}>{label}</button>
        ))}

        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {/* PROPERTIES GRID */}
      <div style={{ background: 'var(--beige-light)', padding: '48px 4vw 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--charcoal)', marginBottom: '8px' }}>No projects found</div>
            <p style={{ fontSize: '0.9rem' }}>Try changing the filters above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filtered.map((p) => (
              <Link to={`/properties/${p.id}`} key={p.id} className="reveal" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="prop-card" style={{ height: '100%' }}>
                  <div className="prop-img">
                    <img src={p.img} alt={p.name} loading="lazy" />
                    <span className="prop-tag" style={{ ...tagColor(p.tag), position: 'absolute', top: 14, left: 14 }}>
                      {p.tag}
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
                      <span style={{ color: p.status === 'Ready to Move' ? '#2d7a2d' : 'var(--text-muted)' }}>{p.status}</span>
                    </div>
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        <span>{p.soldUnits} units sold</span>
                        <span>{Math.round(p.soldUnits / p.totalUnits * 100)}% booked</span>
                      </div>
                      <div style={{ height: '3px', background: 'var(--beige-mid)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', borderRadius: '2px', background: 'var(--gold)', width: `${Math.round(p.soldUnits / p.totalUnits * 100)}%` }} />
                      </div>
                    </div>
                    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                        Possession: <strong style={{ color: 'var(--charcoal)' }}>{p.possession}</strong>
                      </span>
                      <span style={{ padding: '7px 18px', background: 'var(--charcoal)', color: '#fff', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '2px' }}>
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* BACK TO PARTNERS */}
      <div style={{ background: 'var(--navy)', padding: '40px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', marginBottom: '6px' }}>
            Interested in {builder.name} properties?
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>Our advisors will guide you through every step — free of charge.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ padding: '13px 28px', background: 'var(--gold)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '2px', textDecoration: 'none' }}>
            Talk to an Advisor
          </Link>
          <Link to="/partners" style={{ padding: '13px 28px', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '2px', textDecoration: 'none' }}>
            ← All Partners
          </Link>
        </div>
      </div>
    </>
  )
}
