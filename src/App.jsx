import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ListingsPage from './pages/ListingsPage'
import PropertyDetailsPage from './pages/PropertyDetailsPage'
import OwnerProfilePage from './pages/OwnerProfilePage'
import HowItWorksPage from './pages/HowItWorksPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import CreatePropertyPage from './pages/CreatePropertyPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lista-anunturi" element={<ListingsPage />} />
      <Route path="/proprietate/:id" element={<PropertyDetailsPage />} />
      <Route path="/proprietar/:ownerId" element={<OwnerProfilePage />} />
      <Route path="/cum-functioneaza" element={<HowItWorksPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profil" element={<ProfilePage />} />
      <Route path="/adauga-proprietate" element={<CreatePropertyPage />} />
    </Routes>
  )
}

export default App

