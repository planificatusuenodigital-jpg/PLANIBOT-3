import React from 'react';
import { Section, Plan, Testimonial } from '../types';
import { TRAVEL_PLANS, TESTIMONIALS } from '../constants';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';

const HomePage: React.FC<{ setActiveSection: (section: Section) => void }> = ({ setActiveSection }) => {
    
  const featuredPlans = TRAVEL_PLANS.slice(0, 3);
  
  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center text-white pt-16 pb-8">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight drop-shadow-lg">
          Planifica Tus <span className="text-pink-300">Sueños</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80 drop-shadow-md">
          Convertimos tus deseos de viajar en realidades inolvidables. Explora nuestros destinos y déjanos guiarte en tu próxima gran aventura.
        </p>
        <button
          onClick={() => setActiveSection(Section.Contacto)}
          className="mt-8 px-8 py-3 bg-white text-purple-700 font-bold rounded-full shadow-lg hover:bg-pink-100 transform hover:scale-105 transition-all duration-300"
        >
          Cotiza Tu Viaje Ahora
        </button>
      </section>

      {/* Featured Plans Section */}
      <section>
        <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-md">Planes Destacados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPlans.map((plan: Plan) => (
            <GlassCard key={plan.id} className="flex flex-col">
              <WatermarkedImage 
                src={plan.image} 
                alt={plan.title}
                containerClassName="h-48 rounded-t-xl"
              />
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-white">{plan.title}</h3>
                <p className="text-pink-300 font-semibold">{plan.price}</p>
                <p className="mt-2 text-white/80 flex-grow">{plan.description}</p>
                <button 
                  onClick={() => setActiveSection(Section.Planes)}
                  className="mt-4 w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Ver Más Detalles
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-md">Lo que dicen nuestros viajeros</h2>
        
        <GlassCard className="max-w-md mx-auto mb-8 flex items-center justify-center p-6 gap-4">
            <span className="text-5xl font-bold text-yellow-400">4.9</span>
            <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className={i < 4 ? 'text-yellow-400' : 'text-yellow-400/50'}>★</span>)}
                </div>
                <p className="text-white/80">Calificación en Google</p>
            </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial: Testimonial) => (
            <GlassCard key={testimonial.id} className="p-6 flex flex-col h-full">
              <p className="text-white/80 italic flex-grow">"{testimonial.text}"</p>
              <p className="mt-4 text-right font-bold text-pink-200">- {testimonial.author}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;