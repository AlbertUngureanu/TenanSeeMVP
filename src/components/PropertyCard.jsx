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

  const imagess = import.meta.glob('./images/anunturi/*.jpg', { eager: true });
  const imageList = Object.values(imagess);

  return (
    <div className="property-card" onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="property-image">
        {displayImage ? (
          <img src={displayImage} alt={description} />
        ) : (
          <div className="image-placeholder">
            <img 
              src={imageList[id-1].default}
              alt="Property thumbnail" 
              className="image"
            />
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

