import './Features.css'

const features = [
  {
    icon: '✓',
    title: 'Anunțuri verificate',
    description: 'Doar proprietarii verificați pot publica anunțuri 100% autentice'
  },
  {
    icon: '👤',
    title: 'Profiluri de utilizator',
    description: 'Profiluri de utilizator clare, cu istoricul închirierilor și recenzii.'
  },
  {
    icon: '💬',
    title: 'Chat dedicat',
    description: 'Comunicați direct prin intermediul platformei.'
  },
  {
    icon: '📅',
    title: 'Programare vizionări',
    description: 'Arrange property visits in one click from the listing page.'
  }
]

function Features() {
  return (
    <section className="features">
      <div className="features-container">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features

