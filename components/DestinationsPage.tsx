
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
    
    // Safety check: Ensure images array exists and isn't empty
    const images = destination.images && destination.images.length > 0 ? destination.images : [];

    useEffect(() => {
        if (images.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }, 5000); // Auto-slide every 5 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images.length > 0) {
            setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images.length > 0) {
            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }
    };

    return (
        <GlassCard className="overflow-hidden flex flex-col md:flex-row items-stretch gap-0 md:gap-8 group min-h-[400px]">
            <div className={`w-full md:w-1/2 h-64 md:h-auto relative group/slider ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
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
                                imageClassName="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                                logoUrl={logoUrl}
                            />
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white/50">
                        <span className="text-sm">Imagen no disponible</span>
                    </div>
                )}
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button 
                            onClick={handlePrev} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 group-hover/slider:opacity-100 transition-opacity"
                        >
                            &#10094;
                        </button>
                        <button 
                            onClick={handleNext} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 group-hover/slider:opacity-100 transition-opacity"
                        >
                            &#10095;
                        </button>
                        
                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {images.map((_, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                    className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                ></button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            <div className={`p-6 md:p-8 w-full md:w-1/2 flex flex-col justify-center ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{destination.name}</h2>
                <p className="text-white/80 leading-relaxed text-base md:text-lg mb-6">{destination.description}</p>
                <div className="flex gap-2">
                    <span className="text-xs bg-pink-500/20 border border-pink-500/30 text-white px-3 py-1 rounded-full">{images.length} Fotos</span>
                </div>
            </div>
        </GlassCard>
    );
};

const DestinationsPage: React.FC<DestinationsPageProps> = ({ destinations, logoUrl }) => {
  // Ensure destinations is an array to prevent crashes
  const safeDestinations = Array.isArray(destinations) ? destinations : [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <h1 className="text-4xl md:text-5xl font-black text-center text-white mb-4 drop-shadow-lg">Destinos que Inspiran</h1>
      <p className="text-center text-white/80 mb-12 max-w-3xl mx-auto text-base md:text-lg px-4">
        Estos son algunos de los lugares mágicos que nos especializamos en ofrecer. Cada uno con una historia que contar y una experiencia única por vivir.
      </p>

      <div className="space-y-8 md:space-y-12 px-4 md:px-0">
        {safeDestinations.length > 0 ? (
            safeDestinations.map((destination, index) => (
                <DestinationCard key={destination.id} destination={destination} index={index} logoUrl={logoUrl} />
            ))
        ) : (
            <div className="text-center text-white/60 py-10">
                <p>Cargando destinos...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;
