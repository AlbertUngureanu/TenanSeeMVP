import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/apiService'
import './LoginPage.css'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  
  useEffect(() => {
    // Check if register query parameter is present
    if (searchParams.get('register') === 'true') {
      setIsLogin(false)
    }
  }, [searchParams])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'buyer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Vă rugăm completați toate câmpurile obligatorii.')
      return false
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Vă rugăm introduceți numele.')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Parolele nu coincid.')
        return false
      }
      if (formData.password.length < 6) {
        setError('Parola trebuie să aibă cel puțin 6 caractere.')
        return false
      }
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
      if (isLogin) {
        const response = await apiService.login({
          email: formData.email,
          password: formData.password
        })
        
        // Store token and user data
        if (response.token) {
          login(response.token, response.user)
          navigate('/')
        }
      } else {
        const response = await apiService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
        
        // After successful registration, switch to login or auto-login
        if (response.success) {
          setError('')
          alert('Cont creat cu succes! Vă puteți conecta acum.')
          setIsLogin(true)
          setFormData({
            email: formData.email,
            password: '',
            name: '',
            confirmPassword: '',
            role: 'buyer'
          })
        }
      }
    } catch (err) {
      setError(err.message || 'A apărut o eroare. Vă rugăm încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      role: 'buyer'
    })
  }

  return (
    <div className="login-page">
      <Header />
      <main className="login-content">
        <div className="auth-container">
          <div className="auth-header">
            <h1>{isLogin ? 'Intră în cont' : 'Creează cont'}</h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Bine ai revenit! Conectează-te pentru a continua.' 
                : 'Creează un cont nou pentru a începe.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Nume complet</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Introduceți numele complet"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Tip cont</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role || 'buyer'}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="buyer">Cumpărător (Caut proprietăți)</option>
                    <option value="owner">Proprietar (Vreau să public anunțuri)</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="introduceti@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Parolă</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Introduceți parola"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmă parola</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmați parola"
                  required
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Se procesează...' : (isLogin ? 'Conectează-te' : 'Creează cont')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? 'Nu ai cont?' : 'Ai deja cont?'}{' '}
              <button 
                type="button" 
                className="toggle-mode-btn"
                onClick={toggleMode}
              >
                {isLogin ? 'Creează cont' : 'Conectează-te'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
