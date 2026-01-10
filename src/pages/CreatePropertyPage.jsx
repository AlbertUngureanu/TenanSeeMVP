import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/apiService'
import './CreatePropertyPage.css'

function CreatePropertyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    location: '',
    price: '',
    price_currency: 'RON',
    price_period: 'lună',
    type: 'rent',
    rooms: '',
    bathrooms: '',
    surface: ''
  })

  // Redirect if not owner or not logged in
  if (!user) {
    navigate('/login')
    return null
  }

  if (user.role !== 'owner') {
    navigate('/')
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.address || 
        !formData.location || !formData.price || !formData.rooms || 
        !formData.bathrooms || !formData.surface) {
      setError('Vă rugăm completați toate câmpurile obligatorii.')
      return false
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError('Prețul trebuie să fie un număr pozitiv.')
      return false
    }

    if (isNaN(parseInt(formData.rooms)) || parseInt(formData.rooms) <= 0) {
      setError('Numărul de camere trebuie să fie un număr pozitiv.')
      return false
    }

    if (isNaN(parseInt(formData.bathrooms)) || parseInt(formData.bathrooms) <= 0) {
      setError('Numărul de băi trebuie să fie un număr pozitiv.')
      return false
    }

    if (isNaN(parseFloat(formData.surface)) || parseFloat(formData.surface) <= 0) {
      setError('Suprafața trebuie să fie un număr pozitiv.')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        location: formData.location.trim(),
        price: parseFloat(formData.price),
        price_currency: formData.price_currency,
        price_period: formData.type === 'rent' ? formData.price_period : 'one-time',
        type: formData.type,
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms),
        surface: parseFloat(formData.surface)
      }

      // Validate all required fields are present
      if (!propertyData.title || !propertyData.description || !propertyData.address || 
          !propertyData.location || isNaN(propertyData.price) || isNaN(propertyData.rooms) ||
          isNaN(propertyData.bathrooms) || isNaN(propertyData.surface)) {
        setError('Vă rugăm completați toate câmpurile obligatorii.')
        setLoading(false)
        return
      }

      const createdProperty = await apiService.createProperty(propertyData)
      alert('Proprietatea a fost creată cu succes!')
      navigate(`/proprietate/${createdProperty.id}`)
    } catch (err) {
      setError(err.message || 'A apărut o eroare la crearea proprietății. Vă rugăm încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-property-page">
      <Header />
      <main className="create-property-content">
        <div className="create-property-container">
          <h1>Adaugă o proprietate nouă</h1>
          
          {error && <div className="error-message">{error}</div>}

          <form className="property-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Informații de bază</h2>
              
              <div className="form-group">
                <label htmlFor="title">Titlu proprietate *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="ex: Apartament modern cu 2 camere"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descriere *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrieți proprietatea în detaliu..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Adresă completă *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="ex: Strada Principală nr. 10"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Oraș/Locație *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="ex: București"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Detalii proprietate</h2>
              
              <div className="form-group">
                <label htmlFor="type">Tip proprietate *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="rent">De închiriat</option>
                  <option value="sale">De vânzare</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Preț *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price_currency">Monedă *</label>
                  <select
                    id="price_currency"
                    name="price_currency"
                    value={formData.price_currency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="RON">RON</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                {formData.type === 'rent' && (
                  <div className="form-group">
                    <label htmlFor="price_period">Perioadă</label>
                    <select
                      id="price_period"
                      name="price_period"
                      value={formData.price_period}
                      onChange={handleInputChange}
                    >
                      <option value="lună">Lună</option>
                      <option value="săptămână">Săptămână</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rooms">Număr camere *</label>
                  <input
                    type="number"
                    id="rooms"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    placeholder="2"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bathrooms">Număr băi *</label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="surface">Suprafață (mp) *</label>
                  <input
                    type="number"
                    id="surface"
                    name="surface"
                    value={formData.surface}
                    onChange={handleInputChange}
                    placeholder="65"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/lista-anunturi')}
              >
                Anulează
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Se creează...' : 'Creează proprietatea'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default CreatePropertyPage

