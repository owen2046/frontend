import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitInquiry } from '../api/client'
import Seo from '../components/Seo'
import FormNotice from '../components/FormNotice'

const faqs = [
  { q: 'How quickly will someone respond after I fill the form?', a: 'Our advisors typically respond within 30 minutes during business hours (9 AM–7 PM, Mon–Sat). For emails, we aim to respond within 4 working hours. All enquiries are treated with complete confidentiality.' },
  { q: 'Do you charge buyers a fee for your services?', a: "No. Estates61's advisory and property search services are completely free for buyers. We work as authorised channel partners for developers and charge brokerage only on successful transactions." },
  { q: "I'm an NRI. Can you manage the entire purchase remotely?", a: 'Yes. We specialise in NRI transactions. We handle virtual site visits via video call, RERA verification, Power of Attorney drafting, bank account setup guidance, and complete property registration — without you needing to travel.' },
  { q: 'How do you verify that properties are RERA registered?', a: 'Our in-house legal team cross-verifies every property against the Tamil Nadu RERA portal (TNRERA) before listing. We also conduct physical site visits and builder background checks. We only partner with builders who have a proven delivery track record.' },
  { q: "Can you help with home loans even if I've been rejected?", a: 'Yes. Our finance team has helped many clients improve their CIBIL score, restructure applications, and approach the right lenders. We work with 12+ banks and NBFCs and know which lenders suit different financial profiles.' },
  { q: 'What is land aggregation and do you still offer it?', a: 'Land aggregation is the process of consolidating multiple smaller land parcels into one larger parcel for development. Estates61 has been Chennai\'s premier land aggregation specialist since 2002, with deep expertise in identifying, valuing and assembling land packages for developers and investors.' },
]

const services = [
  { icon:'🏡', title:'Property Search & Curation', desc:'We shortlist only 3 verified, curated options matching your brief — no spam, no broker bombardment. Every listing is RERA registered and physically verified.' },
  { icon:'🌏', title:'NRI Property Services', desc:'Power of Attorney management, RERA checks, virtual site visits and complete registration — managed end-to-end for buyers in Dubai, Singapore, USA and beyond.' },
  { icon:'🏦', title:'Home Loan Assistance', desc:'We partner with 12 leading banks. Our in-house finance team compares rates, processes documentation and fast-tracks approvals — typically within 4 working days.' },
  { icon:'⚖️', title:'Legal & Title Verification', desc:'Our in-house legal counsel conducts thorough title searches, RERA compliance checks and encumbrance verification before any transaction is finalised.' },
  { icon:'🗺️', title:'Land Aggregation', desc:"Since 2002, Estates61 has been Chennai's premier land aggregation specialist — identifying, consolidating and delivering prime land parcels for investors and developers." },
  { icon:'📊', title:'Property Valuation', desc:'Accurate, data-driven property valuations based on current market rates, guideline values, location premiums and comparable transactions across Chennai.' },
]

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.width = (window.scrollY / total * 100).toFixed(1) + '%'
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
  }, [])

  useEffect(() => {
    document.body.style.opacity = '0'
    const t = setTimeout(() => { document.body.style.transition = 'opacity 0.5s ease'; document.body.style.opacity = '1' }, 50)
    return () => clearTimeout(t)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    const name = e.target.querySelector('#cf-name')?.value || ''
    const phone = e.target.querySelector('#cf-phone')?.value || ''
    const email = e.target.querySelector('#cf-email')?.value || ''
    const interest = e.target.querySelector('#cf-interest')?.value || ''
    const budget = e.target.querySelector('#cf-budget')?.value || ''
    const city = e.target.querySelector('#cf-city')?.value || ''
    const message = e.target.querySelector('#cf-msg')?.value || ''

    setSubmitting(true)
    try {
      await submitInquiry({
        name,
        phone,
        email,
        interest,
        budget,
        city,
        message,
        source: 'contact-page',
        pagePath: window.location.pathname,
        requestType: interest || 'Contact form',
      })
      setNotice({ type: 'success', message: `Thank you, ${name || 'there'}. Our advisor will reach out within 30 minutes.` })
      e.target.reset()
    } catch {
      setNotice({ type: 'error', message: 'Sorry, we could not submit your message right now. Please try again in a moment.' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setNotice(null), 5000)
    }
  }

  return (
    <>
      <Seo
        title="Contact Real Estate Advisors in Chennai"
        description="Contact Estates61 for verified property search, home loan assistance, NRI property services, valuation, land aggregation, and real estate advisory in Chennai."
        keywords="contact real estate advisor Chennai, property consultant Chennai, home loan assistance Chennai, NRI property services Chennai, land aggregation Chennai"
        path="/contact"
      />
      <div className="scroll-progress" ref={progressRef} />

      {/* PAGE HERO */}
      <section className="contact-page-hero">
        <div className="contact-page-hero-bg">
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80&auto=format" alt="Contact Estates61" loading="eager" />
          <div className="page-hero-overlay"></div>
        </div>
        <div className="hero-grid"></div>
        <div className="page-hero-content">
          <div className="breadcrumb">
            <Link to="/" style={{color:'var(--gold)',textDecoration:'none'}}>Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Contact</span>
          </div>
          <div className="page-hero-tag">Get in Touch</div>
          <h1>Let's Find Your<br /><em>Perfect Space</em></h1>
          <p>Our advisors are available Mon–Sat, 9 AM–7 PM. Reach us by call, WhatsApp, email, or walk into any of our Chennai offices.</p>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <div className="contact-strip">
        {[
          { icon:'📞', label:'Phone & WhatsApp', value:<a href="tel:07969061234">079 6906 1234</a> },
          { icon:'✉️', label:'Email', value:<a href="mailto:digital@estates61.com">digital@estates61.com</a> },
          { icon:'📍', label:'Head Office', value:'No 61, Perungudi, Chennai 600096' },
          { icon:'🕐', label:'Working Hours', value:'Mon – Sat: 9:00 AM – 7:00 PM' },
        ].map((item, i) => (
          <div className="contact-strip-item" key={i}>
            <div className="cs-icon">{item.icon}</div>
            <div>
              <div className="cs-label">{item.label}</div>
              <div className="cs-value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTACT BLOCK */}
      <div className="contact-main">

        {/* LEFT: INFO */}
        <div className="contact-info-side reveal">
          <div className="section-label">Reach Us</div>
          <h2>We're Here to<br /><em>Help You</em></h2>

          {[
            { label:'Head Office — Chennai', value:<>No 61, Developed Plots Estate<br />Perungudi, Chennai – 600 096</>, sub:'Tamil Nadu, India' },
            { label:'Phone & WhatsApp', value:<a href="tel:07969061234">079 6906 1234</a>, sub:'Calls answered Mon–Sat, 9 AM–7 PM' },
            { label:'Email', value:<a href="mailto:digital@estates61.com">digital@estates61.com</a>, sub:'We respond within 4 working hours' },
            { label:'RERA Registration', value:'Certified Real Estate Agent', sub:'RERA Reg. No. TN/RERA/AGENT/00123/2019' },
          ].map((d, i) => (
            <div className="contact-detail-block" key={i}>
              <div className="cd-label">{d.label}</div>
              <div className="cd-value">{d.value}</div>
              <div className="cd-sub">{d.sub}</div>
            </div>
          ))}

          {/* Map Placeholder */}
          <div className="map-placeholder">
            <div className="map-pin-row">
              <span>📍</span>
              <p>No 61, Developed Plots Estate<br />Perungudi, Chennai 600096</p>
              <a href="https://maps.google.com/?q=Perungudi+Chennai" target="_blank" rel="noreferrer">Open in Google Maps →</a>
            </div>
          </div>

          {/* Social */}
          <div className="social-row">
            <a href="https://www.instagram.com/estates61.chennai/" target="_blank" rel="noreferrer" className="social-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              Instagram
            </a>
            <a href="https://in.linkedin.com/company/estates61" target="_blank" rel="noreferrer" className="social-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </a>
            <a href="https://wa.me/917969061234" target="_blank" rel="noreferrer" className="social-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="contact-form-side reveal">
          <h3>Send Us a Message</h3>
          <p>Our advisor will reach out within 30 minutes during business hours.</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label htmlFor="cf-name">Full Name *</label><input type="text" id="cf-name" placeholder="Your full name" required /></div>
              <div className="form-group"><label htmlFor="cf-phone">Phone Number *</label><input type="tel" id="cf-phone" placeholder="+91 00000 00000" required /></div>
            </div>
            <div className="form-group"><label htmlFor="cf-email">Email Address</label><input type="email" id="cf-email" placeholder="your@email.com" /></div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cf-interest">I'm Interested In</label>
                <select id="cf-interest">
                  <option value="">Select enquiry type</option>
                  <option>Buying a Property</option><option>Selling a Property</option><option>Rental</option>
                  <option>Investment Advisory</option><option>Home Loan Assistance</option>
                  <option>NRI Services</option><option>Land Aggregation</option><option>Valuation</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cf-budget">Budget Range</label>
                <select id="cf-budget">
                  <option value="">Select budget</option>
                  <option>Under ₹50 Lakh</option><option>₹50L – ₹1 Crore</option>
                  <option>₹1Cr – ₹3Cr</option><option>₹3Cr – ₹5Cr</option><option>Above ₹5 Crore</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label htmlFor="cf-city">Preferred City / Locality</label><input type="text" id="cf-city" placeholder="e.g. OMR Chennai, Anna Nagar, Adyar..." /></div>
            <div className="form-group"><label htmlFor="cf-msg">Message</label><textarea id="cf-msg" placeholder="Tell us what you're looking for — budget, timeline, BHK requirement, or any questions..."></textarea></div>
            <button type="submit" className="submit-btn" disabled={submitting} style={submitting ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}>
              {submitting ? 'Sending…' : 'Send Message →'}
            </button>
            <p className="form-note">Your details are completely confidential. We will never share your information without consent.</p>
          </form>
        </div>
      </div>

      {/* SERVICES */}
      <section className="services-strip reveal">
        <div className="services-strip-head">
          <div className="section-label">How We Help</div>
          <h2>Our <em>Services</em></h2>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <a href="#" className="service-link">Learn More →</a>
            </div>
          ))}
        </div>
      </section>

      {/* OFFICES */}
      <div className="offices-band reveal">
        <div className="offices-band-head">
          <div className="ol">Our Presence</div>
          <h2>Where to <em>Find Us</em></h2>
        </div>
        <div className="offices-grid">
          {[
            { city:'Chennai', tag:'Head Office', addr:<>No 61, Developed Plots Estate<br />Perungudi, Chennai – 600 096</> },
            { city:'Chennai — OMR', tag:'Branch Office', addr:<>Sholinganallur, Old Mahabalipuram Road<br />Chennai – 600 119</> },
            { city:'Chennai — Anna Nagar', tag:'Sales Office', addr:<>2nd Avenue, Anna Nagar<br />Chennai – 600 040</> },
          ].map((o, i) => (
            <div className="office-card" key={i}>
              <div className="office-city">{o.city}</div>
              <div className="office-tag">{o.tag}</div>
              <div className="office-addr">{o.addr}</div>
              <div className="office-phone"><a href="tel:07969061234">079 6906 1234</a></div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="faq-section reveal">
        <div className="s-label">Common Questions</div>
        <h2>Frequently <em>Asked</em></h2>
        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                <span className="faq-q-text">{faq.q}</span>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FLOAT BUTTONS */}
      <div className="float-bar">
        <a href="tel:07969061234" className="float-btn float-call" title="Call Us">📞</a>
        <a href="https://wa.me/917969061234" className="float-btn float-wa" title="WhatsApp">💬</a>
      </div>
      <FormNotice notice={notice} />
    </>
  )
}
