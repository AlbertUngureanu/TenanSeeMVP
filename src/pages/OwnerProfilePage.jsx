import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import PropertyCard from '../components/PropertyCard'
import ReviewsList from '../components/ReviewsList'
import { apiService } from '../services/apiService'
import './OwnerProfilePage.css'
import l1 from '../components/images/anunturi/lanlord1.jpg';
import l2 from '../components/images/anunturi/landlord2.jpg';
'../'

function OwnerProfilePage() {
  const { ownerId } = useParams()
  const navigate = useNavigate()
  const [owner, setOwner] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ownerId) {
      loadOwnerProfile()
      loadOwnerProperties()
    }
  }, [ownerId])

  const loadOwnerProfile = async () => {
    try {
      // Get owner info from reviews endpoint (which includes owner_id)
      const reviewsData = await apiService.getOwnerReviews(ownerId)
      // We need to get owner details - let's use the first property's owner or create a separate endpoint
      // For now, we'll get owner info from properties
      const propertiesData = await apiService.getOwnerProperties(ownerId)
      if (propertiesData.length > 0 && propertiesData[0].owner) {
        setOwner(propertiesData[0].owner)
      }
    } catch (err) {
      console.error('Error loading owner profile:', err)
      setError('Nu s-a putut încărca profilul proprietarului.')
    }
  }

  const loadOwnerProperties = async () => {
    setLoading(true)
    try {
      const data = await apiService.getOwnerProperties(ownerId)
      // Format properties for PropertyCard component
      const formattedProperties = (data || []).map(prop => ({
        id: prop.id,
        price: prop.price,
        description: prop.description || prop.title,
        image: prop.images && prop.images.length > 0 ? prop.images[0].url : null,
        images: prop.images,
        location: prop.city || prop.address,
        rooms: prop.rooms,
        type: prop.transaction_type || prop.property_type
      }))
      setProperties(formattedProperties)
    } catch (err) {
      console.error('Error loading owner properties:', err)
      setError('Nu s-au putut încărca proprietățile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (propertyId) => {
    navigate(`/proprietate/${propertyId}`)
  }

  if (loading && !owner) {
    return (
      <div className="owner-profile-page">
        <Header />
        <div className="loading-container">
          <p>Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error && !owner) {
    return (
      <div className="owner-profile-page">
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <Link to="/lista-anunturi" className="back-button">
            Înapoi la listare
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="owner-profile-page">
      <Header />
      <div className="owner-profile-container">
        <div className="back-button-container">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Înapoi
          </button>
        </div>

        {/* Owner Header Section */}
        <div className="owner-header">
          <div className="owner-avatar">
              <img src={owner?.name == "Alexandra Popescu" ? l2 : l1} alt={owner.name || 'Owner'} />
          </div>
          <div className="owner-header-info">
            <h1 className="owner-name">{owner?.name || 'Proprietar'}</h1>
            {owner?.account_created_year && (
              <p className="owner-account-year">
                Cont creat în 2026
              </p>
            )}
            {owner?.profile_description && (
              <p className="owner-description">{owner.profile_description}</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="owner-reviews-section">
          <ReviewsList ownerId={parseInt(ownerId)} />
        </div>

        {/* Properties Section */}
        <div className="owner-properties-section">
          <h2 className="section-title">
            Proprietăți listate ({properties.length})
          </h2>
          {loading ? (
            <p className="loading-text">Se încarcă proprietățile...</p>
          ) : properties.length === 0 ? (
            <p className="no-properties-text">Acest proprietar nu are proprietăți listate.</p>
          ) : (
            <div className="properties-grid">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerProfilePage
