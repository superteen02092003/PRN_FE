import { useState } from 'react';
import type { ProductImageDto } from '@/types/product.types';
import { resolveImageUrl } from '@/utils/imageUrl';
import './ImageGallery.css';

interface ImageGalleryProps {
    images: ProductImageDto[];
    productName: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Sort images by sortOrder, primary first
    const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
    });

    const selectedImage = sortedImages[selectedIndex] || null;

    const handleThumbnailClick = (index: number) => {
        setSelectedIndex(index);
    };

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    if (sortedImages.length === 0) {
        return (
            <div className="image-gallery">
                <div className="main-image-container">
                    <div className="no-image">
                        <span>No image available</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="image-gallery">
            {/* Main Image */}
            <div className="main-image-container">
                {sortedImages.length > 1 && (
                    <button
                        className="nav-button prev"
                        onClick={handlePrevious}
                        aria-label="Previous image"
                    >
                        &lt;
                    </button>
                )}

                <div
                    className={`main-image-wrapper ${isZoomed ? 'zoomed' : ''}`}
                    onClick={toggleZoom}
                >
                    <img
                        src={resolveImageUrl(selectedImage?.imageUrl) || ''}
                        alt={`${productName} - Image ${selectedIndex + 1}`}
                        className="main-image"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent && !parent.querySelector('.image-error')) {
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'image-error';
                                errorDiv.innerHTML = '<span class="material-symbols-outlined">broken_image</span><p>Image failed to load</p>';
                                errorDiv.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af;';
                                parent.appendChild(errorDiv);
                            }
                        }}
                    />
                </div>

                {sortedImages.length > 1 && (
                    <button
                        className="nav-button next"
                        onClick={handleNext}
                        aria-label="Next image"
                    >
                        &gt;
                    </button>
                )}

                {/* Image counter */}
                <div className="image-counter">
                    {selectedIndex + 1} / {sortedImages.length}
                </div>
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
                <div className="thumbnails-container">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.imageId}
                            className={`thumbnail ${index === selectedIndex ? 'active' : ''}`}
                            onClick={() => handleThumbnailClick(index)}
                            aria-label={`View image ${index + 1}`}
                        >
                            <img
                                src={resolveImageUrl(image.imageUrl) || ''}
                                alt={`${productName} thumbnail ${index + 1}`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {isZoomed && (
                <div className="zoom-modal" onClick={toggleZoom}>
                    <button className="close-zoom" aria-label="Close zoom">
                        &times;
                    </button>
                    <img
                        src={resolveImageUrl(selectedImage?.imageUrl) || ''}
                        alt={`${productName} - Zoomed`}
                        className="zoomed-image"
                    />
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
