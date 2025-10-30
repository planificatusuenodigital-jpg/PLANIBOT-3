
import React from 'react';
import { DESTINATIONS } from '../constants';
import GlassCard from './GlassCard';

const DestinationsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-5xl font-black text-center text-white mb-4 drop-shadow-lg">Destinos que Inspiran</h1>
      <p className="text-center text-white/80 mb-12 max-w-3xl mx-auto">
        Estos son algunos de los lugares mágicos que nos especializamos en ofrecer. Cada uno con una historia que contar y una experiencia única por vivir.
      </p>

      <div className="space-y-12">
        {DESTINATIONS.map((destination, index) => (
          <GlassCard key={destination.id} className="overflow-hidden md:flex items-center gap-8 group">
             <div className={`md:w-1/2 overflow-hidden ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            <div className={`p-8 md:w-1/2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
              <h2 className="text-4xl font-bold text-white">{destination.name}</h2>
              <p className="mt-4 text-white/80 leading-relaxed">{destination.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default DestinationsPage;
