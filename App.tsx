import React, { useState, useEffect, useCallback } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { Section, Plan, Destination, Testimonial, AboutUsContent, LegalContent, FAQItem } from './types';
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
    DEFAULT_SEO_IMAGE_URL
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

// Supabase client initialization
const supabaseUrl = 'https://vwckkdlyxsrohqnlsevg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2trZGx5eHNyb2hxbmxzZXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDM0MTksImV4cCI6MjA3NzQ3OTQxOX0.mv_WdRDJyjoO2p0fPRAGZ4Q-dG78whJ7kGDZRQuVOn8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the shape of our entire app's data
interface AppData {
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

const PlanDetailModal: React.FC<{ plan: Plan; onClose: () => void; logoUrl: string }> = ({ plan, onClose, logoUrl }) => {
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
                 <div className="p-4 border-t border-white/20 flex-shrink-0">
                    <button onClick={onClose} className="w-full bg-white/20 text-white py-2.5 rounded-lg hover:bg-white/30 transition-colors font-semibold">Cerrar</button>
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
        const message = `✨ Solicitud de Cotización ✨
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
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                            required
                        />
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
  
  // Data persistence logic
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('appData');
      if (storedData) {
        setAppData(JSON.parse(storedData));
      } else {
        const defaultData: AppData = {
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
        };
        setAppData(defaultData);
        localStorage.setItem('appData', JSON.stringify(defaultData));
      }
    } catch (error) {
      console.error("Failed to load or parse app data from localStorage", error);
    }
  }, []);

  const handleSetAppData = useCallback((data: AppData) => {
    setAppData(data);
    localStorage.setItem('appData', JSON.stringify(data));
  }, []);
  
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
    // The onAuthStateChange listener will handle setting session to null.
    // Navigate home after logout.
    window.location.href = window.location.origin + window.location.pathname;
  };

  if (loadingSession) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white"><p>Verificando sesión...</p></div>;
  }
  
  if (showSplash) return <WelcomeSplash logoUrl={appData?.logoUrl || DEFAULT_LOGO_URL} />;
  if (!appData) return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white"><p>Cargando datos de la aplicación...</p></div>;

  if (session) {
    return <AdminPanel appData={appData} setAppData={handleSetAppData} onLogout={handleLogout} />;
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
        <Header activeSection={activeSection} setActiveSection={setActiveSection} setGlobalSearch={setGlobalSearch} logoUrl={appData.logoUrl} />
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          {renderSection()}
        </main>
        <Footer setActiveSection={setActiveSection} logoUrl={appData.logoUrl} contactInfo={appData.contact} socialLinks={appData.social} />
      </div>
      
      <SocialProof />
      <PlaniBot 
        planibotAvatarUrl={appData.planibotAvatarUrl}
        contactInfo={appData.contact}
      />

      {qrModalPlan && <QRCodeModal plan={qrModalPlan} onClose={() => setQrModalPlan(null)} />}
      {detailModalPlan && <PlanDetailModal plan={detailModalPlan} onClose={() => setDetailModalPlan(null)} logoUrl={appData.logoUrl} />}
      {quoteRequestPlan && <QuoteRequestModal plan={quoteRequestPlan} contactInfo={appData.contact} onClose={() => setQuoteRequestPlan(null)} />}
    </div>
  );
};

export default App;