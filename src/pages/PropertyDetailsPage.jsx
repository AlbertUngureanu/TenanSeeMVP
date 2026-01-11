import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ImageGallery from '../components/ImageGallery'
import PropertyInfoCard from '../components/PropertyInfoCard'
import OwnerCard from '../components/OwnerCard'
import ScheduleVisitModal from '../components/ScheduleVisitModal'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/apiService'
import './PropertyDetailsPage.css'

function PropertyDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showVisitModal, setShowVisitModal] = useState(false)

  useEffect(() => {
    loadPropertyDetails()
  }, [id])

  const loadPropertyDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getPropertyDetails(id)
      setProperty(data)
    } catch (err) {
      console.error('Error loading property details:', err)
      setError('Nu s-a putut încărca detaliile proprietății.')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscuss = () => {
    // Will be implemented when chat functionality is ready
    console.log('Open chat with owner:', property?.owner?.id)
  }

  const handleScheduleVisit = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'buyer') {
      alert('Doar cumpărătorii pot programa vizite.')
      return
    }
    setShowVisitModal(true)
  }

  const handleVisitSuccess = () => {
    alert('Vizita a fost programată cu succes!')
    // Optionally reload property or update UI
  }

  if (loading) {
    return (
      <div className="property-details-page">
        <Header />
        <div className="loading-container">
          <p>Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="property-details-page">
        <Header />
        <div className="error-container">
          <p>{error || 'Proprietatea nu a fost găsită.'}</p>
          <Link to="/lista-anunturi" className="back-button">
            Înapoi la listare
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="property-details-page">
      <Header />
      <div className="property-details-container">
        <div className="back-button-container">
          <Link to="/lista-anunturi" className="back-button">
            Înapoi la listare
          </Link>
        </div>

        <div className="property-details-content">
          <div className="property-images-column">
            <ImageGallery property={property} />
          </div>

          <div className="property-info-column">
            <PropertyInfoCard property={property} />
            <OwnerCard 
              owner={property.owner}
              onDiscuss={handleDiscuss}
              onScheduleVisit={handleScheduleVisit}
            />
          </div>
        </div>
      </div>

      <ScheduleVisitModal
        propertyId={parseInt(id)}
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        onSuccess={handleVisitSuccess}
      />
    </div>
  )
}

export default PropertyDetailsPage

