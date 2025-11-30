
import React from 'react';
import { Section, Plan, Testimonial } from '../types';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';

interface HomePageProps {
    setActiveSection: (section: Section) => void;
    setQrModalPlan: (plan: Plan) => void;
    setDetailModalPlan: (plan: Plan) => void;
    setQuoteRequestPlan: (plan: Plan) => void;
    plans: Plan[];
    testimonials: Testimonial[];
    logoUrl: string;
}

const PlanActions: React.FC<{ plan: Plan, setQrModalPlan: (plan: Plan) => void }> = ({ plan, setQrModalPlan }) => {
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareData = {
            title: plan.title,
            text: `¡Mira este increíble plan de viaje de Planifica Tu Sueño! ${plan.description}`,
            url: `${window.location.origin}${window.location.pathname}?plan=${plan.id}`
        };
        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard.writeText(shareData.url).then(() => {
                alert('¡Enlace del plan copiado al portapapeles!');
            });
        }
    };

    return (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button onClick={(e) => {e.stopPropagation(); setQrModalPlan(plan);}} className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center" title="Generar Código QR">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5h3v3H5V5zm0 7h3v3H5v-3zM12 5h3v3h-3V5zm0 7h3v3h-3v-3z"/><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 1h10v10H4V4z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={handleShare} className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center" title="Compartir Plan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            </button>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ setActiveSection, setQrModalPlan, setDetailModalPlan, setQuoteRequestPlan, plans, testimonials, logoUrl }) => {
    
  const featuredPlans = plans.filter(p => p.isVisible).slice(0, 3);
  
  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center text-white pt-10 md:pt-16 pb-4 md:pb-8">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight drop-shadow-lg leading-tight">
          Planifica Tus <span className="text-pink-300">Sueños</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-sm md:text-lg text-white/80 drop-shadow-md px-4">
          Convertimos tus deseos de viajar en realidades inolvidables. Explora nuestros destinos y déjanos guiarte.
        </p>
        <button
          onClick={() => setActiveSection(Section.Contacto)}
          className="mt-6 md:mt-8 px-6 py-2 md:px-8 md:py-3 bg-white text-purple-700 text-sm md:text-base font-bold rounded-full shadow-lg hover:bg-pink-100 transform hover:scale-105 transition-all duration-300"
        >
          Cotiza Tu Viaje Ahora
        </button>
      </section>

      {/* Featured Plans Section */}
      <section>
        <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-6 md:mb-8 drop-shadow-md">Planes Destacados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
          {featuredPlans.map((plan: Plan) => (
            <GlassCard key={plan.id} className="flex flex-col relative group">
              <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
              <div className="cursor-pointer" onClick={() => setDetailModalPlan(plan)}>
                {plan.images && plan.images.length > 0 ? (
                  <WatermarkedImage 
                    src={plan.images[0]} 
                    alt={plan.title}
                    containerClassName="h-48 md:h-64 rounded-t-xl"
                    logoUrl={logoUrl}
                  />
                ) : (
                  <div className="h-48 md:h-64 rounded-t-xl bg-black/10 flex items-center justify-center text-white/50">
                    Imagen no disponible
                  </div>
                )}
              </div>
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-2xl font-bold text-white leading-tight">{plan.title}</h3>
                <p className="text-pink-300 font-semibold text-sm md:text-base mt-1">{plan.price}</p>
                <p className="mt-2 text-white/80 flex-grow text-xs md:text-sm line-clamp-3">{plan.description}</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => setDetailModalPlan(plan)}
                      className="w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-colors text-sm"
                    >
                      Ver Detalles
                    </button>
                    <button 
                      onClick={() => setQuoteRequestPlan(plan)}
                      className="w-full bg-pink-500 text-white font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
                    >
                      Cotizar Ahora
                    </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
         <div className="text-center mt-8">
            <button
                onClick={() => setActiveSection(Section.Planes)}
                className="px-6 py-2 bg-white/20 text-white text-sm md:text-base font-semibold rounded-full shadow-md hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
            >
                Ver Todos los Planes
            </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-6 md:mb-8 drop-shadow-md">Lo que dicen nuestros viajeros</h2>
        
        <GlassCard className="max-w-md mx-auto mb-8 flex items-center justify-center p-4 md:p-6 gap-4">
            <span className="text-4xl md:text-5xl font-bold text-yellow-400">4.9</span>
            <div className="flex flex-col">
                <div className="flex text-yellow-400 text-sm md:text-base">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className={i < 4 ? 'text-yellow-400' : 'text-yellow-400/50'}>★</span>)}
                </div>
                <p className="text-white/80 text-xs md:text-sm">Calificación en Google</p>
            </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
          {testimonials.map((testimonial: Testimonial) => (
            <GlassCard key={testimonial.id} className="p-4 md:p-6 flex flex-col h-full">
               <div className="flex mb-3">
                   {[...Array(5)].map((_, i) => (
                       <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 md:h-5 md:w-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                   ))}
              </div>
              <p className="text-white/80 italic flex-grow text-sm md:text-base">"{testimonial.text}"</p>
              <p className="mt-4 text-right font-bold text-pink-200 text-sm">- {testimonial.author}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
