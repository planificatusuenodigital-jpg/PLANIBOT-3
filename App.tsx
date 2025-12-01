import React, { useState, useEffect } from 'react';
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
import AdminPanel from './components/AdminPanel';
import WatermarkedImage from './components/WatermarkedImage';
import TextToSpeechButton from './components/TextToSpeechButton';
import { Plan, Testimonial, Section, Destination, AboutUsContent, LegalContent, FAQItem } from './types';
import { 
  DEFAULT_LOGO_URL, 
  DEFAULT_PLANIBOT_AVATAR_URL, 
  DEFAULT_SEO_IMAGE_URL,
  DEFAULT_CONTACT_INFO, 
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_TRAVEL_PLANS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_DESTINATIONS,
  DEFAULT_ABOUT_US_CONTENT,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_FAQS,
  DEFAULT_CATEGORIES
} from './constants';

const QRCodeModal: React.FC<{ plan: Plan; onClose: () => void }> = ({ plan, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{plan.title}</h3>
                <div className="flex justify-center mb-4">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '?plan=' + plan.id)}`} alt="QR Code" />
                </div>
                <p className="text-sm text-gray-500 mb-4">Escanea para ver los detalles en tu móvil</p>
                <button onClick={onClose} className="px-4 py-2 bg-pink-500 text-white rounded-lg">Cerrar</button>
            </div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6" onClick={onClose}>
            <div 
                className="w-full max-w-4xl h-[85vh] flex flex-col animate-fade-in rounded-2xl shiny-border overflow-hidden bg-[#1a1a1a] shadow-2xl relative" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-full h-1/2 md:h-3/5 relative flex-shrink-0 group">
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
                           <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 text-white hover:bg-pink-600 transition-colors flex items-center justify-center backdrop-blur-sm border border-white/10">
                                &#10094;
                            </button>
                            <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 text-white hover:bg-pink-600 transition-colors flex items-center justify-center backdrop-blur-sm border border-white/10">
                                &#10095;
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-1.5 rounded-full bg-black/20 backdrop-blur-sm">
                                {plan.images.map((_, index) => (
                                    <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-pink-500 w-4' : 'bg-white/50 hover:bg-white'}`}></button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-6 flex-grow overflow-y-auto text-white custom-scrollbar">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-1">{plan.category}</span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{plan.title}</h2>
                            <p className="text-pink-400 font-bold text-xl mt-1">{plan.price}</p>
                        </div>
                        <TextToSpeechButton title={plan.title} description={plan.description} includes={plan.includes} className="hidden sm:flex" />
                        <TextToSpeechButton title={plan.title} description={plan.description} includes={plan.includes} mini={true} className="sm:hidden" />
                    </div>
                    
                    <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">{plan.description}</p>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-t border-white/10 pt-4">
                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                <span className="text-green-400">✓</span> Incluye
                            </h4>
                            <ul className="text-sm text-white/70 mt-2 space-y-1.5">
                                {plan.includes.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-white/50 mt-1.5"></span>{item}</li>)}
                            </ul>
                        </div>
                        {plan.amenities && plan.amenities.length > 0 && (
                            <div className="border-t border-white/10 pt-4">
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    <span className="text-yellow-400">★</span> Comodidades
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {plan.amenities.map((item, i) => (
                                        <span key={i} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-md border border-white/5">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="p-4 border-t border-white/10 flex-shrink-0 flex flex-col gap-3 bg-black/20">
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 bg-white/10 text-white py-3 rounded-xl hover:bg-white/20 transition-colors font-semibold border border-white/10">Cerrar</button>
                        <button 
                            onClick={() => { onClose(); onQuote(plan); }} 
                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all shadow-pink-500/20"
                        >
                            Cotizar Ahora
                        </button>
                    </div>
                    {plan.whatsappCatalogUrl && (
                        <a 
                            href={plan.whatsappCatalogUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-center text-green-400 hover:text-green-300 transition-colors opacity-90 hover:opacity-100 flex items-center justify-center gap-1 py-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.698c1.024.558 1.983.851 3.21.853 3.183.001 5.771-2.587 5.771-5.767 0-3.18-2.589-5.767-5.769-5.767zm2.96 4.138c0 .274-.112.527-.477.712-.365.187-.822.253-1.141.253-.319 0-.776-.066-1.141-.253-.365-.186-.477-.438-.477-.712 0-.274.112-.527.477-.713.365-.186.822-.252 1.141-.252.319 0 .776.066 1.141.252.365.186.477.439.477.713zm-5.77 1.628c0 2.247 1.832 4.079 4.081 4.079 2.249 0 4.082-1.832 4.082-4.079 0-2.249-1.833-4.081-4.082-4.081-2.249 0-4.081 1.832-4.081 4.081z"/></svg>
                            Ver en Catálogo de WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>(Section.Inicio);
    const [isAdmin, setIsAdmin] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    
    // Data states
    const [plans, setPlans] = useState<Plan[]>(DEFAULT_TRAVEL_PLANS);
    const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
    const [destinations, setDestinations] = useState<Destination[]>(DEFAULT_DESTINATIONS);
    const [aboutUs, setAboutUs] = useState<AboutUsContent>(DEFAULT_ABOUT_US_CONTENT);
    const [legal, setLegal] = useState<LegalContent>(DEFAULT_LEGAL_CONTENT);
    const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
    const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_INFO);
    const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);
    const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);
    const [avatarUrl, setAvatarUrl] = useState(DEFAULT_PLANIBOT_AVATAR_URL);
    const [seoImage, setSeoImage] = useState(DEFAULT_SEO_IMAGE_URL);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

    // Modals
    const [qrModalPlan, setQrModalPlan] = useState<Plan | null>(null);
    const [detailModalPlan, setDetailModalPlan] = useState<Plan | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('admin') === 'true') {
            setIsAdmin(true);
        }
        
        const planId = queryParams.get('plan');
        if (planId) {
            const plan = plans.find(p => p.id === Number(planId));
            if (plan) {
                setDetailModalPlan(plan);
                setActiveSection(Section.Planes);
            }
        }
    }, [plans]);

    const handleQuoteRequest = (plan: Plan) => {
        const message = `Hola, estoy interesado en el plan: ${plan.title} (${plan.price}). Me gustaría recibir más información.`;
        const whatsappUrl = `https://wa.me/${contactInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSaveAdminData = async (newData: any) => {
        setPlans(newData.plans);
        setTestimonials(newData.testimonials);
        setAboutUs(newData.aboutUs);
        setLegal(newData.legal);
        setFaqs(newData.faqs);
        setContactInfo(newData.contact);
        setSocialLinks(newData.social);
        setLogoUrl(newData.logoUrl);
        setAvatarUrl(newData.planibotAvatarUrl);
        setCategories(newData.categories);
        // Here you would typically save to Supabase
        return true;
    };

    if (isAdmin) {
        return (
            <AdminPanel 
                appData={{
                    plans, testimonials, aboutUs, legal, faqs, contact: contactInfo, 
                    social: socialLinks, logoUrl, planibotAvatarUrl: avatarUrl, 
                    seoImageUrl: seoImage, categories: categories,
                }}
                onSave={handleSaveAdminData}
                onLogout={() => { setIsAdmin(false); window.location.search = ''; }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-x-hidden font-sans">
            <WelcomeSplash logoUrl={logoUrl} />
            
            <Header 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
                setGlobalSearch={setGlobalSearch}
                logoUrl={logoUrl}
                plans={plans}
            />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                {activeSection === Section.Inicio && (
                    <HomePage 
                        setActiveSection={setActiveSection}
                        setQrModalPlan={setQrModalPlan}
                        setDetailModalPlan={setDetailModalPlan}
                        setQuoteRequestPlan={handleQuoteRequest}
                        plans={plans}
                        testimonials={testimonials}
                        logoUrl={logoUrl}
                        destinations={destinations}
                    />
                )}
                {activeSection === Section.Planes && (
                    <PlansPage 
                        globalSearch={globalSearch}
                        setGlobalSearch={setGlobalSearch}
                        setQrModalPlan={setQrModalPlan}
                        setDetailModalPlan={setDetailModalPlan}
                        setQuoteRequestPlan={handleQuoteRequest}
                        plans={plans}
                        logoUrl={logoUrl}
                    />
                )}
                {activeSection === Section.Destinos && <DestinationsPage destinations={destinations} logoUrl={logoUrl} />}
                {activeSection === Section.Acerca && <AboutPage aboutUs={aboutUs} contactInfo={contactInfo} />}
                {activeSection === Section.Contacto && <ContactPage contactInfo={contactInfo} />}
                {activeSection === Section.Legal && <LegalPage legalContent={legal} />}
                {activeSection === Section.FAQ && <FAQPage faqs={faqs} />}
            </div>

            <Footer 
                setActiveSection={setActiveSection} 
                logoUrl={logoUrl} 
                contactInfo={contactInfo} 
                socialLinks={socialLinks} 
            />
            
            <PlaniBot 
                planibotAvatarUrl={avatarUrl}
                contactInfo={contactInfo}
                socialLinks={socialLinks}
                travelPlans={plans}
                faqs={faqs}
                onOpenPlan={setDetailModalPlan}
            />
            
            <SocialProof />

            {qrModalPlan && (
                <QRCodeModal plan={qrModalPlan} onClose={() => setQrModalPlan(null)} />
            )}
            
            {detailModalPlan && (
                <PlanDetailModal 
                    plan={detailModalPlan} 
                    onClose={() => setDetailModalPlan(null)} 
                    logoUrl={logoUrl}
                    onQuote={handleQuoteRequest}
                />
            )}
        </div>
    );
};

export default App;