// Mock API Service for backend integration
// Replace these with actual API calls when backend is ready

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ApiService {
  async request(endpoint, options = {}) {
    // Use real backend if available, otherwise fall back to mock
    const useRealBackend = import.meta.env.VITE_USE_REAL_BACKEND === 'true' || 
                          import.meta.env.MODE === 'production'
    
    // Debug logging
    console.log('API Request:', {
      endpoint,
      useRealBackend,
      envVar: import.meta.env.VITE_USE_REAL_BACKEND,
      apiUrl: API_BASE_URL
    })
    
    if (useRealBackend) {
      try {
        const result = await this.realRequest(endpoint, options)
        console.log('Backend request successful:', endpoint, result)
        return result
      } catch (error) {
        console.error('Backend request failed, falling back to mock data:', {
          endpoint,
          error: error.message,
          url: `${API_BASE_URL}${endpoint}`
        })
        // Fall back to mock if backend is not available
        await delay(300)
        return this.mockResponse(endpoint, options)
      }
    } else {
      // Mock implementation for development
      console.log('Using mock data for:', endpoint)
      await delay(300) // Simulate network delay
      return this.mockResponse(endpoint, options)
    }
  }

  async realRequest(endpoint, options = {}) {
    let url = `${API_BASE_URL}${endpoint}`
    
    // Handle query parameters
    if (options.params) {
      const params = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Convert boolean to string for URL params
          const paramValue = typeof value === 'boolean' ? String(value).toLowerCase() : value
          params.append(key, paramValue)
        }
      })
      const queryString = params.toString()
      if (queryString) {
        url = url + '?' + queryString
      }
    }

    // Get auth token if available
    const token = localStorage.getItem('authToken')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Add Authorization header if token exists and not already set
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
      method: options.method || 'GET',
      headers
    }

    if (config.method !== 'GET' && options.body) {
      if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body)
      } else {
        config.body = options.body
      }
    }

    console.log('Making request to:', url, config)

    try {
      const response = await fetch(url, config)
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { detail: errorText || 'Request failed' }
        }
        // Better error message for validation errors
        let errorMessage = errorData.detail || `HTTP error! status: ${response.status}`
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => {
            if (typeof err === 'object' && err.msg) {
              return `${err.loc?.join('.') || 'field'}: ${err.msg}`
            }
            return String(err)
          }).join(', ')
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail)
        }
        console.error('API Error Details:', errorData)
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      return data
    } catch (error) {
      console.error('Fetch error:', error)
      // Re-throw to be caught by the request method
      throw error
    }
  }

  mockResponse(endpoint, options = {}) {
    // Handle property details endpoint with ID
    if (endpoint.startsWith('/properties/')) {
      const propertyId = endpoint.split('/')[2]
      return Promise.resolve(this.getMockPropertyDetails(propertyId))
    }

    // Handle auth endpoints
    if (endpoint === '/auth/login') {
      try {
        return Promise.resolve(this.handleLogin(options.body))
      } catch (error) {
        return Promise.reject(error)
      }
    }

    if (endpoint === '/auth/register') {
      try {
        return Promise.resolve(this.handleRegister(options.body))
      } catch (error) {
        return Promise.reject(error)
      }
    }

    // Handle other endpoints
    const mockData = {
      '/stats': {
        totalListings: 1250,
        verifiedLandlords: 340,
        activeUsers: 5200
      },
      '/listings': this.getMockListings(options.params || {})
    }

    return Promise.resolve(mockData[endpoint] || {})
  }

  handleLogin(body) {
    // Parse request body if it's a string
    let credentials = {}
    if (typeof body === 'string') {
      try {
        credentials = JSON.parse(body)
      } catch (e) {
        // If parsing fails, return error
        throw new Error('Date de autentificare invalide')
      }
    } else {
      credentials = body || {}
    }

    // Mock validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email și parolă sunt obligatorii')
    }

    // Mock successful login
    return {
      token: 'mock_jwt_token_' + Date.now(),
      user: {
        id: 1,
        name: credentials.email.split('@')[0],
        email: credentials.email
      }
    }
  }

  handleRegister(body) {
    // Parse request body if it's a string
    let userData = {}
    if (typeof body === 'string') {
      try {
        userData = JSON.parse(body)
      } catch (e) {
        throw new Error('Date de înregistrare invalide')
      }
    } else {
      userData = body || {}
    }

    // Mock validation
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Toate câmpurile sunt obligatorii')
    }

    // Mock email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new Error('Adresa de email nu este validă')
    }

    // Mock password validation
    if (userData.password.length < 6) {
      throw new Error('Parola trebuie să aibă cel puțin 6 caractere')
    }

    // Mock successful registration
    return {
      success: true,
      message: 'Cont creat cu succes',
      user: {
        id: Math.floor(Math.random() * 1000),
        name: userData.name,
        email: userData.email
      }
    }
  }

  getMockListings(filters = {}) {
    // Mock listings data
    const allListings = [
      {
        id: 1,
        price: '1.200 RON/lună',
        description: 'Apartament modern cu 2 camere în centrul orașului',
        image: null,
        location: 'București',
        rooms: 2,
        type: 'rent'
      },
      {
        id: 2,
        price: '850 RON/lună',
        description: 'Apartament confortabil cu 1 cameră, mobilat complet',
        image: null,
        location: 'Cluj-Napoca',
        rooms: 1,
        type: 'rent'
      },
      {
        id: 3,
        price: '1.500 RON/lună',
        description: 'Apartament spațios cu 3 camere, balcon mare',
        image: null,
        location: 'Timișoara',
        rooms: 3,
        type: 'rent'
      },
      {
        id: 4,
        price: '95.000 EUR',
        description: 'Casa cu 4 camere, curte mare, garaj',
        image: null,
        location: 'Brașov',
        rooms: 4,
        type: 'sale'
      },
      {
        id: 5,
        price: '1.100 RON/lună',
        description: 'Apartament nou cu 2 camere, parter',
        image: null,
        location: 'Iași',
        rooms: 2,
        type: 'rent'
      },
      {
        id: 6,
        price: '1.350 RON/lună',
        description: 'Apartament renovat cu 2 camere, etaj 3',
        image: null,
        location: 'Constanța',
        rooms: 2,
        type: 'rent'
      }
    ]

    // Apply filters
    let filtered = [...allListings]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.forSale && !filters.forRent) {
      filtered = filtered.filter(listing => listing.type === 'sale')
    } else if (filters.forRent && !filters.forSale) {
      filtered = filtered.filter(listing => listing.type === 'rent')
    }

    if (filters.twoPlusRooms) {
      filtered = filtered.filter(listing => listing.rooms >= 2)
    }

    // Price filter logic would go here
    if (filters.price) {
      // Mock price filtering - would need actual price values in real implementation
    }

    return {
      listings: filtered,
      total: filtered.length
    }
  }

  getMockPropertyDetails(id) {
    // Mock property details data
    const properties = {
      '1': {
        id: 1,
        title: 'Apartament modern cu 2 camere în centrul orașului',
        address: 'Strada Principală nr. 15, București',
        rooms: 2,
        bathrooms: 1,
        surface: 65,
        monthlyCost: '1.200 RON/lună',
        description: 'Apartament modern și bine amenajat, situat în centrul orașului, la doar câteva minute de mers pe jos de principalele facilități. Proprietatea beneficiază de lumină naturală abundentă, balcon orientat spre sud și parcare asigurată. Zona este liniștită, dar accesibilă la transportul public și la principalele zone comerciale.',
        images: [],
        owner: {
          id: 101,
          name: 'Ion Popescu',
          accountCreatedYear: 2020,
          profileDescription: 'Proprietar verificat cu experiență de peste 10 ani în domeniul imobiliar. Oferim proprietăți de calitate și servicii profesionale.',
          profileImage: null
        }
      },
      '2': {
        id: 2,
        title: 'Apartament confortabil cu 1 cameră, mobilat complet',
        address: 'Bulevardul Libertății nr. 42, Cluj-Napoca',
        rooms: 1,
        bathrooms: 1,
        surface: 45,
        monthlyCost: '850 RON/lună',
        description: 'Apartament mobilat complet, ideal pentru studenți sau tineri profesioniști. Situat într-o zonă centrală, cu acces ușor la universități și facilități comerciale. Proprietatea este bine întreținută și gata de locuit.',
        images: [],
        owner: {
          id: 102,
          name: 'Maria Ionescu',
          accountCreatedYear: 2019,
          profileDescription: 'Proprietar dedicat, oferind locuințe confortabile și servicii de încredere. Răspund prompt la întrebări și oferim suport complet.',
          profileImage: null
        }
      },
      '3': {
        id: 3,
        title: 'Apartament spațios cu 3 camere, balcon mare',
        address: 'Calea Victoriei nr. 78, Timișoara',
        rooms: 3,
        bathrooms: 2,
        surface: 95,
        monthlyCost: '1.500 RON/lună',
        description: 'Apartament generos, perfect pentru familii. Beneficiază de 3 camere spațioase, 2 băi, balcon mare și garaj. Zona este rezidențială, liniștită, cu acces la școli și parcuri în apropiere.',
        images: [],
        owner: {
          id: 103,
          name: 'Alexandru Georgescu',
          accountCreatedYear: 2021,
          profileDescription: 'Specializat în proprietăți familiale, oferim soluții de locuire adaptate nevoilor fiecărei familii.',
          profileImage: null
        }
      },
      '4': {
        id: 4,
        title: 'Casa cu 4 camere, curte mare, garaj',
        address: 'Strada Pădurii nr. 12, Brașov',
        rooms: 4,
        bathrooms: 3,
        surface: 180,
        monthlyCost: '95.000 EUR',
        description: 'Casă modernă cu 4 camere, curte mare de 500m², garaj pentru 2 mașini și terasă. Proprietatea este situată într-o zonă rezidențială exclusivă, cu acces ușor la centrul orașului.',
        images: [],
        owner: {
          id: 104,
          name: 'Elena Radu',
          accountCreatedYear: 2018,
          profileDescription: 'Experiență în vânzarea și închirierea proprietăților premium. Oferim consultanță personalizată și servicii complete.',
          profileImage: null
        }
      },
      '5': {
        id: 5,
        title: 'Apartament nou cu 2 camere, parter',
        address: 'Strada Universității nr. 25, Iași',
        rooms: 2,
        bathrooms: 1,
        surface: 58,
        monthlyCost: '1.100 RON/lună',
        description: 'Apartament nou, nefolosit, situat la parter, ideal pentru persoane în vârstă sau cu mobilitate redusă. Beneficiază de acces direct la curte și parcare privată.',
        images: [],
        owner: {
          id: 105,
          name: 'Mihai Constantinescu',
          accountCreatedYear: 2022,
          profileDescription: 'Proprietar nou în platformă, dedicat oferirii de locuințe moderne și confortabile.',
          profileImage: null
        }
      },
      '6': {
        id: 6,
        title: 'Apartament renovat cu 2 camere, etaj 3',
        address: 'Bulevardul Mamaia nr. 100, Constanța',
        rooms: 2,
        bathrooms: 1,
        surface: 62,
        monthlyCost: '1.350 RON/lună',
        description: 'Apartament recent renovat, cu vedere la mare, situat la etajul 3. Beneficiază de balcon mare, lumină naturală abundentă și acces la plajă la doar 5 minute de mers pe jos.',
        images: [],
        owner: {
          id: 106,
          name: 'Andrei Marin',
          accountCreatedYear: 2020,
          profileDescription: 'Specializat în proprietăți de coastă, oferim locuințe cu vedere la mare și acces la facilități turistice.',
          profileImage: null
        }
      }
    }

    return properties[id] || null
  }

  // Public API methods
  async getStats() {
    return this.request('/stats')
  }

  async getListings(params = {}) {
    // Convert filter params to query params format
    const queryParams = {}
    if (params.search) queryParams.search = params.search
    if (params.price) queryParams.price = params.price
    if (params.forSale !== undefined) queryParams.forSale = params.forSale
    if (params.forRent !== undefined) queryParams.forRent = params.forRent
    if (params.twoPlusRooms !== undefined) queryParams.twoPlusRooms = params.twoPlusRooms
    
    return this.request('/listings', { params: queryParams })
  }

  async getPropertyDetails(id) {
    return this.request(`/properties/${id}`)
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getProfile() {
    const token = localStorage.getItem('authToken')
    return this.request('/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async updateProfile(profileData) {
    const token = localStorage.getItem('authToken')
    return this.request('/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        name: profileData.name,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth,
        description: profileData.description
      }
    })
  }

  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('authToken')
    return this.request('/profile/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        current_password: currentPassword,
        new_password: newPassword
      }
    })
  }

  async deactivateAccount() {
    const token = localStorage.getItem('authToken')
    return this.request('/profile/deactivate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async createProperty(propertyData) {
    const token = localStorage.getItem('authToken')
    console.log('Creating property with data:', propertyData)
    console.log('Using token:', token ? 'Token exists' : 'No token')
    return this.request('/properties', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: propertyData
    })
  }

  async getAvailableSlots(propertyId, date) {
    return this.request(`/visits/available/${propertyId}`, {
      params: { date }
    })
  }

  async createVisit(visitData) {
    const token = localStorage.getItem('authToken')
    return this.request('/visits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: visitData
    })
  }

  async getMyVisits() {
    const token = localStorage.getItem('authToken')
    return this.request('/visits/my-visits', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async cancelVisit(visitId) {
    const token = localStorage.getItem('authToken')
    return this.request(`/visits/${visitId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async createReview(reviewData) {
    const token = localStorage.getItem('authToken')
    return this.request('/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: reviewData
    })
  }

  async getOwnerReviews(ownerId) {
    return this.request(`/reviews/owner/${ownerId}`)
  }

  async getPropertyReviews(propertyId) {
    return this.request(`/reviews/property/${propertyId}`)
  }

  async getOwnerProperties(ownerId) {
    return this.request(`/properties/owner/${ownerId}`)
  }

  // When backend is ready, uncomment and use this pattern:
  /*
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
  */
}

export const apiService = new ApiService()

