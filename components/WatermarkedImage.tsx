
import React from 'react';

// FIX: Added logoUrl prop to make the watermark dynamic.
interface WatermarkedImageProps {
  src: string;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
  logoUrl: string;
}

const WatermarkedImage: React.FC<WatermarkedImageProps> = ({ src, alt, containerClassName = '', imageClassName = '', logoUrl }) => {
  return (
    <div className={`relative group overflow-hidden ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageClassName}`}
      />
      <img
        src={logoUrl}
        alt="Logo Watermark"
        className="absolute bottom-2 right-2 w-12 h-auto opacity-50 pointer-events-none transition-opacity duration-300 group-hover:opacity-75"
      />
    </div>
  );
};

export default WatermarkedImage;
