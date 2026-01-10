import { useState } from 'react'
import './ImageGallery.css'

function ImageGallery({ images = [] }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Ensure we have at least placeholder images
  const allImages = images.length > 0 ? images : Array(10).fill(null)

  const mainImage = allImages[0] || null
  const secondaryImages = allImages.slice(1, 4)
  const thumbnailImages = allImages.slice(4, 10)

  const ImagePlaceholder = ({ className = '' }) => (
    <div className={`image-placeholder ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
        <line x1="0" y1="0" x2="400" y2="300" stroke="#999" strokeWidth="2"/>
        <line x1="400" y1="0" x2="0" y2="300" stroke="#999" strokeWidth="2"/>
      </svg>
    </div>
  )

  return (
    <div className="image-gallery">
      <div className="main-image">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt="Property main" 
            onClick={() => setSelectedImageIndex(0)}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {secondaryImages.length > 0 && (
        <div className="secondary-images">
          {secondaryImages.map((image, index) => (
            <div key={index + 1} className="secondary-image">
              {image ? (
                <img 
                  src={image} 
                  alt={`Property ${index + 2}`}
                  onClick={() => setSelectedImageIndex(index + 1)}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          ))}
        </div>
      )}

      {thumbnailImages.length > 0 && (
        <div className="thumbnail-gallery">
          {thumbnailImages.map((image, index) => (
            <div 
              key={index + 4} 
              className="thumbnail-image"
              onClick={() => setSelectedImageIndex(index + 4)}
            >
              {image ? (
                <img src={image} alt={`Property thumbnail ${index + 5}`} />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery

