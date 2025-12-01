
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Section, Plan } from '../types';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  setGlobalSearch: (term: string) => void;
  logoUrl: string;
  plans: Plan[];
}

const NavLink: React.FC<{
  section: Section;
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ section, activeSection, setActiveSection, children, onClick }) => (
  <button
    onClick={() => {
      setActiveSection(section);
      if (onClick) onClick();
    }}
    className={`w-full text-left md:w-auto md:text-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
      activeSection === section
        ? 'text-white bg-white/20'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

// Algoritmo de Levenshtein para calcular la "distancia" entre dos palabras (Corrección ortográfica)
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const SearchModal: React.FC<{
    onClose: () => void;
    setGlobalSearch: (term: string) => void;
    setActiveSection: (section: Section) => void;
    plans: Plan[];
}> = ({ onClose, setGlobalSearch, setActiveSection, plans }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Configuración del Reconocimiento de Voz
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Detenerse después de una frase para búsqueda
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'es-ES';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                // Eliminar punto final si el navegador lo agrega
                const cleanTranscript = transcript.endsWith('.') ? transcript.slice(0, -1) : transcript;
                setSearchTerm(cleanTranscript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setSearchTerm('');
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };

    const handleSearch = (term: string) => {
        if (!term.trim()) return;
        setGlobalSearch(term);
        setActiveSection(Section.Planes);
        setSearchTerm('');
        onClose();
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const suggestions = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        
        const lowerTerm = searchTerm.toLowerCase();
        
        // Mapeamos los planes con un puntaje de relevancia
        const scoredPlans = plans.filter(p => p.isVisible).map(plan => {
            const title = plan.title.toLowerCase();
            const city = plan.city.toLowerCase();
            const country = plan.country.toLowerCase();
            
            // 1. Coincidencia Exacta o Parcial (Prioridad Alta)
            if (title.includes(lowerTerm) || city.includes(lowerTerm)) return { plan, score: 0 };
            
            // 2. Búsqueda Difusa (Fuzzy) - Corrección ortográfica
            // Comparamos el término de búsqueda con palabras clave del título y ciudad
            const titleWords = title.split(' ');
            const cityWords = city.split(' ');
            const allWords = [...titleWords, ...cityWords, country];
            
            let minDistance = 100;
            
            allWords.forEach(word => {
                const dist = levenshteinDistance(word, lowerTerm);
                if (dist < minDistance) minDistance = dist;
            });

            // Si la distancia es baja (ej: <= 2 errores), lo consideramos relevante
            // Ajustamos la tolerancia según el largo de la palabra
            const tolerance = lowerTerm.length > 4 ? 2 : 1;
            
            if (minDistance <= tolerance) return { plan, score: minDistance };
            
            return null;
        }).filter(item => item !== null) as { plan: Plan, score: number }[];

        // Ordenamos por puntaje (menor distancia es mejor)
        scoredPlans.sort((a, b) => a.score - b.score);

        return scoredPlans.slice(0, 5).map(item => item.plan);
    }, [searchTerm, plans]);
    
    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                 <form onSubmit={handleSubmit} className="relative group">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={isListening ? "Escuchando..." : "¿A dónde sueñas ir? (ej: Cartagena, San Andres...)"}
                        autoFocus
                        className="w-full bg-white/10 backdrop-blur-xl border border-white/30 text-white text-xl placeholder-white/50 rounded-2xl px-6 py-5 pr-28 focus:ring-4 focus:ring-pink-500/30 focus:outline-none focus:border-pink-400 transition-all shadow-2xl"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            title={isListening ? "Detener escucha" : "Buscar por voz"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>
                        <button type="submit" className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    </div>
                </form>
                 {suggestions.length > 0 && (
                    <div className="mt-4 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-fade-in shadow-2xl">
                        <p className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Sugerencias</p>
                        <ul>
                            {suggestions.map(plan => (
                                <li key={plan.id} className="border-b border-white/5 last:border-none">
                                    <button 
                                        onClick={() => handleSearch(plan.title)}
                                        className="w-full text-left flex items-center gap-4 p-3 hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={plan.images[0]} alt={plan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div>
                                            <span className="text-white font-medium text-lg block group-hover:text-pink-300 transition-colors">{plan.title}</span>
                                            <span className="text-white/50 text-sm">{plan.city}, {plan.country}</span>
                                        </div>
                                        <div className="ml-auto text-pink-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {searchTerm && suggestions.length === 0 && !isListening && (
                     <div className="mt-4 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center animate-fade-in">
                        <p className="text-white/60">No encontramos resultados exactos, pero intenta buscar por ciudad o país.</p>
                     </div>
                )}
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, setGlobalSearch, logoUrl, plans }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 10) {
            setIsVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            // Scrolling down & past threshold
            setIsVisible(false);
        } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up
            setIsVisible(true);
        }
        
        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { section: Section.Inicio, label: 'Inicio' },
    { section: Section.Planes, label: 'Planes y Servicios' },
    { section: Section.Destinos, label: 'Destinos' },
    { section: Section.Acerca, label: 'Acerca de Nosotros' },
    { section: Section.Contacto, label: 'Contacto' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="m-4 bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center">
                <button onClick={() => setActiveSection(Section.Inicio)} className="flex-shrink-0">
                  <img src={logoUrl} alt="Planifica Tu Sueño Logo" className="h-16 md:h-20 w-auto" />
                </button>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-baseline space-x-1">
                  {navItems.map(item => (
                    <NavLink key={item.section} {...{...item, activeSection, setActiveSection}}>{item.label}</NavLink>
                  ))}
                </div>
                 <button onClick={() => setIsSearchOpen(true)} className="ml-2 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
              <div className="-mr-2 flex md:hidden">
                 <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 focus:outline-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 focus:outline-none"
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map(item => (
                   <NavLink key={item.section} {...{...item, activeSection, setActiveSection}} onClick={() => setIsMenuOpen(false)}>{item.label}</NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} setGlobalSearch={setGlobalSearch} setActiveSection={setActiveSection} plans={plans} />}
    </>
  );
};

export default Header;
