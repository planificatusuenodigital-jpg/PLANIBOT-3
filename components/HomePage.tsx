
import React, { useState, useEffect } from 'react';
import { Section, Plan, Testimonial, Destination } from '../types';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';
import TextToSpeechButton from './TextToSpeechButton';

interface HomePageProps {
    setActiveSection: (section: Section) => void;
    setQrModalPlan: (plan: Plan) => void;
    setDetailModalPlan: (plan: Plan) => void;
    setQuoteRequestPlan: (plan: Plan) => void;
    plans: Plan[];
    testimonials: Testimonial[];
    logoUrl: string;
    destinations: Destination[];
}

const PlanActions: React.FC<{ plan: Plan, setQrModalPlan: (plan: Plan) => void }> = ({ plan, setQrModalPlan }) => {
    const handleShare = async () => {
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
        <div className="absolute top-3 right-3 flex gap-2 z-30">
            <TextToSpeechButton 
                title={plan.title} 
                description={plan.description} 
                includes={plan.includes} 
                mini={true} 
            />
            <button onClick={(e) => { e.stopPropagation(); setQrModalPlan(plan); }} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-pink-500 hover:border-pink-500 transition-all duration-300 flex items-center justify-center shadow-lg" title="Generar Código QR">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5h3v3H5V5zm0 7h3v3H5v-3zM12 5h3v3h-3V5zm0 7h3v3h-3v-3z"/><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 1h10v10H4V4z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-pink-500 hover:border-pink-500 transition-all duration-300 flex items-center justify-center shadow-lg" title="Compartir Plan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            </button>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ setActiveSection, setQrModalPlan, setDetailModalPlan, setQuoteRequestPlan, plans, testimonials, logoUrl, destinations }) => {
    
  const featuredPlans = plans.filter(p => p.isVisible).slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!destinations || destinations.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destinations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [destinations]);

  // Mensajes de CTA (Call to Action) personalizados para el carrusel
  const getCTAMessage = (destinationName: string) => {
      const lowerName = destinationName.toLowerCase();
      if (lowerName.includes('san andrés')) return "El paraíso te espera";
      if (lowerName.includes('cartagena')) return "Historia y encanto";
      if (lowerName.includes('santa marta')) return "Naturaleza y mar";
      if (lowerName.includes('eje cafetero')) return "Aroma de montaña";
      if (lowerName.includes('cancún')) return "Fiesta y cultura";
      if (lowerName.includes('punta cana')) return "Relax total";
      return "Vive tu sueño hoy";
  };
  
  return (
    <div className="space-y-16 animate-fade-in">
      
      {/* Hero Carousel Section */}
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-3xl overflow-hidden shadow-2xl mx-auto border border-white/10 group">
        {destinations.length > 0 ? (
            destinations.map((dest, index) => (
                <div 
                    key={dest.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    {/* Background Image with Zoom Effect */}
                    <div className={`absolute inset-0 w-full h-full transform transition-transform duration-[8000ms] ease-out ${index === currentSlide ? 'scale-110' : 'scale-100'}`}>
                        <img 
                            src={dest.image} 
                            alt={dest.name} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-8">
                        {/* 
                           MODIFICACIONES VISUALES:
                           1. max-w-md: Más pequeño que max-w-lg.
                           2. bg-black/5: Mucho más transparente.
                           3. backdrop-blur-[3px]: Menos desenfoque para ver más imagen.
                           4. drop-shadow en textos: Para leer bien sobre imagen clara.
                        */}
                        <div className="backdrop-blur-[3px] bg-black/5 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-sm transform transition-all duration-700 translate-y-0 opacity-100 max-w-md w-full mx-4">
                            <span className="text-pink-200 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs mb-2 block animate-pulse drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Destino Destacado</span>
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-logo tracking-wide">
                                {dest.name}
                            </h2>
                            <p className="text-lg sm:text-xl text-white font-medium mb-5 italic border-b border-pink-500/30 inline-block pb-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                {getCTAMessage(dest.name)}
                            </p>
                            <button
                                onClick={() => setActiveSection(Section.Contacto)}
                                className="px-6 py-2.5 bg-gradient-to-r from-pink-500/90 to-purple-600/90 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto text-sm sm:text-base backdrop-blur-md"
                            >
                                <span>Cotizar Ahora</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            // Fallback if no destinations
            <div className="absolute inset-0 flex items-center justify-center bg-purple-900 text-white">
                <h1 className="text-4xl font-bold">Planifica Tus Sueños</h1>
            </div>
        )}

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {destinations.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${
                        index === currentSlide ? 'bg-pink-500 w-8 border border-white' : 'bg-white/50 hover:bg-white border border-transparent'
                    }`}
                    aria-label={`Ir al slide ${index + 1}`}
                />
            ))}
        </div>
      </section>

      {/* Featured Plans Section */}
      <section>
        <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-md">Planes Destacados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPlans.map((plan: Plan) => (
            <GlassCard key={plan.id} className="flex flex-col relative overflow-hidden border border-white/10 hover:border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-500 group">
              <div className="relative h-80 overflow-hidden cursor-pointer" onClick={() => setDetailModalPlan(plan)}>
                
                {/* Visible Category Label */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-pink-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg border border-pink-400/30">
                        {plan.category}
                    </span>
                </div>

                <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                
                {/* Image with Zoom Effect */}
                <div className="w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-in-out">
                    {plan.images && plan.images.length > 0 ? (
                    <WatermarkedImage 
                        src={plan.images[0]} 
                        alt={plan.title}
                        containerClassName="w-full h-full"
                        logoUrl={logoUrl}
                    />
                    ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white/50">
                        <span className="text-3xl">📷</span>
                    </div>
                    )}
                </div>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />

                {/* Info Overlay on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-1 text-pink-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {plan.city}, {plan.country}
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight mb-2 drop-shadow-md group-hover:text-pink-200 transition-colors">{plan.title}</h3>
                    <p className="text-white/90 font-bold text-lg">{plan.price}</p>
                </div>
              </div>

              {/* Description & Buttons Area */}
              <div className="p-6 flex flex-col flex-grow bg-white/5 backdrop-blur-sm border-t border-white/10">
                <p className="text-white/70 text-sm line-clamp-3 mb-6 flex-grow">
                    {plan.description}
                </p>
                <div className="mt-auto grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setDetailModalPlan(plan)}
                      className="bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/10 hover:border-white/30"
                    >
                      Ver Detalles
                    </button>
                    <button 
                      onClick={() => setQuoteRequestPlan(plan)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Cotizar</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
         <div className="text-center mt-12">
            <button
                onClick={() => setActiveSection(Section.Planes)}
                className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
                Explorar Todos los Planes
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-md">Lo que dicen nuestros viajeros</h2>
        
        <GlassCard className="max-w-md mx-auto mb-8 flex items-center justify-center p-6 gap-4 border border-yellow-400/30 bg-black/20">
            <span className="text-5xl font-bold text-yellow-400 drop-shadow-md">4.9</span>
            <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className={i < 4 ? 'text-yellow-400 drop-shadow' : 'text-yellow-400/50'}>★</span>)}
                </div>
                <p className="text-white/90 font-medium">Calificación en Google</p>
            </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: Testimonial) => (
            <GlassCard key={testimonial.id} className="p-6 flex flex-col h-full hover:bg-white/10 transition-colors">
               <div className="flex mb-4">
                   {[...Array(5)].map((_, i) => (
                       <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                   ))}
              </div>
              <p className="text-white/90 italic flex-grow text-sm leading-relaxed">"{testimonial.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                      {testimonial.author.charAt(0)}
                  </div>
                  <p className="font-bold text-pink-200 text-sm">{testimonial.author}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
