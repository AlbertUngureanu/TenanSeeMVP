import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/apiService'
import './OwnerCard.css'
import l1 from './images/anunturi/lanlord1.jpg';
import l2 from './images/anunturi/landlord2.jpg';

function OwnerCard({ owner, onDiscuss, onScheduleVisit }) {
  const navigate = useNavigate()
  const {
    id,
    name,
    account_created_year,
    accountCreatedYear,
    profile_description,
    profileDescription,
    profile_image,
    profileImage
  } = owner || {}
  
  // Support both snake_case (from backend) and camelCase
  const displayAccountYear = account_created_year || accountCreatedYear
  const displayProfileDescription = profile_description || profileDescription
  const displayProfileImage = name == "Alexandra Popescu" ? l2 : l1
  
  const [rating, setRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  
  useEffect(() => {
    if (id) {
      loadOwnerRating()
    }
  }, [id])
  
  const loadOwnerRating = async () => {
    try {
      const data = await apiService.getOwnerReviews(id)
      setRating(data.average_rating || 0)
      setTotalReviews(data.total_reviews || 0)
    } catch (error) {
      console.error('Error loading owner rating:', error)
    }
  }

  const handleOwnerClick = () => {
    if (id) {
      navigate(`/proprietar/${id}`)
    }
  }

  const ImagePlaceholder = () => (
    <div className="owner-image-placeholder">
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
        <line x1="0" y1="0" x2="100" y2="100" stroke="#999" strokeWidth="2"/>
        <line x1="100" y1="0" x2="0" y2="100" stroke="#999" strokeWidth="2"/>
      </svg>
    </div>
  )

  return (
    <div className="owner-card">
      <h2 className="owner-card-title">Despre Proprietar</h2>

      <div className="owner-profile">
        <div className="owner-image">
          {displayProfileImage ? (
            <img src={displayProfileImage} alt={name || 'Owner'} />
          ) : (
            <ImagePlaceholder />
          )}
        </div>

        <div className="owner-info">
          <div className="owner-name">
            {name || '<Nume proprietar>'}
          </div>
          <div className="owner-account-year">
            {displayAccountYear ? `Cont creat în 2026` : '<An creare cont>'}
          </div>
        </div>
      </div>

      <div 
        className="owner-rating clickable"
        onClick={handleOwnerClick}
        title="Click pentru a vedea profilul complet"
      >
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
        {totalReviews > 0 && (
          <span className="rating-text">
            ({rating.toFixed(1)}) - {totalReviews} {totalReviews === 1 ? 'recenzie' : 'recenzii'}
          </span>
        )}
        <span className="view-profile-link">Vezi profil complet →</span>
      </div>

      <div className="owner-description">
        <p>{displayProfileDescription || '<Descriere profil proprietar>'}</p>
      </div>

      <div className="owner-actions">
        <button className="discuss-btn" onClick={onDiscuss}>
          <span className="btn-icon">💬</span>
          Discuta
        </button>
        <button className="schedule-btn" onClick={onScheduleVisit}>
          <span className="btn-icon">📅</span>
          Programeaza Vizita
        </button>
      </div>
    </div>
  )
}

export default OwnerCard

