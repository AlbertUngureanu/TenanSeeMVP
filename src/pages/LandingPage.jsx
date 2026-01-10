import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import { apiService } from '../services/apiService'

function LandingPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Mock API call to demonstrate backend integration
    apiService.getStats()
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching stats:', error))
  }, [])

  return (
    <div className="landing-page">
      <Header />
      <Hero stats={stats} />
      <Features />
    </div>
  )
}

export default LandingPage

