import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import './ReviewsList.css'

function ReviewsList({ ownerId, showTitle = true }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ownerId) {
      loadReviews()
    }
  }, [ownerId])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await apiService.getOwnerReviews(ownerId)
      setReviews(data.reviews || [])
      setAverageRating(data.average_rating || 0)
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([])
      setAverageRating(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="reviews-list-container">
        {showTitle && <h3 className="reviews-title">Recenzii</h3>}
        <p className="loading-text">Se încarcă recenziile...</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="reviews-list-container">
        {showTitle && <h3 className="reviews-title">Recenzii</h3>}
        <p className="no-reviews-text">Nu există recenzii pentru acest proprietar.</p>
      </div>
    )
  }

  return (
    <div className="reviews-list-container">
      {showTitle && (
        <div className="reviews-header">
          <h3 className="reviews-title">Recenzii</h3>
          <div className="reviews-summary">
            <div className="summary-rating">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`star ${i < Math.round(averageRating) ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="summary-text">
              {averageRating.toFixed(1)} din {reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'}
            </span>
          </div>
        </div>
      )}
      
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="review-buyer-name">{review.buyer_name || 'Cumpărător'}</div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < review.rating ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="review-date">
                {new Date(review.created_at).toLocaleDateString('ro-RO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            {review.property_title && (
              <div className="review-property">
                Pentru: {review.property_title}
              </div>
            )}
            {review.comment && (
              <div className="review-comment">{review.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsList
