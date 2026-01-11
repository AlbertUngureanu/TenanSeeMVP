import { Link, useSearchParams } from 'react-router-dom'
import logo from './images/logo.png';
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
            <img 
              src={logo}
              alt="TenanSee Logo" 
              className="image"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

