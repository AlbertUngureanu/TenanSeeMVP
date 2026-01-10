import { useState, useEffect } from 'react'
import Header from '../components/Header'
import SearchFilters from '../components/SearchFilters'
import PropertyCard from '../components/PropertyCard'
import { apiService } from '../services/apiService'
import './ListingsPage.css'

function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async (filterParams = {}) => {
    setLoading(true)
    try {
      const data = await apiService.getListings(filterParams)
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error loading listings:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterParams) => {
    setFilters(filterParams)
    loadListings(filterParams)
  }

  const handleMapToggle = () => {
    setShowMap(!showMap)
    // Map functionality will be implemented later
  }

  return (
    <div className="listings-page">
      <Header />
      <main className="listings-content">
        <h1 className="listings-title">Listări de proprietăți</h1>
        
        <SearchFilters
          onFilterChange={handleFilterChange}
          onMapToggle={handleMapToggle}
        />

        {loading ? (
          <div className="loading">Se încarcă...</div>
        ) : (
          <div className="listings-grid">
            {listings.length > 0 ? (
              listings.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="no-listings">
                <p>Nu s-au găsit anunțuri care să corespundă criteriilor dvs.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ListingsPage
