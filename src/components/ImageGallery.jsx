import { useState } from 'react'
import './ImageGallery.css'

function ImageGallery({ property }) {
  
  const { id, price, description, image, images } = property
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Ensure we have at least placeholder images
  const allImages = images.length > 0 ? images : Array(10).fill(null)

  const mainImage = allImages[0] || null
  const thumbnailImages = allImages.slice(4, 10)
  const imagess = import.meta.glob('./images/anunturi/*.jpg', { eager: true });
  const imageList = Object.values(imagess);

  const ImagePlaceholder = ({ className = '' }) => (
    <div className={`image-placeholder ${className}`}>
      <img 
        src={imageList[id-1].default}
        alt="Property thumbnail" 
        className="image"
      />
    </div>
  )

  const ThumbnailPlaceholder = ({ className = '' }) => (
    <div className={`image-placeholder ${className}`}>
      <img 
        src={imageList[id-1].default}
        alt="Property thumbnail" 
        className="image"
      />
    </div>
  )
  

  const imageModules = import.meta.glob('./images/anunturi/poza*.jpg', { eager: true });
  const allImagess = Object.values(imageModules).map(mod => mod.default);
  const getRandomImages = (images, count) => {
    const shuffled = [...images].sort(() => 0.5 - Math.random()); 
    return shuffled.slice(0, count); 
  };
  const secondaryImages = getRandomImages(allImagess, 3);

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
          <ThumbnailPlaceholder />
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
    </div>
  )
}

export default ImageGallery

