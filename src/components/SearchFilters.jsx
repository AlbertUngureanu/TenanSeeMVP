import { useState } from 'react'
import './SearchFilters.css'

function SearchFilters({ onSearch, onFilterChange, onMapToggle }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [filters, setFilters] = useState({
    forSale: false,
    forRent: false,
    twoPlusRooms: false
  })

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value)
  }

  const handleCheckboxChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }))
  }

  const handleApplyFilters = () => {
    const filterParams = {
      search: searchTerm,
      price: priceFilter,
      ...filters
    }
    onFilterChange(filterParams)
  }

  return (
    <div className="search-filters">
      <div className="filters-container">
        <input
          type="text"
          className="search-input"
          placeholder="Caută destinația"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
        />
        
        <select
          className="price-filter"
          value={priceFilter}
          onChange={handlePriceChange}
        >
          <option value="">Filtre: Preț</option>
          <option value="0-500">0 - 500 RON</option>
          <option value="500-1000">500 - 1000 RON</option>
          <option value="1000-2000">1000 - 2000 RON</option>
          <option value="2000+">2000+ RON</option>
        </select>

        <div className="filter-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.forSale}
              onChange={() => handleCheckboxChange('forSale')}
            />
            <span>De vânzare</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.forRent}
              onChange={() => handleCheckboxChange('forRent')}
            />
            <span>De închiriat</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.twoPlusRooms}
              onChange={() => handleCheckboxChange('twoPlusRooms')}
            />
            <span>2+ Camere</span>
          </label>
        </div>

        <button className="apply-filters-btn" onClick={handleApplyFilters}>
          Aplică filtre
        </button>

        <button className="map-btn" onClick={onMapToggle}>
          Hartă
        </button>
      </div>
    </div>
  )
}

export default SearchFilters

