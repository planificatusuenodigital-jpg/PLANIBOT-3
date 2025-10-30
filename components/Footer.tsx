
import React, { useState, useRef } from 'react';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from '../constants';
import { Section } from '../types';

interface FooterProps {
  setActiveSection: (section: Section) => void;
  logoUrl: string;
  contactInfo: typeof DEFAULT_CONTACT_INFO;
  socialLinks: typeof DEFAULT_SOCIAL_LINKS;
}

const Footer: React.FC<FooterProps> = ({ setActiveSection, logoUrl, contactInfo, socialLinks }) => {
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimeoutRef = useRef<number | null>(null);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (newCount >= 5) {
      window.location.search = 'admin=true';
      setLogoClickCount(0);
    } else {
      clickTimeoutRef.current = window.setTimeout(() => {
        setLogoClickCount(0);
      }, 1500); // Reset count if no click for 1.5 seconds
    }
  };

  return (
    <footer className="relative z-20 mx-4 mb-4 bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg text-white">
      <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="space-y-4 md:col-span-2">
            <button onClick={handleLogoClick} title="Admin Access">
                <img src={logoUrl} alt="Planifica Tu Sueño Logo" className="h-16 md:h-20 w-auto mx-auto md:mx-0" />
            </button>
            <p className="text-white/70 text-sm">Tu aventura comienza aquí. Hacemos realidad el viaje de tus sueños con planes personalizados y un servicio excepcional.</p>
            <p className="text-white/70 text-sm">RNT: {contactInfo.rnt}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-white">Navegación</h4>
            <ul className="text-sm text-white/70 space-y-1">
                <li><button onClick={() => setActiveSection(Section.Inicio)} className="hover:text-pink-300">Inicio</button></li>
                <li><button onClick={() => setActiveSection(Section.Planes)} className="hover:text-pink-300">Planes</button></li>
                <li><button onClick={() => setActiveSection(Section.Destinos)} className="hover:text-pink-300">Destinos</button></li>
                <li><button onClick={() => setActiveSection(Section.Acerca)} className="hover:text-pink-300">Nosotros</button></li>
                 <li><button onClick={() => setActiveSection(Section.Contacto)} className="hover:text-pink-300">Contacto</button></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-white">Síguenos</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427.465C9.792 2.013 10.146 2 12.315 2zm-1.002 6.363a4.26 4.26 0 100 8.52 4.26 4.26 0 000-8.52zm-6.153-3.012a1.24 1.24 0 100 2.48 1.24 1.24 0 000-2.48z" clipRule="evenodd" /></svg>
              </a>
               <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.85-.98-6.42-2.98-2.09-2.68-2.75-5.94-1.92-9.03.83-3.09 3.49-5.59 6.42-6.32.09-.03 1.7-.5 1.7-.5s.38-.13.44-.15c.56-.21 1.12-.42 1.68-.62.05-.02.1-.03.15-.05.1-.03.2-.07.3-.1.05-.02.1-.03.15-.05.28-.09.56-.19.84-.28.05-.01.1-.03.15-.04.48-.15.96-.31 1.44-.47v-4.03c-.94.22-1.89.43-2.83.67-1.42.36-2.85.7-4.27 1.02.01-1.63.01-3.26.02-4.89.01-1.28.52-2.56 1.38-3.62 1.16-1.45 2.89-2.34 4.64-2.34.02 0 .04 0 .06.01z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-4 text-center text-sm text-white/60 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <p>&copy; {new Date().getFullYear()} Planifica Tu Sueño. Todos los derechos reservados.</p>
          <div className='flex gap-4'>
            <button onClick={() => setActiveSection(Section.Legal)} className="underline hover:text-white transition-colors">
              Políticas de Privacidad
            </button>
            <button onClick={() => setActiveSection(Section.FAQ)} className="underline hover:text-white transition-colors">
              Preguntas Frecuentes
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;