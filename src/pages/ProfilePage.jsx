import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import ReviewModal from '../components/ReviewModal'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/apiService'
import './ProfilePage.css'

function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('profil')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visits, setVisits] = useState([])
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedVisitForReview, setSelectedVisitForReview] = useState(null)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    description: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadProfile()
    if (activeSection === 'vizite') {
      loadVisits()
    }
    if (activeSection === 'profil' && user.role === 'owner') {
      loadOwnerReviews()
    }
  }, [user, navigate, activeSection])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await apiService.getProfile()
      setProfileData({
        name: data.name || user.name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        dateOfBirth: data.date_of_birth || '',
        description: data.profile_description || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      // Use user data from context as fallback
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        description: user.profile_description || ''
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const updated = await apiService.updateProfile(profileData)
      updateUser(updated)
      setIsEditing(false)
      alert('Profilul a fost actualizat cu succes!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Eroare la actualizarea profilului. Vă rugăm încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = () => {
    const currentPassword = prompt('Introduceți parola curentă:')
    if (!currentPassword) return

    const newPassword = prompt('Introduceți noua parolă:')
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('Parola trebuie să aibă cel puțin 6 caractere!')
      return
    }

    const confirmPassword = prompt('Confirmați noua parolă:')
    if (newPassword !== confirmPassword) {
      alert('Parolele nu coincid!')
      return
    }

    setLoading(true)
    apiService.changePassword(currentPassword, newPassword)
      .then(() => {
        alert('Parola a fost schimbată cu succes!')
      })
      .catch(error => {
        alert('Eroare la schimbarea parolei: ' + (error.message || 'Eroare necunoscută'))
      })
      .finally(() => setLoading(false))
  }

  const loadVisits = async () => {
    try {
      const data = await apiService.getMyVisits()
      setVisits(data || [])
    } catch (error) {
      console.error('Error loading visits:', error)
      setVisits([])
    }
  }

  const loadOwnerReviews = async () => {
    if (user.role !== 'owner') return
    try {
      const data = await apiService.getOwnerReviews(user.id)
      setReviews(data.reviews || [])
      setAverageRating(data.average_rating || 0)
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([])
      setAverageRating(0)
    }
  }

  const handleCancelVisit = async (visitId) => {
    if (confirm('Sunteți sigur că doriți să anulați această vizită?')) {
      try {
        await apiService.cancelVisit(visitId)
        alert('Vizita a fost anulată.')
        loadVisits()
      } catch (error) {
        alert('Eroare la anularea vizitei: ' + error.message)
      }
    }
  }

  const handleAddReview = (visit) => {
    setSelectedVisitForReview(visit)
    setShowReviewModal(true)
  }

  const handleReviewSuccess = () => {
    if (user.role === 'owner') {
      loadOwnerReviews()
    }
    loadVisits() // Reload visits to update review status
  }

  const formatVisitDateTime = (date, time) => {
    const dateObj = new Date(date + 'T' + time)
    const dateStr = dateObj.toLocaleDateString('ro-RO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeStr = formatTime(time)
    return `${dateStr}, ${timeStr}`
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleDeactivateAccount = () => {
    if (confirm('Sunteți sigur că doriți să dezactivați contul? Această acțiune nu poate fi anulată.')) {
      apiService.deactivateAccount()
        .then(() => {
          alert('Contul a fost dezactivat.')
          navigate('/')
        })
        .catch(error => alert('Eroare: ' + error.message))
    }
  }

  if (!user) {
    return null
  }

  const userRole = user.is_verified 
    ? (user.role === 'owner' ? 'Proprietar verificat' : 'Cumpărător verificat')
    : (user.role === 'owner' ? 'Proprietar' : 'Cumpărător')
  const accountYear = user.account_created_year || new Date().getFullYear()

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profilul meu</h1>
          <Link to="/" className="home-link">Acasă</Link>
        </div>

        <div className="profile-content">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            <div className="user-summary">
              <div className="profile-image-placeholder">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} />
                ) : (
                  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
                    <line x1="0" y1="0" x2="100" y2="100" stroke="#999" strokeWidth="2"/>
                    <line x1="100" y1="0" x2="0" y2="100" stroke="#999" strokeWidth="2"/>
                  </svg>
                )}
              </div>
              <div className="user-name">{user.name || '<Nume utilizator>'}</div>
              <div className="user-role">{userRole || '<Rol utilizator>'}</div>
              <div className="user-rating">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < Math.round(averageRating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
                {user.role === 'owner' && averageRating > 0 && (
                  <span className="rating-text">
                    ({averageRating.toFixed(1)}) - {reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'}
                  </span>
                )}
              </div>
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                Editează Profilul
              </button>
            </div>

            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeSection === 'profil' ? 'active' : ''}`}
                onClick={() => setActiveSection('profil')}
              >
                <span className="nav-icon">Icon</span>
                Profil
              </button>
              <button 
                className={`nav-item ${activeSection === 'mesaje' ? 'active' : ''}`}
                onClick={() => setActiveSection('mesaje')}
              >
                <span className="nav-icon">Icon</span>
                Mesaje
              </button>
              <button 
                className={`nav-item ${activeSection === 'vizite' ? 'active' : ''}`}
                onClick={() => setActiveSection('vizite')}
              >
                <span className="nav-icon">Icon</span>
                Vizite
              </button>
              <button 
                className={`nav-item ${activeSection === 'locuri-salvate' ? 'active' : ''}`}
                onClick={() => setActiveSection('locuri-salvate')}
              >
                <span className="nav-icon">Icon</span>
                Locuri salvate
              </button>
            </nav>
          </div>

          {/* Right Content */}
          <div className="profile-main">
            {activeSection === 'profil' && (
              <>
                {/* Personal Information Section */}
                <section className="profile-section">
                  <h2>Informații personale</h2>
                  <div className="form-group">
                    <label htmlFor="name">Nume complet</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Adresa de email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Număr de telefon</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Data nașterii</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Descriere</label>
                    <textarea
                      id="description"
                      name="description"
                      value={profileData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="4"
                    />
                  </div>
                  {isEditing && (
                    <button 
                      className="save-profile-btn"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Se salvează...' : 'Editează profilul'}
                    </button>
                  )}
                </section>

                {/* Account Security Section */}
                <section className="profile-section">
                  <h2>Securitatea contului</h2>
                  <div className="security-actions">
                    <button 
                      className="security-btn"
                      onClick={handleChangePassword}
                    >
                      Schimbă parola
                    </button>
                    <button 
                      className="security-btn danger"
                      onClick={handleDeactivateAccount}
                    >
                      Dezactivează contul
                    </button>
                  </div>
                </section>
              </>
            )}

            {activeSection === 'mesaje' && (
              <section className="profile-section">
                <h2>Mesaje</h2>
                <p>Funcționalitatea de mesagerie va fi disponibilă în curând.</p>
              </section>
            )}

            {activeSection === 'vizite' && (
              <section className="profile-section">
                <h2>Vizite</h2>
                {visits.length === 0 ? (
                  <p>Nu aveți vizite programate.</p>
                ) : (
                  <div className="visits-list">
                    {visits.map(visit => (
                      <div key={visit.id} className="visit-card">
                        <div className="visit-info">
                          <h3 className="visit-property-title">
                            {user.role === 'buyer' 
                              ? visit.property_title || 'Proprietate'
                              : `${visit.buyer_name || 'Cumpărător'} - ${visit.property_title || 'Proprietate'}`
                            }
                          </h3>
                          {user.role === 'owner' && visit.property_address && (
                            <p className="visit-address">{visit.property_address}</p>
                          )}
                          <p className="visit-datetime">
                            {formatVisitDateTime(visit.visit_date, visit.visit_time)}
                          </p>
                          {visit.notes && (
                            <p className="visit-notes">{visit.notes}</p>
                          )}
                        </div>
                        <div className="visit-actions">
                          {user.role === 'buyer' && (
                            <button 
                              className="add-review-btn"
                              onClick={() => handleAddReview(visit)}
                            >
                              Adaugă recenzie
                            </button>
                          )}
                          <button 
                            className="cancel-visit-btn"
                            onClick={() => handleCancelVisit(visit.id)}
                          >
                            Anulează vizita
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeSection === 'profil' && user.role === 'owner' && reviews.length > 0 && (
              <section className="profile-section">
                <h2>Recenzii primite</h2>
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-buyer">{review.buyer_name || 'Cumpărător'}</div>
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
                          {new Date(review.created_at).toLocaleDateString('ro-RO')}
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
              </section>
            )}

            {activeSection === 'locuri-salvate' && (
              <section className="profile-section">
                <h2>Locuri salvate</h2>
                <p>Proprietățile salvate vor fi disponibile în curând.</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && selectedVisitForReview && (
        <ReviewModal
          ownerId={selectedVisitForReview.owner_id}
          propertyId={selectedVisitForReview.property_id}
          visitId={selectedVisitForReview.id}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedVisitForReview(null)
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}

export default ProfilePage

