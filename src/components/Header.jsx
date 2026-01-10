import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="logo.png" style={{ height: '1em', width: 'auto', verticalAlign: 'middle' }}/>
        </Link>
        <nav className="nav">
          <Link to="/lista-anunturi" className="nav-link">
            Lista de anunțuri
          </Link>
          <Link to="/cum-functioneaza" className="nav-link">
            Cum funcționează?
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
        {user ? (
          <div className="header-user-actions">
            {user.role === 'owner' && (
              <Link to="/adauga-proprietate" className="create-property-link">
                Adaugă proprietate
              </Link>
            )}
            <Link to="/profil" className="profile-link">
              Profil
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Deconectează-te
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-button">
            Intră în cont
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header

