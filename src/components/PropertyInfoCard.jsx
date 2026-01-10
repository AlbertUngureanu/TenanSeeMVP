import './PropertyInfoCard.css'

function PropertyInfoCard({ property }) {
  const {
    title,
    address,
    rooms,
    bathrooms,
    surface,
    monthly_cost,
    monthlyCost,
    description
  } = property
  
  // Support both snake_case (from backend) and camelCase
  const displayMonthlyCost = monthly_cost || monthlyCost

  return (
    <div className="property-info-card">
      <h1 className="property-title">
        {title || '<Titlu Proprietate>'}
      </h1>

      <div className="property-details">
        <div className="detail-item">
          <div className="detail-icon">📍</div>
          <span className="detail-text">{address || '<Adresa proprietate>'}</span>
        </div>

        <div className="detail-item">
          <div className="detail-icon">🛏️</div>
          <span className="detail-text">{rooms ? `${rooms} camere` : '<Numar camere>'}</span>
        </div>

        <div className="detail-item">
          <div className="detail-icon">🚿</div>
          <span className="detail-text">{bathrooms ? `${bathrooms} băi` : '<Numar bai>'}</span>
        </div>

        <div className="detail-item">
          <div className="detail-icon">📐</div>
          <span className="detail-text">{surface ? `${surface} m²` : '<Suprafata>'}</span>
        </div>

        <div className="detail-item">
          <div className="detail-icon">💰</div>
          <span className="detail-text">{displayMonthlyCost || '<Cost lunar>'}</span>
        </div>
      </div>

      <div className="property-description-section">
        <h3 className="description-title">Descriere</h3>
        <p className="property-description">
          {description || '<Descriere detaliata a proprietatii>'}
        </p>
      </div>
    </div>
  )
}

export default PropertyInfoCard

