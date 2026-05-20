import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getArticle, getArticles, submitInquiry } from '../api/client'
import Seo from '../components/Seo'
import FormNotice from '../components/FormNotice'

// ─── Body block renderer ────────────────────────────────────────
function renderBlock(block, i) {
  switch (block.type) {
    case 'lead':
      return (
        <p key={i} style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          lineHeight: 1.85,
          color: 'var(--charcoal)',
          fontWeight: 300,
          fontStyle: 'italic',
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--beige)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.01em',
        }}>
          {block.text}
        </p>
      )

    case 'heading':
      return (
        <h2 key={i} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)',
          fontWeight: 400,
          color: 'var(--charcoal)',
          marginTop: '2.5rem',
          marginBottom: '0.9rem',
          lineHeight: 1.2,
          position: 'relative',
          paddingLeft: '1.1rem',
        }}>
          <span style={{
            position: 'absolute',
            left: 0,
            top: '6px',
            bottom: '6px',
            width: '3px',
            background: 'var(--gold)',
            borderRadius: '2px',
          }} />
          {block.text}
        </h2>
      )

    case 'paragraph':
      return (
        <p key={i} style={{
          fontSize: '0.97rem',
          lineHeight: 1.85,
          color: 'var(--charcoal-mid)',
          marginBottom: '1.3rem',
          fontWeight: 300,
        }}>
          {block.text}
        </p>
      )

    case 'stats':
      return (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '1px',
          background: 'var(--beige-mid)',
          border: '1px solid var(--beige-mid)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          margin: '2rem 0',
        }}>
          {block.items.map((item, j) => (
            <div key={j} style={{
              background: 'var(--white)',
              padding: '1.1rem 0.8rem',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                fontWeight: 500,
                color: 'var(--navy)',
                lineHeight: 1,
                marginBottom: '0.3rem',
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                lineHeight: 1.3,
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )

    case 'callout':
      return (
        <div key={i} style={{
          background: 'var(--beige-light)',
          borderLeft: '3px solid var(--gold)',
          borderRadius: '0 var(--radius) var(--radius) 0',
          padding: '1.1rem 1.3rem',
          margin: '1.8rem 0',
          fontSize: '0.9rem',
          lineHeight: 1.75,
          color: 'var(--charcoal-mid)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-display)',
        }}>
          {block.text}
        </div>
      )

    default:
      return null
  }
}

// ─── Tag colour map (matches existing tagColor pattern in codebase) ──
const tagColors = {
  'Market Report': { bg: 'var(--navy)', color: '#fff' },
  'Market Trends': { bg: 'var(--navy)', color: '#fff' },
  'Neighbourhood': { bg: '#4ca884', color: '#fff' },
  'Investment': { bg: 'var(--charcoal)', color: '#fff' },
  'Finance': { bg: '#7A5C3A', color: '#fff' },
  'Legal': { bg: '#c94c4c', color: '#fff' },
  'NRI Guide': { bg: 'var(--navy)', color: '#fff' },
  'Land & Plots': { bg: '#4c7a3a', color: '#fff' },
}

// ─── Component ──────────────────────────────────────────────────
export default function ArticleDetail() {
  const { slug } = useParams()
  const progressRef = useRef(null)
  const [readProgress, setReadProgress] = useState(0)
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [notice, setNotice] = useState(null)

  async function saveArticleInquiry(payload, clearIds = []) {
    if (submittingInquiry) return
    setSubmittingInquiry(true)
    try {
      await submitInquiry({
        ...payload,
        pagePath: window.location.pathname,
        metadata: { articleId: article?.id, articleTitle: article?.title },
      })
      clearIds.forEach(id => {
        const el = document.getElementById(id)
        if (el) el.value = ''
      })
      setNotice({ type: 'success', message: 'Thank you. Our advisor will contact you within 30 minutes.' })
    } catch {
      setNotice({ type: 'error', message: 'Sorry, we could not submit your enquiry right now. Please try again in a moment.' })
    } finally {
      setSubmittingInquiry(false)
      setTimeout(() => setNotice(null), 5000)
    }
  }

  function value(id) {
    return document.getElementById(id)?.value?.trim() || ''
  }

  // Scroll to top + fade in on slug change
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setArticle(null)
    setRelated([])
    getArticle(slug)
      .then(async (res) => {
        if (cancelled) return
        const current = res.item
        setArticle(current || null)
        const all = await getArticles()
        if (!cancelled) {
          const sameCat = (all.items || []).filter(a => a.slug !== slug && a.cat === current?.cat)
          const others = (all.items || []).filter(a => a.slug !== slug && a.cat !== current?.cat)
          setRelated([...sameCat, ...others].slice(0, 3))
        }
      })
      .catch(() => {
        if (!cancelled) setArticle(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    window.scrollTo({ top: 0 })
    document.body.style.opacity = '0'
    const t = setTimeout(() => {
      document.body.style.transition = 'opacity 0.45s ease'
      document.body.style.opacity = '1'
    }, 40)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [slug])

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      const pct = Math.min(100, (window.scrollY / total) * 100)
      setReadProgress(pct)
      if (progressRef.current)
        progressRef.current.style.width = pct.toFixed(1) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reveal animations
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }) },
      { threshold: 0.07 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [slug])

  // ── Not found ──
  if (loading) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '12px' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📰</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '12px' }}>
          Article not found
        </div>
        <Link to="/insights" style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ← Back to Insights
        </Link>
      </div>
    )
  }

  const headings = article.body?.filter(b => b.type === 'heading') || []
  const tagStyle = tagColors[article.tag] || { bg: 'var(--gold)', color: '#fff' }

  return (
    <>
      <Seo
        title={article.title}
        description={article.desc || article.excerpt || 'Read real estate insights, market reports, investment guidance, and property advice from Estates61.'}
        keywords={`${article.title}, ${article.cat || article.category || 'real estate insights'}, Chennai real estate, property investment, Estates61`}
        path={`/insights/${article.slug || article.id}`}
      />
      {/* SCROLL PROGRESS BAR — matches .scroll-progress from index.css */}
      <div ref={progressRef} className="scroll-progress" />

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        height: 'clamp(360px, 52vh, 540px)',
        overflow: 'hidden',
        marginTop: '72px',
      }}>
        <img
          src={article.heroImg}
          alt={article.alt}
          loading="eager"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Gradient overlay — same pattern as Properties hero */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(13,35,64,0.75) 0%, rgba(13,35,64,0.3) 50%, rgba(28,28,30,0.75) 100%)',
        }} />
        {/* Subtle grid — matches hero-grid-pattern from Partners */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(184,148,106,1) 1px,transparent 1px),linear-gradient(90deg,rgba(184,148,106,1) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(1.5rem,5vw,3rem) 4vw',
          maxWidth: '960px',
        }}>
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: '14px' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <span className="breadcrumb-sep">›</span>
            <Link to="/insights" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Insights</Link>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{article.tag}</span>
          </div>

          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: tagStyle.bg, color: tagStyle.color,
            fontSize: '0.67rem', fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: '2px',
            marginBottom: '12px', width: 'fit-content',
          }}>
            {article.tag}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.6rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            margin: '0 0 16px',
            maxWidth: '820px',
          }}>
            {article.title}
          </h1>

          {/* Author + meta row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Author avatar — same style as agent-avatar */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'var(--navy)', border: '1px solid var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '0.8rem',
              fontWeight: 500, color: 'var(--gold-light)', flexShrink: 0,
            }}>
              E
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500 }}>{article.author}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>{article.authorRole}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>·</div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{article.date}</span>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>·</div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{article.read}</span>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT ───────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '48px 4vw 80px',
        display: 'grid',
        gridTemplateColumns: headings.length > 0 ? 'minmax(0,1fr) 280px' : '1fr',
        gap: '40px',
        alignItems: 'start',
      }}>

        {/* ── LEFT: ARTICLE BODY ── */}
        <article>
          {/* Desc summary strip — matches detail-price-block style */}
          <div className="reveal" style={{
            background: 'var(--beige-light)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: '0 var(--radius) var(--radius) 0',
            padding: '14px 18px',
            marginBottom: '2.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            {article.desc}
          </div>

          {/* Body blocks */}
          <div className="reveal">
            {article.body?.map((block, i) => renderBlock(block, i))}
          </div>

          {/* ── SHARE + BACK BAR ── */}
          <div className="reveal" style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--beige)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Share</span>
              {[
                { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(article.title + ' — ' + window.location.href)}` },
                { label: 'LinkedIn', href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}` },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '5px 12px',
                    border: '1px solid var(--beige-mid)',
                    borderRadius: '2px',
                    color: 'var(--charcoal-mid)',
                    fontSize: '0.72rem',
                    textDecoration: 'none',
                    letterSpacing: '0.06em',
                    transition: 'border-color var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--beige-mid)'}
                >
                  {label}
                </a>
              ))}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setNotice({ type: 'success', message: 'Article link copied.' })
                  setTimeout(() => setNotice(null), 3000)
                }}
                style={{
                  padding: '5px 12px',
                  border: '1px solid var(--beige-mid)',
                  borderRadius: '2px',
                  background: 'none',
                  color: 'var(--charcoal-mid)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-body)',
                  transition: 'border-color var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--beige-mid)'}
              >
                Copy Link
              </button>
            </div>
            <Link
              to="/insights"
              style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              ← All Articles
            </Link>
          </div>

          {/* ── RELATED ARTICLES ── */}
          {related.length > 0 && (
            <div className="reveal" style={{ marginTop: '3.5rem' }}>
              <p className="section-label">More to Read</p>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem', fontWeight: 400,
                color: 'var(--charcoal)', marginBottom: '24px',
              }}>
                Related <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>Articles</em>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}>
                {related.map((rel, i) => (
                  <Link key={i} to={`/insights/${rel.slug}`} style={{ textDecoration: 'none' }}>
                    {/* Reuses .prop-card pattern */}
                    <div
                      className="prop-card"
                      style={{ border: '1px solid var(--beige)' }}
                    >
                      <div className="prop-img" style={{ height: '150px' }}>
                        <img src={rel.img} alt={rel.alt} loading="lazy" />
                        <span className="prop-tag">{rel.tag}</span>
                      </div>
                      <div className="prop-body" style={{ padding: '14px 16px' }}>
                        <div className="prop-type">{rel.date} · {rel.read}</div>
                        <div className="prop-name" style={{ fontSize: '1rem', marginBottom: '8px' }}>
                          {rel.title}
                        </div>
                        <span style={{
                          fontSize: '0.72rem', color: 'var(--gold)',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* ── RIGHT: STICKY SIDEBAR ── */}
        {headings.length > 0 && (
          <aside style={{ position: 'sticky', top: '96px' }}>

            {/* Table of Contents — matches sidebar-card */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--beige)',
              borderTop: '3px solid var(--gold)',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{
                padding: '14px 18px',
                fontSize: '0.62rem', fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--gold)',
                borderBottom: '1px solid var(--beige)',
              }}>
                In This Article
              </div>
              <nav style={{ padding: '8px 0' }}>
                {headings.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      color: 'var(--charcoal-mid)',
                      cursor: 'pointer',
                      borderBottom: i < headings.length - 1 ? '1px solid var(--beige-light)' : 'none',
                      transition: 'color var(--transition), background var(--transition)',
                      display: 'flex', gap: '8px', alignItems: 'flex-start',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--navy)'; e.currentTarget.style.background = 'var(--beige-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--charcoal-mid)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ color: 'var(--gold)', flexShrink: 0, fontSize: '0.7rem', marginTop: '1px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {h.text}
                  </div>
                ))}
              </nav>
            </div>

            {/* Reading progress — matches progress-section */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--beige)',
              borderRadius: 'var(--radius)',
              padding: '14px 18px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Reading progress
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--navy)', fontWeight: 500 }}>
                  {Math.round(readProgress)}%
                </span>
              </div>
              <div style={{ height: '3px', background: 'var(--beige-mid)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: readProgress + '%',
                  background: 'linear-gradient(to right, var(--gold), var(--navy))',
                  borderRadius: '2px',
                  transition: 'width 0.15s linear',
                }} />
              </div>
            </div>

            {/* Expert CTA — matches sidebar-card head/body pattern */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--beige)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              <div style={{ background: 'var(--navy)', padding: '18px 20px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>
                  Free Consultation
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.5 }}>
                  Discuss your investment goals with our experts — no obligation.
                </p>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', marginBottom: '8px' }}
                  disabled={submittingInquiry}
                  onClick={() => saveArticleInquiry({
                    name: 'Article reader',
                    phone: '0000000000',
                    interest: 'Expert consultation',
                    source: 'article-consultation-cta',
                    requestType: 'Talk to an expert',
                    message: `CTA clicked from article: ${article?.title || slug}`,
                  })}
                >
                  Talk to an Expert →
                </button>
                <Link
                  to="/contact"
                  style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    padding: '10px', border: '1px solid var(--beige-mid)',
                    borderRadius: '2px', color: 'var(--charcoal-mid)',
                    fontSize: '0.75rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', textDecoration: 'none',
                    transition: 'border-color var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--charcoal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--beige-mid)'}
                >
                  Contact Us
                </Link>
              </div>
            </div>

          </aside>
        )}
      </div>

      {/* ── NEWSLETTER BAND (reused from Insights) ──────── */}
      <div className="newsletter-band reveal">
        <div className="nl-text">
          <div className="nl-label">Stay Informed</div>
          <h2>Get <em>Weekly</em> Market<br />Intelligence in Your Inbox</h2>
          <p>Join 3,000+ investors and homebuyers who receive Estates61's curated real estate insights every week.</p>
        </div>
        <div className="nl-form">
          <div className="nl-form-row">
            <input id="article-nl-name" className="nl-input" type="text" placeholder="Your full name" required />
            <input id="article-nl-phone" className="nl-input" type="tel" placeholder="+91 00000 00000" required />
          </div>
          <input id="article-nl-email" className="nl-input" type="email" placeholder="your@email.com" />
          <button
            className="nl-btn"
            disabled={submittingInquiry}
            onClick={() => saveArticleInquiry({
              name: value('article-nl-name'),
              phone: value('article-nl-phone'),
              email: value('article-nl-email'),
              interest: 'Article newsletter',
              source: 'article-newsletter',
              requestType: 'Subscribe to insights',
            }, ['article-nl-name', 'article-nl-phone', 'article-nl-email'])}
          >
            Subscribe to Insights →
          </button>
          <p className="nl-note">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
      <FormNotice notice={notice} />
    </>
  )
}
