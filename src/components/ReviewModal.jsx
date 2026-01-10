import { useState } from 'react'
import { apiService } from '../services/apiService'
import './ReviewModal.css'

function ReviewModal({ ownerId, propertyId, visitId, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Vă rugăm selectați un rating.')
      return
    }

    if (rating < 1 || rating > 5) {
      setError('Rating-ul trebuie să fie între 1 și 5 stele.')
      return
    }

    setLoading(true)

    try {
      await apiService.createReview({
        owner_id: ownerId,
        property_id: propertyId,
        visit_id: visitId,
        rating: rating,
        comment: comment.trim() || null
      })

      if (onSuccess) {
        onSuccess()
      }
      onClose()
      // Reset form
      setRating(0)
      setComment('')
    } catch (err) {
      setError(err.message || 'A apărut o eroare la adăugarea recenziei.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        
        <h2 className="modal-title">Adaugă o recenzie</h2>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-section">
            <label className="rating-label">Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="rating-value">
                {rating} {rating === 1 ? 'stea' : 'stele'}
              </span>
            )}
          </div>

          <div className="comment-section">
            <label htmlFor="comment" className="comment-label">
              Comentariu (opțional)
            </label>
            <textarea
              id="comment"
              className="comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Scrieți un comentariu despre experiența dvs..."
              rows="5"
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Anulează
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={rating === 0 || loading}
            >
              {loading ? 'Se trimite...' : 'Trimite recenzia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
