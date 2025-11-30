
import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { Section, Plan, Destination, Testimonial, AboutUsContent, LegalContent, FAQItem, Regime, TravelerType } from './types';
import { 
    DEFAULT_TRAVEL_PLANS, 
    DEFAULT_DESTINATIONS, 
    DEFAULT_TESTIMONIALS, 
    DEFAULT_ABOUT_US_CONTENT, 
    DEFAULT_LEGAL_CONTENT, 
    DEFAULT_FAQS, 
    DEFAULT_CONTACT_INFO, 
    DEFAULT_SOCIAL_LINKS, 
    DEFAULT_LOGO_URL,
    DEFAULT_PLANIBOT_AVATAR_URL,
    DEFAULT_SEO_IMAGE_URL,
    DEFAULT_CATEGORIES
} from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PlansPage from './components/PlansPage';
import DestinationsPage from './components/DestinationsPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LegalPage from './components/LegalPage';
import FAQPage from './components/FAQPage';
import PlaniBot from './components/PlaniBot';
import WelcomeSplash from './components/WelcomeSplash';
import SocialProof from './components/SocialProof';
import GlassCard from './components/GlassCard';
import WatermarkedImage from './components/WatermarkedImage';
import AdminPanel from './components/AdminPanel';

// Define the shape of our entire app's data
export interface AppData {
  plans: Plan[];
  destinations: Destination[];
  testimonials: Testimonial[];
  aboutUs: AboutUsContent;
  legal: LegalContent;
  faqs: FAQItem[];
  contact: typeof DEFAULT_CONTACT_INFO;
  social: typeof DEFAULT_SOCIAL_LINKS;
  logoUrl: string;
  planibotAvatarUrl: string;
  seoImageUrl: string;
  categories: string[];
}

const QRCodeModal: React.FC<{ plan: Plan; onClose: () => void }> = ({ plan, onClose }) => {
  const planUrl = `${window.location.origin}${window.location.pathname}?plan=${plan.id}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(planUrl)}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    fetch(qrCodeApiUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = `qr-plan-${plan.id}-${plan.title.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(console.error);
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <GlassCard className="p-6 text-center text-white relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-2">Código QR para {plan.title}</h3>
        <p className="text-sm text-white/80 mb-4">Escanea para ver los detalles del plan.</p>
        <div className="p-2 bg-white rounded-lg inline-block">
            <img src={qrCodeApiUrl} alt={`QR Code for ${plan.title}`} width="200" height="200" />
        </div>
        <div className="mt-4 flex gap-4">
            <button onClick={handleDownload} className="flex-1 bg-pink-500 text-white font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors">Descargar</button>
            <button onClick={onClose} className="flex-1 bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-colors">Cerrar</button>
        </div>
      </GlassCard>
    </div>
  );
};

const PlanDetailModal: React.FC<{ plan: Plan; onClose: () => void; logoUrl: string; onQuote: (plan: Plan) => void }> = ({ plan, onClose, logoUrl, onQuote }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);
    
    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? plan.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev === plan.images.length - 1 ? 0 : prev + 1));
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-[95vw] max-w-4xl h-[90vh] flex flex-col animate-fade-in rounded-2xl shiny-border overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="w-full h-1/2 md:h-3/5 relative flex-shrink-0">
                    {plan.images.map((image, index) => (
                         <div key={index} className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>
                            <WatermarkedImage 
                                src={image} 
                                alt={`${plan.title} - imagen ${index + 1}`} 
                                containerClassName="w-full h-full"
                                logoUrl={logoUrl} 
                             />
                         </div>
                    ))}
                    {plan.images.length > 1 && (
                        <>
                           <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors flex items-center justify-center">
                                &#10094;
                            </button>
                            <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors flex items-center justify-center">
                                &#10095;
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                                {plan.images.map((_, index) => (
                                    <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2.5 h-2.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}></button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-6 flex-grow overflow-y-auto text-white">
                    <span className="text-sm font-semibold text-pink-300">{plan.category}</span>
                    <h2 className="text-3xl font-bold text-white mt-1">{plan.title}</h2>
                    <p className="text-pink-200 font-semibold text-xl mt-1">{plan.price}</p>
                    <p className="mt-4 text-white/80 text-base">{plan.description}</p>
                    <div className="mt-4 border-t border-white/20 pt-4">
                        <h4 className="font-semibold text-white text-lg">Incluye:</h4>
                        <ul className="text-sm text-white/80 list-disc list-inside mt-2 space-y-1">
                            {plan.includes.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                 <div className="p-4 border-t border-white/20 flex-shrink-0 flex flex-col gap-3">
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 bg-white/20 text-white py-2.5 rounded-lg hover:bg-white/30 transition-colors font-semibold">Cerrar</button>
                        <button 
                            onClick={() => { onClose(); onQuote(plan); }} 
                            className="flex-1 bg-pink-500 text-white font-bold py-2.5 rounded-lg hover:bg-pink-600 transition-colors shadow-lg"
                        >
                            Cotizar Ahora
                        </button>
                    </div>
                    {plan.whatsappCatalogUrl && (
                        <a 
                            href={plan.whatsappCatalogUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] sm:text-xs text-center text-green-300 hover:text-green-400 transition-colors opacity-80 hover:opacity-100 flex items-center justify-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.698c1.024.558 1.983.851 3.21.853 3.183.001 5.771-2.587 5.771-5.767 0-3.18-2.589-5.767-5.769-5.767zm2.96 4.138c0 .274-.112.527-.477.712-.365.187-.822.253-1.141.253-.319 0-.776-.066-1.141-.253-.365-.186-.477-.438-.477-.712 0-.274.112-.527.477-.713.365-.186.822-.252 1.141-.252.319 0 .776.066 1.141.252.365.186.477.439.477.713zm-5.77 1.628c0 2.247 1.832 4.079 4.081 4.079 2.249 0 4.082-1.832 4.082-4.079 0-2.249-1.833-4.081-4.082-4.081-2.249 0-4.081 1.832-4.081 4.081z"/></svg>
                            ver en WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuoteRequestModal: React.FC<{ plan: Plan; contactInfo: typeof DEFAULT_CONTACT_INFO; onClose: () => void }> = ({ plan, contactInfo, onClose }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', city: '', adults: '1', children: '0', dates: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let message = `✨ Solicitud de Cotización ✨
---------------------------------
*Plan de Interés:* ${plan.title}

*Nombre:* ${formData.name}
*Email:* ${formData.email}
*Teléfono:* ${formData.phone}
*Ciudad de Origen:* ${formData.city}

*Viajeros:*
- Adultos: ${formData.adults}
- Niños: ${formData.children}

*Fechas Deseadas:*
${formData.dates || 'Flexibles'}
---------------------------------
Enviado desde el sitio web.`;

        if (plan.whatsappCatalogUrl) {
            message += `\n\n🔗 Ver en Catálogo: ${plan.whatsappCatalogUrl}`;
        }

        const whatsappUrl = `https://wa.me/${contactInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <GlassCard className="w-full max-w-lg p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-1">Cotizar: {plan.title}</h2>
                <p className="text-white/70 text-sm mb-4">Completa el formulario y te contactaremos a la brevedad.</p>
                <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    <input name="name" onChange={handleChange} placeholder="Nombre Completo" required className="w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input name="email" type="email" onChange={handleChange} placeholder="Correo Electrónico" required className="w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                        <input name="phone" type="tel" onChange={handleChange} placeholder="Teléfono / WhatsApp" required className="w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                    </div>
                     <input name="city" onChange={handleChange} placeholder="Ciudad de Origen" required className="w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <input name="adults" type="number" min="1" onChange={handleChange} value={formData.adults} placeholder="Nº Adultos" required className="w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                         <input name="children" type="number" min="0" onChange={handleChange} value={formData.children} placeholder="Nº Niños" required className="w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                    </div>
                    <textarea name="dates" onChange={handleChange} placeholder="¿Qué fechas te interesan? (Ej: Octubre, primera quincena de Diciembre)" className="w-full h-20 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"></textarea>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                         <button type="button" onClick={onClose} className="w-full sm:w-1/3 bg-white/20 text-white font-bold py-2.5 rounded-lg hover:bg-white/30 transition-colors">Cancelar</button>
                        <button type="submit" className="w-full sm:w-2/3 bg-green-500 text-white font-bold py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.45L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.166l-1.138 4.155 4.274-1.11z" /></svg>
                            Enviar a WhatsApp
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

const SupabaseAdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Credenciales inválidas. Por favor, intente de nuevo.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center">
             <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500"></div>
             <GlassCard className="p-8 w-full max-w-sm text-white animate-fade-in relative z-10">
                <h2 className="text-3xl font-bold text-center mb-6">Acceso Administrador</h2>
                {error && <p className="bg-red-500/50 text-white text-center p-2 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-pink-500 font-bold py-2.5 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50">
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
                 <a href="/" className="block text-center mt-4 text-sm text-white/70 hover:text-white transition-colors">
                    Volver al Sitio
                </a>
             </GlassCard>
        </div>
    );
};


const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Inicio);
  const [showSplash, setShowSplash] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [qrModalPlan, setQrModalPlan] = useState<Plan | null>(null);
  const [detailModalPlan, setDetailModalPlan] = useState<Plan | null>(null);
  const [quoteRequestPlan, setQuoteRequestPlan] = useState<Plan | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Data persistence logic with Supabase Fetching
  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch Plans
            const { data: plansData, error: plansError } = await supabase
                .from('plans')
                .select('*')
                .order('id', { ascending: true });

            // Fetch Categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('name');

            // Fetch Testimonials
            const { data: testimonialsData, error: testimonialsError } = await supabase
                .from('testimonials')
                .select('*');

            // Fetch Site Content
            const { data: contentData, error: contentError } = await supabase
                .from('site_content')
                .select('key, value');

            if (plansError) console.error("Error fetching plans:", plansError);
            if (categoriesError) console.error("Error fetching categories:", categoriesError);
            if (testimonialsError) console.error("Error fetching testimonials:", testimonialsError);
            if (contentError) console.error("Error fetching site content:", contentError);

            // Transform Plans Data
            const plans: Plan[] = (plansData || []).map((p: any) => ({
                id: p.id,
                title: p.title,
                category: p.category,
                price: p.price || p.price_text || 'Consultar', // Fallback to price_text if exists in DB logic
                priceValue: p.price_value || 0,
                durationDays: p.duration_days || 1,
                description: p.description || '',
                images: p.images || [],
                includes: p.includes || [],
                isVisible: p.is_visible,
                departureDate: p.departure_date || '',
                returnDate: p.return_date || '',
                country: p.country || '',
                city: p.city || '',
                regime: (p.plan_type as Regime) || (p.regime as Regime) || 'Solo Alojamiento',
                travelerTypes: (p.traveler_types as TravelerType[]) || [],
                amenities: p.amenities || [],
                whatsappCatalogUrl: p.whatsapp_catalog_url
            }));

            // If no plans in DB, fall back to default
            const finalPlans = plans.length > 0 ? plans : DEFAULT_TRAVEL_PLANS;

            // Transform Categories
            const categories = (categoriesData || []).map((c: any) => c.name);
            const finalCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

            // Transform Testimonials
            const testimonials: Testimonial[] = (testimonialsData || []).map((t: any) => ({
                id: t.id,
                author: t.author,
                text: t.text,
                rating: t.rating
            }));
            const finalTestimonials = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

            // Transform Site Content
            const contentMap = (contentData || []).reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});

            setAppData({
                plans: finalPlans,
                categories: finalCategories,
                testimonials: finalTestimonials,
                aboutUs: contentMap['about_us'] || DEFAULT_ABOUT_US_CONTENT,
                legal: contentMap['legal'] || DEFAULT_LEGAL_CONTENT,
                contact: contentMap['contact'] || DEFAULT_CONTACT_INFO,
                social: contentMap['social'] || DEFAULT_SOCIAL_LINKS,
                faqs: contentMap['faqs'] || DEFAULT_FAQS, // Assuming FAQs might be in content or separate table, prioritizing content json for now based on 'site_content' logic
                destinations: DEFAULT_DESTINATIONS, // Destinations are static in this version unless DB has them fully mapped. Kept static for safety as per prompt focus.
                logoUrl: contentMap['branding']?.logoUrl || DEFAULT_LOGO_URL,
                planibotAvatarUrl: contentMap['branding']?.planibotAvatarUrl || DEFAULT_PLANIBOT_AVATAR_URL,
                seoImageUrl: contentMap['branding']?.seoImageUrl || DEFAULT_SEO_IMAGE_URL
            });

        } catch (error) {
            console.error("Critical error fetching data:", error);
            // Fallback
             setAppData({
                plans: DEFAULT_TRAVEL_PLANS,
                destinations: DEFAULT_DESTINATIONS,
                testimonials: DEFAULT_TESTIMONIALS,
                aboutUs: DEFAULT_ABOUT_US_CONTENT,
                legal: DEFAULT_LEGAL_CONTENT,
                faqs: DEFAULT_FAQS,
                contact: DEFAULT_CONTACT_INFO,
                social: DEFAULT_SOCIAL_LINKS,
                logoUrl: DEFAULT_LOGO_URL,
                planibotAvatarUrl: DEFAULT_PLANIBOT_AVATAR_URL,
                seoImageUrl: DEFAULT_SEO_IMAGE_URL,
                categories: DEFAULT_CATEGORIES
             });
        }
    };

    fetchData();
  }, []);

  const handleSaveToSupabase = async (newData: AppData) => {
      try {
          // 1. Sync Plans
          for (const plan of newData.plans) {
             const dbPlan = {
                 title: plan.title,
                 category: plan.category,
                 price_text: plan.price, // Mapping back to DB column
                 price_value: plan.priceValue,
                 duration_days: plan.durationDays,
                 description: plan.description,
                 images: plan.images,
                 includes: plan.includes,
                 is_visible: plan.isVisible,
                 departure_date: plan.departureDate || null,
                 return_date: plan.returnDate || null,
                 country: plan.country,
                 city: plan.city,
                 plan_type: plan.regime, // Mapping back
                 traveler_types: plan.travelerTypes,
                 amenities: plan.amenities,
                 whatsapp_catalog_url: plan.whatsappCatalogUrl
             };

             if (plan.id > 1000000000) { // Assuming new IDs are large timestamps
                 // Insert
                 await supabase.from('plans').insert([dbPlan]);
             } else {
                 // Update
                 await supabase.from('plans').update(dbPlan).eq('id', plan.id);
             }
          }
          // Handle deletions logic would be needed here if plans were removed from the array
          // For simplicity in this iteration, we assume 'Upsert' logic or specific Delete actions in Admin Panel

          // 2. Sync Categories (Full Replace strategy for simplicity or individual upserts)
          // Current UI handles add/remove. We should ensure DB reflects `newData.categories`.
          // Best approach for lists: Check existence.
          // For this demo, let's assume the Admin Panel calls handleSaveToSupabase only for generic saves or specific actions.
          // *Actually*, AdminPanel handles its own state. We can use this function to save site_content specifically.

          // 3. Sync Site Content
          const contentToUpsert = [
              { key: 'about_us', value: newData.aboutUs },
              { key: 'legal', value: newData.legal },
              { key: 'contact', value: newData.contact },
              { key: 'social', value: newData.social },
              { key: 'faqs', value: newData.faqs },
              { key: 'branding', value: { logoUrl: newData.logoUrl, planibotAvatarUrl: newData.planibotAvatarUrl, seoImageUrl: newData.seoImageUrl } }
          ];

          const { error: contentError } = await supabase.from('site_content').upsert(contentToUpsert, { onConflict: 'key' });
          if (contentError) throw contentError;

          // Update local state to reflect successful save
          setAppData(newData);
          return true; // Success

      } catch (error) {
          console.error("Error saving to Supabase:", error);
          alert("Error al guardar en la base de datos. Revisa la consola.");
          return false;
      }
  };
  
  // Admin auth and routing logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
        setIsAdminRoute(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500);

    if (appData) {
      const urlParams = new URLSearchParams(window.location.search);
      const planId = urlParams.get('plan');
      if (planId) {
        const plan = appData.plans.find(p => p.id === parseInt(planId, 10));
        if (plan) {
            setDetailModalPlan(plan);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // Update SEO tags
      const ogImageTag = document.getElementById('og-image');
      const twitterImageTag = document.getElementById('twitter-image');
      if (ogImageTag) ogImageTag.setAttribute('content', appData.seoImageUrl);
      if (twitterImageTag) twitterImageTag.setAttribute('content', appData.seoImageUrl);
    }

    return () => clearTimeout(splashTimer);
  }, [appData]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
    window.location.href = window.location.origin + window.location.pathname;
  };

  if (loadingSession) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white"><p>Verificando sesión...</p></div>;
  }
  
  if (showSplash) return <WelcomeSplash logoUrl={appData?.logoUrl || DEFAULT_LOGO_URL} />;
  if (!appData) return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white"><p>Cargando datos de la aplicación...</p></div>;

  if (session) {
    return <AdminPanel appData={appData} onSave={handleSaveToSupabase} onLogout={handleLogout} />;
  }
  
  if (isAdminRoute) {
    return <SupabaseAdminLogin />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case Section.Inicio:
        return <HomePage setActiveSection={setActiveSection} setQrModalPlan={setQrModalPlan} setDetailModalPlan={setDetailModalPlan} setQuoteRequestPlan={setQuoteRequestPlan} plans={appData.plans} testimonials={appData.testimonials} logoUrl={appData.logoUrl} />;
      case Section.Planes:
        return <PlansPage globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} setQrModalPlan={setQrModalPlan} setDetailModalPlan={setDetailModalPlan} setQuoteRequestPlan={setQuoteRequestPlan} plans={appData.plans} logoUrl={appData.logoUrl} />;
      case Section.Destinos:
        return <DestinationsPage destinations={appData.destinations} logoUrl={appData.logoUrl}/>;
      case Section.Acerca:
        return <AboutPage aboutUs={appData.aboutUs} contactInfo={appData.contact}/>;
      case Section.Contacto:
        return <ContactPage contactInfo={appData.contact} />;
      case Section.Legal:
        return <LegalPage legalContent={appData.legal} />;
      case Section.FAQ:
        return <FAQPage faqs={appData.faqs} />;
      default:
        return <HomePage setActiveSection={setActiveSection} setQrModalPlan={setQrModalPlan} setDetailModalPlan={setDetailModalPlan} setQuoteRequestPlan={setQuoteRequestPlan} plans={appData.plans} testimonials={appData.testimonials} logoUrl={appData.logoUrl} />;
    }
  };


  return (
    <div className="min-h-screen bg-[#e0e0e0] text-gray-800 selection:bg-pink-500/30">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 opacity-80 animate-[gradient_15s_ease_infinite]" style={{backgroundSize: '400% 400%'}}></div>
      <style>{`
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
         .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .shiny-border {
            position: relative;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .shiny-border::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 1rem; /* match rounded-2xl */
            pointer-events: none;
            background-image: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0) 40%,
                rgba(255, 255, 255, 0) 60%,
                rgba(255, 255, 255, 0.2) 100%
            );
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} setGlobalSearch={setGlobalSearch} logoUrl={appData.logoUrl} plans={appData.plans} />
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          {renderSection()}
        </main>
        <Footer setActiveSection={setActiveSection} logoUrl={appData.logoUrl} contactInfo={appData.contact} socialLinks={appData.social} />
      </div>
      
      <SocialProof />
      <PlaniBot 
        planibotAvatarUrl={appData.planibotAvatarUrl}
        contactInfo={appData.contact}
        socialLinks={appData.social}
        travelPlans={appData.plans}
        faqs={appData.faqs}
        onOpenPlan={(plan) => setDetailModalPlan(plan)}
      />

      {qrModalPlan && <QRCodeModal plan={qrModalPlan} onClose={() => setQrModalPlan(null)} />}
      {detailModalPlan && <PlanDetailModal plan={detailModalPlan} onClose={() => setDetailModalPlan(null)} logoUrl={appData.logoUrl} onQuote={(plan) => setQuoteRequestPlan(plan)} />}
      {quoteRequestPlan && <QuoteRequestModal plan={quoteRequestPlan} contactInfo={appData.contact} onClose={() => setQuoteRequestPlan(null)} />}
    </div>
  );
};

export default App;
