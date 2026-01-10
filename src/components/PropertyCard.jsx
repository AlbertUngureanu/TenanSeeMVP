import { Link } from 'react-router-dom'
import './PropertyCard.css'

function PropertyCard({ property, onClick }) {
  const { id, price, description, image, images } = property
  const displayImage = image || (images && images.length > 0 ? images[0].url : null)

  const handleClick = () => {
    if (onClick) {
      onClick(id)
    }
  }

  return (
    <div className="property-card" onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="property-image">
        {displayImage ? (
          <img src={displayImage} alt={description} />
        ) : (
          <div className="image-placeholder">
            <svg width="100%" height="100%" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="300" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
              <line x1="0" y1="0" x2="400" y2="300" stroke="#999" strokeWidth="2"/>
              <line x1="400" y1="0" x2="0" y2="300" stroke="#999" strokeWidth="2"/>
            </svg>
          </div>
        )}
      </div>
      <div className="property-info">
        <div className="property-price">{price || '<Preț chirie proprietate>'}</div>
        <div className="property-description">{description || '<Descriere proprietate>'}</div>
        {!onClick && (
          <Link to={`/proprietate/${id}`} className="view-details-btn" onClick={(e) => e.stopPropagation()}>
            Vezi Detalii
          </Link>
        )}
      </div>
    </div>
  )
}

export default PropertyCard

