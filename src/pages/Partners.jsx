import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const builders = [
  {
    cat: 'luxury affordable',
    id:'casagrand'
,    name: 'casagrand cloud 9 primera supremus sholinganallur perumbakkam pallavaram',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#fff"/>
        <rect x="4" y="4" width="80" height="80" fill="none" stroke="#b8946a" strokeWidth="1.5"/>
        <text x="44" y="34" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#c0392b" textAnchor="middle" letterSpacing="1">CASA</text>
        <line x1="14" y1="40" x2="74" y2="40" stroke="#b8946a" strokeWidth="0.8"/>
        <text x="44" y="56" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" fill="#1a1a1a" textAnchor="middle" letterSpacing="3">GRAND</text>
      </svg>
    ),
    builderName: 'Casagrand', since: 'Since 2003 · 25+ Projects', badge: 'RERA ✓',
    tagline: "Chennai's most trusted mass-housing developer, known for on-time delivery and world-class amenities across every price point.",
    projects: [['Casagrand Cloud 9','Sholinganallur'],['Casagrand Primera','Perumbakkam'],['Casagrand Supremus','Pallavaram']],
    stat1: <><strong>3BHK</strong> from ₹68L</>, stat2: <><strong>Ready</strong> &amp; UC</>
  },
  {
    cat: 'luxury',
id: 'tvs-emerald', 
    name: 'tvs emerald jardin greenacres aaranya madhavaram thirumazhisai oragadam',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#0a2240"/>
        <polygon points="44,8 80,24 80,64 44,80 8,64 8,24" fill="none" stroke="#b8946a" strokeWidth="1.5"/>
        <text x="44" y="37" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#ffffff" textAnchor="middle" letterSpacing="2">TVS</text>
        <line x1="20" y1="43" x2="68" y2="43" stroke="#b8946a" strokeWidth="0.8"/>
        <text x="44" y="57" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="700" fill="#b8946a" textAnchor="middle" letterSpacing="2">EMERALD</text>
      </svg>
    ),
    builderName: 'TVS Emerald', since: '112 Year Legacy · 8 Projects', badge: 'Premium',
    tagline: 'Backed by the iconic TVS Group, TVS Emerald brings century-old engineering discipline to premium residential development.',
    projects: [['TVS Emerald Jardin','Madhavaram'],['GreenAcres','Thirumazhisai'],['TVS Emerald Aaranya','Oragadam']],
    stat1: <><strong>2 &amp; 3BHK</strong> from ₹55L</>, stat2: <><strong>RERA</strong> Listed</>
  },
  {
    cat: 'luxury affordable',
    id: 'navins', 
    name: 'navins sunridge montania cosmocity siruseri omr guduvanchery poonamallee',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#f8f4ee"/>
        <rect x="6" y="6" width="76" height="76" fill="none" stroke="#1a1a1a" strokeWidth="2"/>
        <text x="44" y="42" fontFamily="Georgia,serif" fontSize="21" fontWeight="700" fill="#1a1a1a" textAnchor="middle">Navin's</text>
        <text x="44" y="58" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="500" fill="#b8946a" textAnchor="middle" letterSpacing="3">BUILDERS</text>
      </svg>
    ),
    builderName: "Navin's", since: 'Since 1970 · 60+ Projects', badge: 'Heritage',
    tagline: "One of Chennai's oldest and most respected developers with 5 decades of trust and a legacy of landmark projects across the city.",
    projects: [["Navin's Sunridge",'Siruseri, OMR'],["Navin's Montania",'Guduvanchery'],["Navin's Cosmocity",'Poonamallee']],
    stat1: <><strong>2 &amp; 3BHK</strong> from ₹52L</>, stat2: <><strong>Ready</strong> to move</>
  },
  {
    cat: 'luxury',
    id: 'brigade',
    name: 'brigade xanadu bricklane el dorado mogappair koyambedu perambur',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#1b3a6b"/>
        <rect x="10" y="48" width="68" height="30" fill="#b8946a"/>
        <polygon points="10,48 44,16 78,48" fill="#2a5298"/>
        <text x="44" y="67" fontFamily="Arial,sans-serif" fontSize="10" fontWeight="900" fill="#fff" textAnchor="middle" letterSpacing="2">BRIGADE</text>
      </svg>
    ),
    builderName: 'Brigade Group', since: 'Since 1986 · 35+ Years', badge: 'Luxury',
    tagline: 'A pan-South India real estate giant known for integrated townships, luxury residences, and award-winning community living.',
    projects: [['Brigade Xanadu Phase 3','Mogappair'],['Brigade Bricklane','Koyambedu'],['Brigade El Dorado','Perambur']],
    stat1: <><strong>2–4BHK</strong> from ₹75L</>, stat2: <><strong>NSE</strong> Listed</>
  },
  {
    cat: 'affordable',
    id: 'urban-rise',
    name: 'urban rise greenfields heights bliss vandalur tambaram urapakkam',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#0e0e0e"/>
        <rect x="14" y="52" width="12" height="26" fill="#b8946a"/>
        <rect x="30" y="38" width="12" height="40" fill="#d4b896"/>
        <rect x="46" y="28" width="12" height="50" fill="#b8946a"/>
        <rect x="62" y="44" width="12" height="34" fill="#d4b896"/>
        <text x="44" y="18" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="700" fill="#ffffff" textAnchor="middle" letterSpacing="2">URBAN RISE</text>
      </svg>
    ),
    builderName: 'Urban Rise', since: 'Emerging · Fast Growing', badge: 'Value',
    tagline: "Young and dynamic developer focused on delivering smart, value-for-money homes in Chennai's high-growth suburban corridors.",
    projects: [['Urban Rise Greenfields','Vandalur'],['Urban Rise Heights','Tambaram'],['Urban Rise Bliss','Urapakkam']],
    stat1: <><strong>2BHK</strong> from ₹38L</>, stat2: <><strong>RERA</strong> Approved</>
  },
  {
    cat: 'luxury',
    id: 'prestige',
    name: 'prestige bella vista leela residences park grove iyyappanthangal anna nagar whitefield',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#fff"/>
        <circle cx="44" cy="36" r="24" fill="none" stroke="#c8a951" strokeWidth="2"/>
        <circle cx="44" cy="36" r="18" fill="#c8a951"/>
        <text x="44" y="40" fontFamily="Georgia,serif" fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle">PRESTIGE</text>
        <text x="44" y="70" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="600" fill="#1a1a1a" textAnchor="middle" letterSpacing="2">GROUP</text>
      </svg>
    ),
    builderName: 'Prestige Group', since: 'Since 1986 · Pan India', badge: 'Ultra Luxury',
    tagline: "India's premier luxury real estate developer, now redefining Chennai's skyline with world-class design and branded living.",
    projects: [['Prestige Bella Vista','Iyyappanthangal'],['Prestige Leela Residences','Anna Nagar'],['Prestige Park Grove','Whitefield Zone']],
    stat1: <><strong>3 &amp; 4BHK</strong> from ₹1.2Cr</>, stat2: <><strong>BSE</strong> Listed</>
  },
  {
    cat: 'affordable plots',
    id: 'dac',
    name: 'dac serene gardens prime plots harmony kelambakkam maraimalai nagar guduvanchery',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#2c5f2e"/>
        <text x="44" y="46" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="900" fill="#ffffff" textAnchor="middle" letterSpacing="2">DAC</text>
        <rect x="14" y="54" width="60" height="2" fill="#b8946a"/>
        <text x="44" y="66" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="600" fill="#b8946a" textAnchor="middle" letterSpacing="2">DEVELOPERS</text>
      </svg>
    ),
    builderName: 'DAC Developers', since: 'Chennai Based · Trusted', badge: 'Local Expert',
    tagline: 'A Chennai-focused developer with deep local market expertise, known for thoughtfully designed homes and plot developments.',
    projects: [['DAC Serene Gardens','Kelambakkam'],['DAC Prime Plots','Maraimalai Nagar'],['DAC Harmony','Guduvanchery']],
    stat1: <><strong>Plots</strong> from ₹22L</>, stat2: <><strong>DTCP</strong> Approved</>
  },
  {
    cat: 'affordable luxury',
    id: 'shriram',
    name: 'shriram summitt park 63 greenfield perambur poonamallee guduvanchery',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#fff"/>
        <rect x="8" y="8" width="72" height="72" fill="#e8f4e8"/>
        <path d="M44 18 L62 30 L62 58 L44 70 L26 58 L26 30 Z" fill="#2d7a2d" stroke="#1a5c1a" strokeWidth="1.5"/>
        <text x="44" y="42" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="900" fill="#fff" textAnchor="middle">SHRIRAM</text>
        <text x="44" y="55" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="600" fill="#b8946a" textAnchor="middle" letterSpacing="1">PROPERTIES</text>
      </svg>
    ),
    builderName: 'Shriram Properties', since: 'Since 1995 · NSE Listed', badge: 'RERA ✓',
    tagline: 'Part of the Shriram Group empire, offering value-driven homes with strong after-sale support across South India\'s key markets.',
    projects: [['Shriram Summitt','Perambur'],['Shriram Park 63','Poonamallee'],['Shriram Greenfield','Guduvanchery']],
    stat1: <><strong>2 &amp; 3BHK</strong> from ₹45L</>, stat2: <><strong>NSE</strong> Listed</>
  },
  {
    cat: 'luxury',
    id: 'taj-residence',
    name: 'taj grandeur imperial suites riviera adyar nungambakkam ecr kovalam',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#1a1209"/>
        <path d="M44 12 L50 30 L68 30 L54 41 L59 58 L44 47 L29 58 L34 41 L20 30 L38 30 Z" fill="#b8946a"/>
        <text x="44" y="72" fontFamily="Georgia,serif" fontSize="9" fontWeight="700" fill="#d4b896" textAnchor="middle" letterSpacing="3">TAJ RESIDENCE</text>
      </svg>
    ),
    builderName: 'TAJ Residence', since: 'Luxury Boutique Developer', badge: 'Boutique',
    tagline: 'Boutique luxury developer creating bespoke residences with handcrafted interiors and exclusive low-density living experiences.',
    projects: [['TAJ Grandeur','Adyar'],['TAJ Imperial Suites','Nungambakkam'],['TAJ Riviera','ECR, Kovalam']],
    stat1: <><strong>3 &amp; 4BHK</strong> from ₹1.5Cr</>, stat2: <><strong>Ultra</strong> Luxury</>
  },
  {
    cat: 'affordable',
    id: 'radian',
    name: 'radian aura one solstice medavakkam velachery chromepet',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#fff"/>
        <circle cx="44" cy="44" r="32" fill="none" stroke="#0055a5" strokeWidth="3"/>
        <path d="M28 30 L28 58 M28 30 L44 30 Q56 30 56 40 Q56 50 44 50 L28 50" fill="none" stroke="#0055a5" strokeWidth="3" strokeLinecap="round"/>
        <line x1="40" y1="50" x2="56" y2="58" stroke="#0055a5" strokeWidth="3" strokeLinecap="round"/>
        <text x="44" y="78" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="700" fill="#0055a5" textAnchor="middle" letterSpacing="3">RADIAN</text>
      </svg>
    ),
    builderName: 'Radian', since: 'Chennai Specialist', badge: 'Value',
    tagline: 'Specialising in thoughtfully priced homes with modern design sensibilities for first-time buyers and growing families in Chennai.',
    projects: [['Radian Aura','Medavakkam'],['Radian One','Velachery'],['Radian Solstice','Chromepet']],
    stat1: <><strong>2BHK</strong> from ₹42L</>, stat2: <><strong>RERA</strong> Approved</>
  },
  {
    cat: 'luxury',
    id: 'godrej',
    name: 'godrej sunrise estate ananda garden city oragadam dooravani nagar',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#006341"/>
        <text x="44" y="36" fontFamily="Georgia,serif" fontSize="18" fontWeight="700" fill="#ffffff" textAnchor="middle" letterSpacing="1">Godrej</text>
        <rect x="14" y="42" width="60" height="1.5" fill="#b8946a"/>
        <text x="44" y="56" fontFamily="Arial,sans-serif" fontSize="7.5" fontWeight="600" fill="#d4b896" textAnchor="middle" letterSpacing="2">PROPERTIES</text>
        <text x="44" y="68" fontFamily="Arial,sans-serif" fontSize="6" fill="rgba(255,255,255,0.5)" textAnchor="middle" letterSpacing="1">EST. 1897</text>
      </svg>
    ),
    builderName: 'Godrej Properties', since: 'Since 1897 · 125+ Yr Legacy', badge: 'Legacy Brand',
    tagline: 'A century-old legacy brand now transforming Chennai with flagship integrated communities and premium residences.',
    projects: [['Godrej Sunrise Estate','Oragadam'],['Godrej Ananda','Dooravani Nagar'],['Godrej Garden City','Oragadam']],
    stat1: <><strong>2–4BHK</strong> from ₹65L</>, stat2: <><strong>BSE</strong> Listed</>
  },
  {
    cat: 'affordable luxury',
    id: 'nu-tech',
    name: 'nu tech smartville nova nexus padur siruseri navalur omr',
    logo: (
      <svg viewBox="0 0 88 88" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
        <rect width="88" height="88" fill="#0f1923"/>
        <text x="44" y="38" fontFamily="Arial,sans-serif" fontSize="26" fontWeight="900" fill="#b8946a" textAnchor="middle" letterSpacing="4">NU</text>
        <rect x="14" y="46" width="60" height="1" fill="#b8946a"/>
        <text x="44" y="60" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="600" fill="#ffffff" textAnchor="middle" letterSpacing="3">TECH</text>
      </svg>
    ),
    builderName: 'NU Tech', since: 'Smart Home Specialists', badge: 'Smart',
    tagline: 'A tech-integrated developer pioneering smart home features, sustainable construction, and connected community living in Chennai.',
    projects: [['NU Tech SmartVille','Padur, OMR'],['NU Tech Nova','Siruseri'],['NU Tech Nexus','Navalur']],
    stat1: <><strong>2 &amp; 3BHK</strong> from ₹50L</>, stat2: <><strong>Smart</strong> Homes</>
  },
]

const marqueeNames = ['Casagrand','TVS Emerald',"Navin's",'Brigade Group','Prestige Group','G Square','Godrej Properties','Puravankara','VGN','Shriram Properties','Urban Rise','Radian','TAJ Residence','DAC Developers','NU Tech','Lifestyle']

export default function Partners() {
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => { document.body.style.transition = 'opacity 0.5s ease'; document.body.style.opacity = '1' }, 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setTimeout(() => document.getElementById('heroBg')?.classList.add('loaded'), 80)
  }, [])

  const filtered = builders.filter(b => {
    const catMatch = activeCat === 'all' || b.cat.includes(activeCat)
    const searchMatch = search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.builderName.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  return (
    <>
      <Seo
        title="Real Estate Builders and Channel Partners"
        description="Explore Estates61 partner builders, verified real estate developers, RERA-listed projects, apartments, villas, and plotted developments across Chennai."
        keywords="real estate builders Chennai, property developers Chennai, RERA builders, channel partner Chennai, verified builder projects"
        path="/partners"
      />
      {/* HERO */}
      <section className="partners-hero">
        <div className="partners-hero-bg" id="heroBg"></div>
        <div className="partners-hero-overlay"></div>
        <div className="hero-grid-pattern"></div>
        <div className="hero-stat-float">
          <div className="hero-stat-badge">
            <div className="stat-num">100<span style={{fontSize:'1.4rem'}}>+</span></div>
            <div className="stat-label">Builder Partners</div>
          </div>
          <div className="hero-stat-badge">
            <div className="stat-num">500<span style={{fontSize:'1.4rem'}}>+</span></div>
            <div className="stat-label">Projects Listed</div>
          </div>
          <div className="hero-stat-badge">
            <div className="stat-num">18</div>
            <div className="stat-label">Years Combined</div>
          </div>
        </div>
        <div className="partners-hero-content">
          <div className="breadcrumb">
            <Link to="/" style={{color:'var(--gold)',textDecoration:'none'}}>Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Our Partners</span>
          </div>
          <div className="hero-tag">Trusted Builder Network</div>
          <h1>Built on <em>Trust,</em><br />Driven by <em>Excellence</em></h1>
          <p>We partner exclusively with Chennai's most reputed developers — builders who share our commitment to quality, transparency, and homebuyer trust.</p>
        </div>
        <div className="hero-scroll"><span>Scroll</span><div className="hero-scroll-line"></div></div>
      </section>

      {/* QUOTE STRIP */}
      <div className="quote-strip">
        <div className="quote-text">"A home is not just bricks and mortar —<br />it's the story of a <em>builder's promise kept.</em>"</div>
        <div className="quote-divider"></div>
        <div className="quote-meta">
          <div className="big-num">100+</div>
          <div className="big-label">Premium Builder Partners Across Chennai</div>
        </div>
      </div>

      {/* FILTER + SEARCH */}
      <div className="filter-search-bar" id="our-partners">
        <div className="filter-group">
          <span className="filter-label">Our Builders</span>
          {[['all','All Builders'],['luxury','Luxury'],['affordable','Affordable'],['plots','Plots & Villas']].map(([cat, label]) => (
            <button key={cat} className={`filter-btn${activeCat === cat ? ' active' : ''}`} onClick={() => setActiveCat(cat)}>{label}</button>
          ))}
        </div>
        <div className="filter-sep"></div>
        <div className="partner-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="partner-search-input" type="text" placeholder="Search builders or projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* BUILDERS GRID */}
      <section className="builders-section">
        <div className="builders-grid" id="buildersGrid">
          {filtered.map((b, i) => (
            <div className="builder-card" key={i}>
              <div className="builder-card-top">
                <div className="builder-logo-wrap">{b.logo}</div>
                <div className="builder-info">
                  <div className="builder-name">{b.builderName}</div>
                  <div className="builder-since">{b.since}</div>
                </div>
                <div className="builder-badge">{b.badge}</div>
              </div>
              <div className="builder-card-body">
                <p className="builder-tagline">{b.tagline}</p>
                <div className="projects-label">Ongoing Projects</div>
                {b.projects.map(([pname, loc], j) => (
                  <div className="project-pill" key={j}>
                    <span className="project-dot"></span>
                    <span className="project-name">{pname}</span>
                    <span className="project-loc">{loc}</span>
                  </div>
                ))}
              </div>
              <div className="builder-card-footer">
                <div className="builder-stat-row">
                  <span className="builder-stat">{b.stat1}</span>
                  <span className="builder-stat">{b.stat2}</span>
                </div>
                <Link to={`/partners/${b.id}`} className="builder-link">View →</Link>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="no-results show">No builders found matching your search. Try a different keyword.</div>
        )}
      </section>

      {/* CREDAI BAND */}
      <div className="credai-band fade-up">
        <div className="credai-icon">CREDAI</div>
        <div className="credai-body">
          <div className="credai-tag">Industry Association Partner</div>
          <div className="credai-name">CREDAI — Confederation of Real Estate Developers' Associations of India</div>
          <p className="credai-desc">Estates61 is proud to work within the CREDAI ecosystem — India's apex body for private real estate developers, ensuring every builder we partner with adheres to ethical practices, RERA compliance, and quality standards.</p>
        </div>
        <div className="credai-badge">
          <div className="cb-num">21,000+</div>
          <div className="cb-label">Members Nationwide</div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-label">Our Builder Network</div>
        <div className="marquee-track" id="marqueeTrack">
          {[...marqueeNames, ...marqueeNames].map((name, i) => (
            <div className="marquee-item" key={i}>
              <span className="marquee-item-name">{name}</span>
              <span className="marquee-item-dot"></span>
            </div>
          ))}
        </div>
      </div>

      {/* WHY OUR PARTNERS */}
      <section className="why-section">
        <div className="why-text fade-up">
          <div className="section-label-gold">Our Standard</div>
          <h2 className="section-title-main">Every Builder We List<br />is <em>Handpicked</em></h2>
          <p>We don't work with everyone. Our builder vetting process is rigorous — because your home is the most important investment of your life, and we take that seriously.</p>
          <div className="why-points">
            {[
              { icon:'✓', title:'RERA & Legal Compliance', desc:'Every project listed on Estates61 is RERA registered and legally vetted by our team.' },
              { icon:'🏆', title:'Track Record of Delivery', desc:'We partner only with builders who have demonstrated consistent on-time delivery and quality.' },
              { icon:'💬', title:'Verified Customer Reviews', desc:'Real homeowner testimonials are part of our builder evaluation process — not just project brochures.' },
              { icon:'🤝', title:'No Hidden Charges', desc:'Total price transparency. Our partners are committed to the same no-surprise pricing philosophy we are.' },
            ].map((p, i) => (
              <div className="why-point" key={i}>
                <div className="why-point-icon">{p.icon}</div>
                <div>
                  <div className="why-point-title">{p.title}</div>
                  <div className="why-point-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="why-image-wrap fade-up">
          <img className="why-image" src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" alt="Builder meeting" />
          <div className="why-image-tag">
            <div className="tag-num">100+</div>
            <div className="tag-label">Trusted Builder Partners</div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <div className="cta-band">
        <div>
          <h2>Want to explore projects<br />from our <em>builder partners?</em></h2>
          <p>Our consultants will match you with the perfect builder and project for your budget and lifestyle.</p>
        </div>
        <Link to="/contact" className="btn-cta">📞 Talk to a Consultant</Link>
      </div>

      {/* FLOAT BUTTONS */}
      <div className="float-bar">
        <a href="tel:07969061234" className="float-btn float-call" title="Call Us">📞</a>
        <a href="https://wa.me/917969061234" className="float-btn float-wa" title="WhatsApp">💬</a>
      </div>
    </>
  )
}
