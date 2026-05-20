import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitInquiry } from '../api/client'
import Seo from '../components/Seo'
import FormNotice from '../components/FormNotice'
import './Home.css'
// import logoImg from '../assets/logo.png'

export default function Home() {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' })
  const [activeInsight, setActiveInsight] = useState(null)
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [notice, setNotice] = useState(null)
  const progressRef = useRef(null)

  async function saveInquiry(payload, form, afterSave) {
    if (submittingInquiry) return
    setSubmittingInquiry(true)
    try {
      await submitInquiry({ ...payload, pagePath: window.location.pathname })
      form?.reset()
      afterSave?.()
      setNotice({ type: 'success', message: 'Thank you. Our advisor will contact you within 30 minutes.' })
    } catch {
      setNotice({ type: 'error', message: 'Sorry, we could not submit your enquiry right now. Please try again in a moment.' })
    } finally {
      setSubmittingInquiry(false)
      setTimeout(() => setNotice(null), 5000)
    }
  }

  function field(form, selector) {
    return form.querySelector(selector)?.value?.trim() || ''
  }

  function handleHomeContactSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    saveInquiry({
      name: field(form, '#c-name'),
      phone: field(form, '#c-phone'),
      email: field(form, '#c-email'),
      interest: field(form, '#c-interest'),
      message: field(form, '#c-msg'),
      source: 'home-contact',
      requestType: 'Contact form',
    }, form)
  }

  function handleQuickSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    saveInquiry({
      name: field(form, '#quick-name'),
      phone: field(form, '#quick-phone'),
      interest: field(form, '#quick-interest'),
      source: 'home-quick-enquiry',
      requestType: 'Request callback',
    }, form, () => setEnquiryOpen(false))
  }

  function handleModalSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    saveInquiry({
      name: field(form, '#m-name'),
      phone: field(form, '#m-phone'),
      email: field(form, '#m-email'),
      interest: field(form, '#m-req'),
      propertyName: field(form, '#m-prop'),
      message: field(form, '#m-notes'),
      source: 'home-request-info-modal',
      requestType: field(form, '#m-req'),
    }, form, () => setModalOpen(false))
  }

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.body.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.width = (scrolled / total * 100).toFixed(1) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Stat counters
  useEffect(() => {
    const band = document.getElementById('statsBand')
    if (!band) return
    const nums = band.querySelectorAll('.stat-num[data-target]')
    let counted = false
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        counted = true
        nums.forEach(el => {
          const target = parseInt(el.dataset.target, 10)
          let start = 0
          const dur = 1800
          const step = timestamp => {
            if (!start) start = timestamp
            const prog = Math.min((timestamp - start) / dur, 1)
            const eased = 1 - (1 - prog) ** 3
            el.textContent = Math.round(eased * target) + (prog === 1 ? (target === 98 ? '%' : '+') : '')
            if (prog < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      }
    }, { threshold: 0.4 })
    obs.observe(band)
    return () => obs.disconnect()
  }, [])

  // Testimonial carousel
  useEffect(() => {
    const track = document.getElementById('testiTrack')
    const dotsWrap = document.getElementById('testiDots')
    const btnPrev = document.getElementById('testiPrev')
    const btnNext = document.getElementById('testiNext')
    if (!track) return
  
    const originalCards = Array.from(track.querySelectorAll('.testi-card'))
    const total = originalCards.length
    let current = 0
    let autoTimer
    let isTransitioning = false
  
    // Clone first and last cards for infinite loop
    const firstClone = originalCards[0].cloneNode(true)
    const lastClone = originalCards[total - 1].cloneNode(true)
    track.appendChild(firstClone)
    track.insertBefore(lastClone, originalCards[0])
  
    const allCards = Array.from(track.querySelectorAll('.testi-card'))
  
    // Start at index 1 (skip the cloned last card)
    track.style.transition = 'none'
    track.style.transform = `translateX(-${cardWidth()}px)`
  
    function cardWidth() {
      return allCards[1].offsetWidth + 24
    }
  
    function goTo(idx, animate = true) {
      if (isTransitioning) return
      current = idx
      if (animate) {
        isTransitioning = true
        track.style.transition = 'transform 0.5s ease'
      } else {
        track.style.transition = 'none'
      }
      track.style.transform = `translateX(-${(current + 1) * cardWidth()}px)`
  
      // Update dots
      const dots = dotsWrap.querySelectorAll('.testi-dot')
      dots.forEach((d, i) => d.classList.toggle('active', i === ((current + total) % total)))
    }
  
    // Handle infinite jump after transition
    track.addEventListener('transitionend', () => {
      isTransitioning = false
      if (current === total) {
        current = 0
        track.style.transition = 'none'
        track.style.transform = `translateX(-${(current + 1) * cardWidth()}px)`
      }
      if (current === -1) {
        current = total - 1
        track.style.transition = 'none'
        track.style.transform = `translateX(-${(current + 1) * cardWidth()}px)`
      }
    })
  
    // Build dots
    dotsWrap.innerHTML = ''
    originalCards.forEach((_, i) => {
      const d = document.createElement('button')
      d.className = 'testi-dot' + (i === 0 ? ' active' : '')
      d.setAttribute('aria-label', 'Go to testimonial ' + (i + 1))
      d.addEventListener('click', () => { goTo(i); resetAuto() })
      dotsWrap.appendChild(d)
    })
  
    function resetAuto() {
      clearInterval(autoTimer)
      autoTimer = setInterval(() => goTo(current + 1), 4500)
    }
  
    const onPrev = () => { goTo(current - 1); resetAuto() }
    const onNext = () => { goTo(current + 1); resetAuto() }
    btnPrev.addEventListener('click', onPrev)
    btnNext.addEventListener('click', onNext)
  
    let touchX = 0
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX }, { passive: true })
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); resetAuto() }
    })
  
    const onResize = () => {
      track.style.transition = 'none'
      track.style.transform = `translateX(-${(current + 1) * cardWidth()}px)`
    }
    window.addEventListener('resize', onResize)
  
    resetAuto()
  
    return () => {
      clearInterval(autoTimer)
      btnPrev.removeEventListener('click', onPrev)
      btnNext.removeEventListener('click', onNext)
      window.removeEventListener('resize', onResize)
      // Remove clones on cleanup
      if (firstClone.parentNode) firstClone.parentNode.removeChild(firstClone)
      if (lastClone.parentNode) lastClone.parentNode.removeChild(lastClone)
    }
  }, [])

  // Page fade in
  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease'
      document.body.style.opacity = '1'
    }, 50)
    return () => clearTimeout(t)
  }, [])

  function openLightbox(e) {
    const container = e.currentTarget
    const img = container.querySelector('img')
    if (!img) return
    const src = img.getAttribute('data-hires') || img.src
    const caption = container.dataset.caption || img.alt || ''
    setLightbox({ open: true, src, caption })
  }

  function expandInsight(idx) {
    setActiveInsight(prev => prev === idx ? null : idx)
  }

  const insightCards = [
    { img: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&q=80&auto=format', alt: 'Chennai ECR real estate 2025', caption: "Chennai's Coastal Corridor — ECR Market Report 2025", tag: 'Market Report', date: 'March 2025', read: '8 min read', title: "Chennai's Coastal Corridor: Why ECR is Becoming India's Most Coveted Address", desc: "Infrastructure investments, lifestyle amenities, and proximity to IT hubs are driving unprecedented demand along Chennai's East Coast Road." },
    { img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80&auto=format', alt: 'Home loan guide 2025', caption: 'Home Loan Guide 2025 — Finance Insights', tag: 'Finance', date: 'Feb 2025', read: '', title: 'Home Loan Guide 2025: Getting the Best Rate in a Shifting Market', desc: 'A practical guide to navigating interest rate changes and securing the best financing for your dream home.' },
    { img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format', alt: 'RERA buyer rights 2025', caption: 'RERA Simplified — Your Rights as a Property Buyer 2025', tag: 'Legal', date: 'Jan 2025', read: '', title: 'RERA Simplified: Your Rights as a Property Buyer in 2025', desc: 'Everything you need to know about RERA protections, builder accountability, and your legal rights as a buyer.' },
  ]

  const hasActive = activeInsight !== null

  return (
    <main className="home-page">
      <Seo
        title="Verified Properties in Chennai"
        description="Explore verified apartments, villas, plots, builder projects, home loan support, and real estate advisory services in Chennai with Estates61."
        keywords="Chennai real estate, properties in Chennai, apartments Chennai, villas Chennai, plots Chennai, verified builder projects, RERA property Chennai"
        path="/"
      />
      <div className="scroll-progress" ref={progressRef} />

      {/* HERO */}
      <section className="hero" id="home" style={{position:'relative',minHeight:'clamp(440px, 76vh, 640px)',display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'0 4vw 5vh',overflow:'hidden'}}>
        <div className="hero-bg" style={{position:'absolute',inset:0,zIndex:0}}>
          <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=80&auto=format" alt="Luxury villa with pool" loading="eager" style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.62)'}} />
          <div className="hero-overlay" style={{position:'absolute',inset:0,background:'linear-gradient(160deg,rgba(13,35,64,0.4) 0%,rgba(13,35,64,0.1) 50%,rgba(28,28,30,0.6) 100%)'}} />
        </div>
        <div className="hero-content" style={{position:'relative',zIndex:2,maxWidth:'760px'}}>
          <div className="hero-badge" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'6px 14px',background:'rgba(184,148,106,0.25)',border:'1px solid rgba(184,148,106,0.5)',borderRadius:'100px',fontSize:'0.72rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--gold-light)',marginBottom:'18px',backdropFilter:'blur(8px)'}}>Premium Real Estate</div>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(3rem,7vw,6rem)',fontWeight:300,lineHeight:1.05,color:'#fff',marginBottom:'16px',letterSpacing:'-0.01em'}}>Where <em style={{fontStyle:'italic',color:'var(--gold-light)'}}>Luxury</em><br />Meets Living</h1>
          <p className="hero-sub" style={{fontSize:'1rem',color:'rgba(255,255,255,0.7)',maxWidth:'440px',lineHeight:1.7,marginBottom:'22px',fontWeight:300}}>Discover curated residences and commercial spaces across India's most sought-after addresses.</p>
          <div className="hero-actions" style={{display:'flex',gap:'16px',alignItems:'center',flexWrap:'wrap'}}>
            <a href="#properties" className="btn-primary">Explore Properties</a>
            <button className="btn-ghost" onClick={() => setModalOpen(true)}>Schedule a Visit</button>
          </div>
        </div>
        <div className="hero-stats" style={{position:'absolute',right:'4vw',bottom:'5vh',zIndex:2,display:'flex',flexDirection:'column',gap:'12px',alignItems:'flex-end'}}>
          <div className="hero-stat" style={{textAlign:'right'}}><span className="hero-stat-num" style={{fontFamily:'var(--font-display)',fontSize:'2.2rem',fontWeight:500,color:'#fff',lineHeight:1,display:'block'}}>500+</span><span className="hero-stat-label" style={{fontSize:'0.7rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginTop:'2px'}}>Properties Sold</span></div>
          <div className="hero-stat" style={{textAlign:'right'}}><span className="hero-stat-num" style={{fontFamily:'var(--font-display)',fontSize:'2.2rem',fontWeight:500,color:'#fff',lineHeight:1,display:'block'}}>12</span><span className="hero-stat-label" style={{fontSize:'0.7rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginTop:'2px'}}>Cities</span></div>
          <div className="hero-stat" style={{textAlign:'right'}}><span className="hero-stat-num" style={{fontFamily:'var(--font-display)',fontSize:'2.2rem',fontWeight:500,color:'#fff',lineHeight:1,display:'block'}}>15+</span><span className="hero-stat-label" style={{fontSize:'0.7rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginTop:'2px'}}>Years</span></div>
        </div>
        <div className="hero-scroll" style={{position:'absolute',bottom:'28px',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',zIndex:2}}>
          <span style={{fontSize:'0.65rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)'}}>Scroll</span>
          <div className="hero-scroll-line" style={{width:'1px',height:'36px',background:'rgba(255,255,255,0.2)',position:'relative',overflow:'hidden'}} />
        </div>
      </section>

      {/* SEARCH STRIP */}
      <div className="search-strip">
        <div className="search-form">
        <div className="search-field"><label>Location</label><input type="text" placeholder="City, area or project" /></div>
<div className="search-field"><label>Property Type</label><select><option>All Types</option><option>Apartment</option><option>Villa</option><option>Commercial</option><option>Plot</option></select></div>
<div className="search-field"><label>Budget</label><select><option>Any Budget</option><option>Under ₹50L</option><option>₹50L – ₹1Cr</option><option>₹1Cr – ₹3Cr</option><option>Above ₹3Cr</option></select></div>
          <button className="search-btn">Search</button>
        </div>
      </div>

      {/* ABOUT INTRO */}
      <div className="about-intro" id="about-intro">
        <div className="about-intro-inner">
          <div className="about-intro-visual reveal">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format" alt="Premium property" loading="lazy" />
            <div className="about-intro-badge">22+<small>Years of Trust</small></div>
          </div>
          <div className="about-intro-content reveal reveal-delay-1">
            <p className="section-label">About Estates61</p>
            <h2 className="section-title">Chennai's Most <em>Trusted</em> Property Partner</h2>
            <p className="section-sub">Since 2002, Estates61 has been curating premium real estate experiences — matching discerning buyers with exceptional properties across India's finest addresses.</p>
            <p className="section-sub" style={{marginTop:'12px'}}>From a first home to a landmark investment, our advisors guide every step with integrity, expertise, and a deep understanding of local markets.</p>
            <ul className="about-intro-points">
              <li>RERA-registered channel partner — TN/RERA/AGENT/00123/2019</li>
              <li>500+ successful transactions across 12 Indian cities</li>
              <li>Specialist NRI services with virtual site visits</li>
              <li>In-house legal, finance & valuation experts</li>
              <li>Zero brokerage for buyers — our service is completely free</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PROPERTIES */}
      <section className="properties-section" id="properties" style={{padding:'80px 4vw'}}>
        <div className="section-head reveal">
          <div>
            <p className="section-label">Featured</p>
            <h2 className="section-title">Curated <em>Properties</em></h2>
            <p className="section-sub">Handpicked residences and commercial spaces across India's most sought-after addresses.</p>
          </div>
          <a href="#" className="btn-card btn-card-ghost">View All →</a>
        </div>
        <div className="props-grid">
          {[
            { tag:'New Launch', tagClass:'', type:'Luxury Villa', name:'The Serenity Villa', loc:'ECR, Chennai', price:'₹4.2 Cr onwards', specs:['4 BHK','4,200 sq.ft','Private Pool'], img:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=700&q=80&auto=format' },
            { tag:'Ready to Move', tagClass:'sale', type:'Premium Apartment', name:'Skyline Residences', loc:'Whitefield, Bengaluru', price:'₹1.8 Cr onwards', specs:['3 BHK','2,100 sq.ft','Club House'], img:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80&auto=format' },
            { tag:'Pre-Launch', tagClass:'', type:'Commercial Space', name:'The Crown', loc:'BKC, Mumbai', price:'₹3.5 Cr onwards', specs:['Grade A','1,800 sq.ft','LEED Certified'], img:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&auto=format' },
            { tag:'Under Construction', tagClass:'sale', type:'Villa Community', name:'Heritage Enclave', loc:'Jubilee Hills, Hyderabad', price:'₹6.8 Cr onwards', specs:['5 BHK','6,500 sq.ft','Smart Home'], img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80&auto=format' },
          ].map((p, i) => (
            <div className="prop-card reveal" key={i}>
              <div className="prop-img">
                <img src={p.img} alt={p.name} loading="lazy" />
                <span className={`prop-tag ${p.tagClass}`}>{p.tag}</span>
              </div>
              <div className="prop-body">
                <div className="prop-type">{p.type}</div>
                <div className="prop-name">{p.name}</div>
                <div className="prop-loc">{p.loc}</div>
                <div className="prop-price">{p.price}</div>
                <div className="prop-specs">{p.specs.map(s => <span key={s}>{s}</span>)}</div>
                <div className="prop-action">
                  <button className="btn-card btn-card-primary" onClick={() => setModalOpen(true)}>Enquire Now</button>
                  <button className="btn-card btn-card-ghost">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section" id="why">
        <div className="section-head reveal">
          <div>
            <p className="section-label">Why Estates61</p>
            <h2 className="section-title">The Smarter Way to <em>Buy Property</em></h2>
          </div>
        </div>
        <div className="why-grid">
          {[
            { icon:'🏛️', title:'RERA Verified Only', text:'Every property we list is cross-verified on TNRERA before being presented to you. No frauds, no shortcuts.' },
            { icon:'🆓', title:'Zero Cost to Buyers', text:'Our advisory, search and legal guidance services are completely free for buyers. We charge brokerage only on successful transactions.' },
            { icon:'🌐', title:'NRI Specialists', text:'Virtual tours, Power of Attorney drafting, remote RERA verification, and loan assistance for NRIs worldwide.' },
            { icon:'⚖️', title:'In-House Legal Team', text:'Title verification, encumbrance checks, sale deed review — our lawyers protect you at every stage of the transaction.' },
            { icon:'🏦', title:'Home Loan Assistance', text:'We work with 12+ banks and NBFCs to find you the best rate. Many clients close their loans in under a week.' },
            { icon:'🗺️', title:'Deep Local Expertise', text:'Our advisors specialise in city-specific micro-markets — ECR, OMR, Whitefield, BKC — giving you a decisive edge.' },
          ].map((w, i) => (
            <div className="why-card reveal" key={i}>
              <div className="why-icon">{w.icon}</div>
              <div className="why-title">{w.title}</div>
              <p className="why-text">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ONGOING PROJECTS */}
      <section style={{padding:'52px 4vw',background:'var(--cream)'}} id="ongoing">
        <div className="section-head reveal">
          <div>
            <p className="section-label">Ongoing</p>
            <h2 className="section-title">Projects Under <em>Development</em></h2>
            <p className="section-sub">Exclusive access to pre-launch and under-construction opportunities with maximum appreciation potential.</p>
          </div>
        </div>
        {[
          { year:'Possession: Q4 2025', title:'Elara Heights, OMR Chennai', desc:'A landmark 28-storey residential tower with 240 smart homes overlooking the OMR tech corridor. Features rooftop garden, Olympic pool, and concierge services.', progress:78, progressLabel:'Construction: 78% Complete', btn:'Request Brochure →', img:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80&auto=format', caption:'Elara Heights, OMR Chennai', meta:'240 Units · Smart Homes · Rooftop Garden · Olympic Pool' },
          { year:'Possession: Q2 2026', title:'The Grand, HITEC City', desc:'An iconic commercial tower spanning 8 lakh sq.ft in Hyderabad\'s technology district. Grade-A office spaces, retail podium, and wellness centre.', progress:42, progressLabel:'Construction: 42% Complete', btn:'Register Interest →', img:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&auto=format', caption:'The Grand, HITEC City — Hyderabad', meta:'8 Lakh sq.ft · Grade-A Offices · Retail Podium · Wellness Centre' },
          { year:'Possession: Q1 2027', title:'Verdant Villas, Sarjapur', desc:'An exclusive gated community of 80 ultra-luxury villas on 40 acres of curated landscape in Bengaluru\'s most coveted growth corridor.', progress:12, progressLabel:'Pre-Launch Phase', btn:'Pre-Book Now →', img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80&auto=format', caption:'Verdant Villas, Sarjapur — Bengaluru', meta:'80 Ultra-Luxury Villas · 40 Acres · Gated Community' },
        ].map((p, i) => (
          <div className="ongoing-item reveal" key={i}>
            <div className="ongoing-left">
              <div className="ongoing-year-tag">{p.year}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="ongoing-progress">
                <div className="ongoing-progress-label">{p.progressLabel}</div>
                <div className="ongoing-bar"><div className="ongoing-bar-fill" style={{width:`${p.progress}%`}} /></div>
              </div>
              <button className="ongoing-cta-btn" onClick={() => setModalOpen(true)}>{p.btn}</button>
            </div>
            <div className="ongoing-right">
              <div className="ongoing-right-img" onClick={openLightbox} data-caption={p.caption}>
                <img src={p.img} alt={p.title} loading="lazy" data-caption={p.caption} />
              </div>
              <div className="ongoing-popup-footer">
                <div className="ongoing-popup-title">{p.caption}</div>
                <div className="ongoing-popup-meta">{p.meta}</div>
                <button className="ongoing-popup-btn" onClick={() => setModalOpen(true)}>Contact Us to Know More →</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* INSIGHTS */}
      <section style={{padding:'52px 4vw',background:'var(--beige-light)'}} id="insights">
        <div className="section-head reveal">
          <div>
            <p className="section-label">Insights</p>
            <h2 className="section-title">Real Estate <em>Intelligence</em></h2>
          </div>
          <Link to="/insights" className="btn-card btn-card-ghost">All Articles →</Link>
        </div>
        <div className={`insights-grid${hasActive ? ' has-active' : ''}`} id="insightsGrid">
          {insightCards.map((card, i) => (
            <article className={`insight-card reveal${i===1?' reveal-delay-1':i===2?' reveal-delay-2':''}${activeInsight===i?' active':''}`} key={i} onClick={() => expandInsight(i)}>
              <div className="insight-img">
                <img src={card.img} alt={card.alt} loading="lazy" data-caption={card.caption} />
                <div className="insight-img-overlay"><span>View Article</span></div>
              </div>
              <button className="insight-close-btn" onClick={e => { e.stopPropagation(); setActiveInsight(null) }}>✕</button>
              <div className="insight-body">
                <div className="insight-meta"><span className="insight-tag">{card.tag}</span><span>{card.date}</span>{card.read && <span>{card.read}</span>}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <a href="#" className="insight-read">Read Article →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <div className="stats-band" id="statsBand">
        <div className="stat-item"><span className="stat-num" data-target="500">0</span><span className="stat-label">Properties Sold</span></div>
        <div className="stat-item"><span className="stat-num" data-target="12">0</span><span className="stat-label">Cities Covered</span></div>
        <div className="stat-item"><span className="stat-num" data-target="15">0</span><span className="stat-label">Years of Excellence</span></div>
        <div className="stat-item"><span className="stat-num" data-target="98">0</span><span className="stat-label">% Client Satisfaction</span></div>
      </div>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-head reveal">
          <div>
            <p className="section-label">Client Stories</p>
            <h2 className="section-title">What Our <em>Clients Say</em></h2>
          </div>
        </div>
        <div className="testi-track-wrap">
          <div className="testi-track" id="testiTrack">
            {[
              { init:'RI', name:'Ramesh Iyer', role:'Purchased 4BHK Villa, ECR', quote:'"Unlike 99acres where we got 20 broker calls a day, Estates61 gave us 3 verified options. We closed in 2 weeks."' },
              { init:'PV', name:'Priya Venkataraman', role:'NRI Buyer, Anna Nagar', quote:'"Being an NRI, I was worried about managing the purchase from Dubai. Estates61 handled power of attorney, site visits, and RERA checks — completely seamless."' },
              { init:'KS', name:'K. Srinivasan', role:'Land Aggregation, OMR', quote:'"The confidentiality was crucial for our transaction. They ensured neither party\'s identity was revealed until the deal was finalised. Absolutely professional."' },
              { init:'AM', name:'Anand Muthuswamy', role:'3BHK Apartment, Whitefield', quote:'"The home loan team sorted our financing in 4 days. I didn\'t have to visit a single bank. Estates61 handled everything end-to-end."' },
              { init:'SN', name:'Sunitha Natarajan', role:'Villa, Sarjapur Road', quote:'"From the virtual tour to key handover, every step was transparent and on schedule. Rare in real estate."' },
            ].map((t, i) => (
              <div className={`testi-card${i===0?' active':''}`} key={i}>
                <div className="testi-stars">★★★★★</div>
                <p className="testi-quote">{t.quote}</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.init}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="testi-controls">
          <button className="testi-btn" id="testiPrev" aria-label="Previous">←</button>
          <div className="testi-dots" id="testiDots"></div>
          <button className="testi-btn" id="testiNext" aria-label="Next">→</button>
        </div>
      </section>

      {/* TEAM — header layout matches Insights (title block + CTA row) */}
      <section className="team-section" id="team">
        <div className="section-head reveal">
          <div className="team-section-head-text">
            <p className="section-label">The People</p>
            <h2 className="section-title">Meet Our <em>Expert Team</em></h2>
            <p className="section-sub team-section-sub">50+ certified advisors across India, each specialising in their city’s micro-markets.</p>
          </div>
          <Link to="/contact" className="btn-card btn-card-ghost team-section-cta">Talk to an Advisor →</Link>
        </div>
        <div className="team-grid">
          {[
            { img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80&auto=format', name:'Arjun Sharma', title:'Head, Chennai Residential', bio:'15 years in Chennai luxury residential. Expert in ECR & OMR micro-markets.', delay:'' },
            { img:'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format', name:'Kavitha Reddy', title:'NRI Services Lead', bio:'NRI specialist with 10+ years managing cross-border real estate transactions from Dubai & Singapore.', delay:' reveal-delay-1' },
            { img:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80&auto=format', name:'Rohit Menon', title:'Commercial Director', bio:'Commercial real estate expert, specialising in Grade-A offices and tech-park leasing in Hyderabad & Bengaluru.', delay:' reveal-delay-2' },
            { img:'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80&auto=format', name:'Deepa Krishnan', title:'Legal & Compliance Head', bio:'In-house legal counsel with expertise in RERA compliance, title verification, and land aggregation.', delay:' reveal-delay-3' },
          ].map((m, i) => (
            <div className={`team-card reveal${m.delay}`} key={i}>
              <div className="team-img"><img src={m.img} alt={m.name} loading="lazy" /></div>
              <div className="team-overlay"><p>{m.bio}</p></div>
              <div className="team-info"><div className="team-name">{m.name}</div><div className="team-title">{m.title}</div></div>
            </div>
          ))}
        </div>
        <div className="gallery-strip reveal">
          {[
            { img:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80&auto=format', alt:'Property gallery 1', caption:'Elara Heights — Rooftop Sky Garden, OMR Chennai' },
            { img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format', alt:'Property gallery 2', caption:'Verdant Villas — Landscaped Gardens, Sarjapur' },
            { img:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&auto=format', alt:'Property gallery 3', caption:'The Grand — Lobby, HITEC City Hyderabad' },
            { img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80&auto=format', alt:'Property gallery 4', caption:'Serenity Villa — ECR Chennai Pool View' },
            { img:'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&q=80&auto=format', alt:'Property gallery 5', caption:'Skyline Residences — Whitefield Bengaluru' },
          ].map((g, i) => (
            <div className="gallery-item" key={i} onClick={openLightbox} data-caption={g.caption}>
              <img src={g.img} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div className="contact-info">
          <p className="section-label">Get in Touch</p>
          <h2 className="section-title">Let's Find Your <em>Perfect Space</em></h2>
          <div className="contact-detail"><label>Head Office</label><p>No. 12, Anna Salai, Teynampet, Chennai – 600 018</p></div>
          <div className="contact-detail"><label>Phone</label><p><a href="tel:+914444444461">+91 44 4444 4461</a></p></div>
          <div className="contact-detail"><label>Email</label><p><a href="mailto:digital@estates61.com">digital@estates61.com</a></p></div>
          <div className="contact-detail"><label>Hours</label><p>Mon – Sat: 9:00 AM – 7:00 PM</p></div>
        </div>
        <div className="contact-form-wrap">
          <form className="contact-form" onSubmit={handleHomeContactSubmit}>
            <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.6rem',fontWeight:400,color:'#fff',marginBottom:'4px'}}>Send a Message</h3>
            <div className="form-group"><label htmlFor="c-name">Full Name</label><input type="text" id="c-name" placeholder="Your full name" required /></div>
            <div className="form-group"><label htmlFor="c-phone">Phone Number</label><input type="tel" id="c-phone" placeholder="+91 00000 00000" required /></div>
            <div className="form-group"><label htmlFor="c-email">Email Address</label><input type="email" id="c-email" placeholder="you@email.com" /></div>
            <div className="form-group"><label htmlFor="c-interest">I'm interested in</label>
              <select id="c-interest">
                <option>Buying a Property</option><option>Selling a Property</option><option>Rental</option><option>Investment Advisory</option><option>Home Loan Assistance</option>
              </select>
            </div>
            <div className="form-group"><label htmlFor="c-msg">Message</label><textarea id="c-msg" placeholder="Tell us what you're looking for..." /></div>
            <button type="submit" className="btn-primary" style={{marginTop:'4px'}}>Send Message →</button>
          </form>
        </div>
      </section>

      {/* ENQUIRY FAB */}
      <div className="enquiry-fab">
        <div className="enquiry-tooltip">Quick Enquiry</div>
        <button className="enquiry-btn" onClick={() => setEnquiryOpen(!enquiryOpen)} aria-label="Quick Enquiry">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </button>
      </div>
      <div className={`enquiry-panel${enquiryOpen ? ' open' : ''}`}>
        <div className="enquiry-panel-header">
          <h4>Quick Enquiry</h4>
          <button className="enquiry-close" onClick={() => setEnquiryOpen(false)}>✕</button>
        </div>
        <form className="enquiry-panel-body" onSubmit={handleQuickSubmit}>
          <div className="form-group" style={{marginBottom:'12px'}}><label htmlFor="quick-name">Name</label><input id="quick-name" type="text" placeholder="Your name" required /></div>
          <div className="form-group" style={{marginBottom:'12px'}}><label htmlFor="quick-phone">Phone</label><input id="quick-phone" type="tel" placeholder="+91 00000 00000" required /></div>
          <div className="form-group" style={{marginBottom:'12px'}}><label htmlFor="quick-interest">I'm interested in</label><select id="quick-interest"><option>Buying</option><option>Selling</option><option>Investment</option><option>Rental</option></select></div>
          <button type="submit" className="btn-primary" disabled={submittingInquiry} style={{width:'100%',marginTop:'8px', opacity: submittingInquiry ? 0.7 : 1}}>{submittingInquiry ? 'Sending...' : 'Request Callback ->'}</button>
          <p style={{fontSize:'0.72rem',color:'var(--text-muted)',textAlign:'center',marginTop:'10px'}}>Or call us: <a href="tel:+914444444461" style={{color:'var(--gold)'}}>+91 44 4444 4461</a></p>
        </form>
      </div>

      {/* LIGHTBOX */}
      <div className={`lightbox-overlay${lightbox.open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setLightbox(l => ({...l, open:false})) }}>
        <button className="lightbox-close" onClick={() => setLightbox(l => ({...l, open:false}))}>✕</button>
        <div className="lightbox-inner">
        <img className="lightbox-img" src={lightbox.src || null} alt="" onClick={() => setLightbox(l => ({...l, open:false}))} />
        </div>
        <div className="lightbox-caption">{lightbox.caption}</div>
      </div>

      {/* MODAL */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal" role="dialog" aria-modal="true">
          <button className="modal-close-btn" onClick={() => setModalOpen(false)}>✕</button>
          <div className="modal-header">
            <h2>Request Information</h2>
            <p>Our advisor will reach out within 30 minutes</p>
          </div>
          <div className="modal-body">
            <form className="modal-form" onSubmit={handleModalSubmit}>
              <div className="modal-row">
                <div><label htmlFor="m-name">Full Name *</label><input type="text" id="m-name" placeholder="Your full name" required /></div>
                <div><label htmlFor="m-phone">Phone *</label><input type="tel" id="m-phone" placeholder="+91 00000 00000" required /></div>
              </div>
              <div><label htmlFor="m-email">Email Address</label><input type="email" id="m-email" placeholder="you@email.com" /></div>
              <div><label htmlFor="m-prop">Property Interest</label>
                <select id="m-prop">
                  <option>The Serenity Villa – ECR, Chennai</option><option>Skyline Residences – Bengaluru</option><option>The Crown – Mumbai</option><option>Elara Heights – Chennai</option><option>The Grand – HITEC City, Hyderabad</option><option>Verdant Villas – Sarjapur, Bengaluru</option><option>Other / Not Sure Yet</option>
                </select>
              </div>
              <div><label htmlFor="m-req">What would you like?</label>
                <select id="m-req">
                  <option>Property Brochure & Pricing</option><option>Schedule a Site Visit</option><option>Request a Callback</option><option>Home Loan Assistance</option><option>Investment Enquiry</option>
                </select>
              </div>
              <div><label htmlFor="m-notes">Additional Notes</label><textarea id="m-notes" placeholder="Budget, preferred size, timeline, or any questions..." /></div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" style={{flex:1}}>Submit Request →</button>
                <button type="button" className="btn-card btn-card-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <FormNotice notice={notice} />
    </main>
  )
}
