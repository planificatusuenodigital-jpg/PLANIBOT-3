import React, { useState, useEffect } from 'react';
import { Section } from './types';
import { CONTACT_INFO } from './constants';
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

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Inicio);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case Section.Inicio:
        return <HomePage setActiveSection={setActiveSection} />;
      case Section.Planes:
        return <PlansPage />;
      case Section.Destinos:
        return <DestinationsPage />;
      case Section.Acerca:
        return <AboutPage />;
      case Section.Contacto:
        return <ContactPage />;
      case Section.Legal:
        return <LegalPage />;
      case Section.FAQ:
        return <FAQPage />;
      default:
        return <HomePage setActiveSection={setActiveSection} />;
    }
  };

  if (showSplash) {
    return <WelcomeSplash />;
  }

  return (
    <div className="min-h-screen bg-[#e0e0e0] text-gray-800 selection:bg-pink-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 opacity-80 animate-[gradient_15s_ease_infinite]" style={{backgroundSize: '400% 400%'}}></div>
      <style>{`
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          {renderSection()}
        </main>
        <Footer setActiveSection={setActiveSection} />
      </div>
      
      <SocialProof />
      <PlaniBot />
    </div>
  );
};

export default App;
