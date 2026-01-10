import { Link, useSearchParams } from 'react-router-dom'
import './Hero.css'

function Hero({ stats }) {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Transparență și încredere între{' '}
            <span className="hero-title-emphasis">chiriași și proprietari</span>
          </h1>
          <p className="hero-description">
            Răsfoiește anunțurile, discută în siguranță și programează vizionări. 
            Totul într-un singur loc.
          </p>
          <Link to="/login?register=true" className="hero-cta">
            Alătură-te
          </Link>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <svg width="100%" height="100%" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="400" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
              <line x1="0" y1="0" x2="600" y2="400" stroke="#999" strokeWidth="2"/>
              <line x1="600" y1="0" x2="0" y2="400" stroke="#999" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

