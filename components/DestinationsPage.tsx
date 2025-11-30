
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';
import { Destination } from '../types';

interface DestinationsPageProps {
  destinations: Destination[];
  logoUrl: string;
}

const DestinationCard: React.FC<{ destination: Destination; index: number; logoUrl: string }> = ({ destination, index, logoUrl }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = Array.isArray(destination.images) ? destination.images : [];

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }, 5000); // Auto-slide every 5 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <GlassCard className="overflow-hidden md:flex items-center gap-8 group">
            <div className={`md:w-1/2 overflow-hidden h-72 md:h-96 relative group/slider ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                {images.length > 0 ? (
                    images.map((img, idx) => (
                        <div 
                            key={idx} 
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <WatermarkedImage
                                src={img}
                                alt={`${destination.name} - Imagen ${idx + 1}`}
                                containerClassName="w-full h-full"
                                imageClassName="transform group-hover:scale-105 transition-transform duration-700"
                                logoUrl={logoUrl}
                            />
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full bg-black/20 flex items-center justify-center text-white/50">
                        Sin imagen disponible
                    </div>
                )}
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button 
                            onClick={handlePrev} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
                        >
                            &#10094;
                        </button>
                        <button 
                            onClick={handleNext} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
                        >
                            &#10095;
                        </button>
                        
                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {images.map((_, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                ></button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            <div className={`p-8 md:w-1/2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <h2 className="text-4xl font-bold text-white">{destination.name}</h2>
                <p className="mt-4 text-white/80 leading-relaxed text-lg">{destination.description}</p>
                <div className="mt-6 flex gap-2">
                    <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">{images.length} Fotos</span>
                </div>
            </div>
        </GlassCard>
    );
};

const DestinationsPage: React.FC<DestinationsPageProps> = ({ destinations, logoUrl }) => {
  // Safety check for destinations array
  const safeDestinations = Array.isArray(destinations) ? destinations : [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <h1 className="text-5xl font-black text-center text-white mb-4 drop-shadow-lg">Destinos que Inspiran</h1>
      <p className="text-center text-white/80 mb-12 max-w-3xl mx-auto text-lg">
        Estos son algunos de los lugares mágicos que nos especializamos en ofrecer. Cada uno con una historia que contar y una experiencia única por vivir.
      </p>

      <div className="space-y-12">
        {safeDestinations.length > 0 ? (
            safeDestinations.map((destination, index) => (
                <DestinationCard key={destination.id} destination={destination} index={index} logoUrl={logoUrl} />
            ))
        ) : (
            <div className="text-center text-white/60 p-8 bg-black/20 rounded-xl backdrop-blur-md">
                <p className="text-lg">No se encontraron destinos cargados actualmente.</p>
                <p className="text-sm mt-2">Por favor intenta recargar la página.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;
