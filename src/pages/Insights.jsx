import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArticles, submitInquiry } from '../api/client'
import Seo from '../components/Seo'
import FormNotice from '../components/FormNotice'

const filters = [
  ['all', 'All Articles'],
  ['market', 'Market Reports'],
  ['neighbourhood', 'Neighbourhoods'],
  ['investment', 'Investment'],
  ['legal', 'Legal & Finance'],
  ['nri', 'NRI Guide'],
]

const topics = [
  { icon: '📊', title: 'Market Reports', desc: 'Quarterly data, price trends and city-wide analysis', count: '4 Articles', cat: 'market' },
  { icon: '📍', title: 'Neighbourhoods', desc: 'Sholinganallur, Guindy, OMR, ECR and more', count: '3 Articles', cat: 'neighbourhood' },
  { icon: '💹', title: 'Investment Guides', desc: 'Commercial, residential and plot investment analysis', count: '3 Articles', cat: 'investment' },
  { icon: '⚖️', title: 'Legal & Finance', desc: 'RERA, home loans, stamp duty, guideline values', count: '3 Articles', cat: 'legal' },
]

export default function Insights() {
  const [activeCat, setActiveCat] = useState('all')
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [articles, setArticles] = useState([])
  const [featuredArticle, setFeaturedArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [notice, setNotice] = useState(null)
  const progressRef = useRef(null)

  async function saveInquiry(payload, afterSave) {
    if (submittingInquiry) return
    setSubmittingInquiry(true)
    try {
      await submitInquiry({ ...payload, pagePath: window.location.pathname })
      afterSave?.()
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

  function handleNewsletterSubmit() {
    saveInquiry({
      name: value('insights-nl-name'),
      phone: value('insights-nl-phone'),
      email: value('insights-nl-email'),
      interest: value('insights-nl-interest'),
      source: 'insights-newsletter',
      requestType: 'Subscribe to insights',
    }, () => {
      ;['insights-nl-name', 'insights-nl-phone', 'insights-nl-email'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' })
    })
  }

  function handleQuickSubmit() {
    saveInquiry({
      name: value('insights-quick-name'),
      phone: value('insights-quick-phone'),
      interest: 'Insights callback',
      source: 'insights-quick-enquiry',
      requestType: 'Request callback',
    }, () => setEnquiryOpen(false))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getArticles()
      .then((res) => {
        if (cancelled) return
        const items = res.items || []
        setFeaturedArticle(items[0] || null)
        setArticles(items.slice(1))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
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
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }) },
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [activeCat])

  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease'
      document.body.style.opacity = '1'
    }, 50)
    return () => clearTimeout(t)
  }, [])

  const filtered = articles.filter(a => activeCat === 'all' || a.cat === activeCat)

  return (
    <>
      <Seo
        title="Real Estate Insights and Market Reports"
        description="Read Estates61 real estate insights, Chennai market reports, neighbourhood guides, investment analysis, RERA guidance, home loan tips, and NRI property advice."
        keywords="real estate insights Chennai, Chennai property market report, real estate investment Chennai, RERA guide, home loan guide, NRI property India"
        path="/insights"
      />
      <div className="scroll-progress" ref={progressRef} />

      {/* PAGE HERO */}
      <section className="insights-page-hero">
        <div className="insights-page-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format"
            alt="Chennai real estate insights"
            loading="eager"
          />
          <div className="page-hero-overlay" />
        </div>
        <div className="hero-grid" />
        <div className="page-hero-content">
          <div className="breadcrumb">
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Insights</span>
          </div>
          <div className="page-hero-tag">Real Estate Intelligence</div>
          <h1>Market <em>Insights</em><br />&amp; Expert Analysis</h1>
          <p>Data-driven reports, neighbourhood guides, investment analysis and legal deep-dives — everything you need to make the right real estate decision.</p>
        </div>
        <div className="hero-scroll-line" style={{ position: 'absolute', bottom: 0, left: '4vw', width: '1px', height: '56px', background: 'linear-gradient(to bottom,var(--gold),transparent)' }} />
      </section>

      {/* FILTER BAR */}
      <div className="filter-bar">
        {filters.map(([cat, label]) => (
          <button
            key={cat}
            className={`filter-tab${activeCat === cat ? ' active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="insights-page-content">

        {/* FEATURED ARTICLE */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Loading articles...
          </div>
        )}

        {featuredArticle && (activeCat === 'all' || featuredArticle.cat === activeCat) && (
          <article className="featured-article reveal" data-cat="market">
            <div className="featured-img">
              <img
                src={featuredArticle.img}
                alt={featuredArticle.alt}
                loading="lazy"
              />
              <span className="featured-img-tag">Featured · Market Report</span>
            </div>
            <div className="featured-content">
              <span className="art-label">Market Report 2024</span>
              <h2>Chennai Residential Market <em>Transformed</em> in 2024</h2>
              <div className="art-meta">
                <span>{featuredArticle.date}</span>
                <span>{featuredArticle.read}</span>
                <span>Market Analysis</span>
              </div>
              <p>{featuredArticle.desc}</p>
              {/* ✅ Routes to full article detail page */}
              <Link to={`/insights/${featuredArticle.slug}`} className="read-btn">
                Read Full Report →
              </Link>
            </div>
          </article>
        )}

        {/* ARTICLES GRID */}
        <div className="section-divider reveal">
          <h2>Latest <em>Articles</em></h2>
          <div className="section-divider-line" />
        </div>

        <div className="articles-grid" id="articlesGrid">
          {filtered.map((a, i) => (
            <article className={`art-card reveal${a.delay}`} key={i} data-cat={a.cat}>
              <div className="art-card-img">
                <img src={a.img} alt={a.alt} loading="lazy" />
                <span className="art-card-tag">{a.tag}</span>
              </div>
              <div className="art-card-body">
                <div className="art-card-meta">
                  <span>{a.date}</span>
                  <span className="dot" />
                  <span>{a.read}</span>
                </div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                {/* ✅ Routes to full article detail page */}
                <Link to={`/insights/${a.slug}`} className="art-card-read">
                  Read Article →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No articles found in this category.
          </div>
        )}

        {/* EXPLORE BY TOPIC */}
        <div className="section-divider reveal" style={{ marginTop: '64px' }}>
          <h2>Explore by <em>Topic</em></h2>
          <div className="section-divider-line" />
        </div>
        <div className="topics-section">
          <div className="topics-grid reveal">
            {topics.map((t, i) => (
              <div className="topic-card" key={i} onClick={() => setActiveCat(t.cat)}>
                <div className="topic-icon">{t.icon}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <div className="topic-count">{t.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEWSLETTER BAND */}
      <div className="newsletter-band reveal">
        <div className="nl-text">
          <div className="nl-label">Stay Informed</div>
          <h2>Get <em>Weekly</em> Market<br />Intelligence in Your Inbox</h2>
          <p>Join 3,000+ investors and homebuyers who receive Estates61's curated real estate insights every week. No spam — just the data that matters.</p>
        </div>
        <div className="nl-form">
          <div className="nl-form-row">
            <input id="insights-nl-name" className="nl-input" type="text" placeholder="Your full name" required />
            <input id="insights-nl-phone" className="nl-input" type="tel" placeholder="+91 00000 00000" required />
          </div>
          <input id="insights-nl-email" className="nl-input" type="email" placeholder="your@email.com" />
          <select id="insights-nl-interest" className="nl-select">
            <option>What are you interested in?</option>
            <option>Market Reports</option>
            <option>Neighbourhood Guides</option>
            <option>Investment Analysis</option>
            <option>NRI Services</option>
            <option>Legal &amp; Finance</option>
          </select>
          <button
            className="nl-btn"
            disabled={submittingInquiry}
            onClick={handleNewsletterSubmit}
          >
            Subscribe to Insights →
          </button>
          <p className="nl-note">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>

      {/* ENQUIRY FAB */}
      <div className="enquiry-fab">
        <div className="enquiry-tooltip">Quick Enquiry</div>
        <button
          className="enquiry-btn"
          onClick={() => setEnquiryOpen(!enquiryOpen)}
          aria-label="Quick Enquiry"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </button>
      </div>
      <div className={`enquiry-panel${enquiryOpen ? ' open' : ''}`}>
        <div className="enquiry-panel-header">
          <h4>Quick Enquiry</h4>
          <button className="enquiry-close" onClick={() => setEnquiryOpen(false)}>✕</button>
        </div>
        <div className="enquiry-panel-body">
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Name</label>
            <input id="insights-quick-name" type="text" placeholder="Your name" required />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Phone</label>
            <input id="insights-quick-phone" type="tel" placeholder="+91 00000 00000" required />
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submittingInquiry}
            onClick={handleQuickSubmit}
          >
            Request Callback →
          </button>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Or call:{' '}
            <a href="tel:07969061234" style={{ color: 'var(--gold)' }}>079 6906 1234</a>
          </p>
        </div>
      </div>
      <FormNotice notice={notice} />
    </>
  )
}
