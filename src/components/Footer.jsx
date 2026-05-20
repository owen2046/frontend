import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer style={{ background: '#1C1C1E', color: '#fff' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '40px',
        padding: '64px 4vw',
      }} className="footer-grid">

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <img src={logo} alt="Estates 61 Logo" style={{ height: '38px', maxWidth: '140px', objectFit: 'contain' }} />
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontWeight: 300, maxWidth: '260px', margin: 0 }}>
            Crafting premium property experiences across India since 2002. Trust, transparency, and excellence.
          </p>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>📞 079 6906 1234</span>
            <a href="mailto:digital@estates61.com" style={{ color: '#D4B896', textDecoration: 'none' }}>digital@estates61.com</a>
          </div>
        </div>

        {/* Properties */}
        <div>
          <h5 style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8946A', marginBottom: '16px', fontWeight: 500 }}>
            Properties
          </h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Residential', 'Commercial', 'Villas', 'Plots', 'New Launches'].map(item => (
              <li key={item}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={e => e.target.style.color = '#B8946A'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                >{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h5 style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8946A', marginBottom: '16px', fontWeight: 500 }}>
            Company
          </h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>About Us</Link></li>
            <li><Link to="/partners" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Our Partners</Link></li>
            <li><Link to="/insights" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Insights</Link></li>
            <li><Link to="/contact" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</Link></li>
            <li><a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Careers</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h5 style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8946A', marginBottom: '16px', fontWeight: 500 }}>
            Services
          </h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Home Loans', 'Legal Assistance', 'NRI Services', 'Land Aggregation', 'Valuation'].map(item => (
              <li key={item}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={e => e.target.style.color = '#B8946A'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                >{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '20px 4vw',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © 2025 Estates61 Pvt. Ltd. All rights reserved. RERA Reg. No. TN/RERA/AGENT/00123/2019
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: 'Instagram', href: 'https://www.instagram.com/estates61.chennai/' },
            { label: 'LinkedIn', href: 'https://in.linkedin.com/company/estates61' },
            { label: 'WhatsApp', href: 'https://wa.me/917969061234' },
            { label: 'YouTube', href: '#' },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
              style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = '#B8946A'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Footer responsive */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
