
import React, { useState } from 'react';
import { Section } from '../types';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  setGlobalSearch: (term: string) => void;
  logoUrl: string;
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

const SearchModal: React.FC<{
    onClose: () => void;
    setGlobalSearch: (term: string) => void;
    setActiveSection: (section: Section) => void;
}> = ({ onClose, setGlobalSearch, setActiveSection }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setGlobalSearch(searchTerm);
        setActiveSection(Section.Planes);
        setSearchTerm('');
        onClose();
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                 <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Busca tu próxima aventura soñada..."
                        autoFocus
                        className="w-full bg-white/20 border border-white/30 text-white text-lg placeholder-white/60 rounded-full px-6 py-3 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, setGlobalSearch, logoUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { section: Section.Inicio, label: 'Inicio' },
    { section: Section.Planes, label: 'Planes y Servicios' },
    { section: Section.Destinos, label: 'Destinos' },
    { section: Section.Acerca, label: 'Acerca de Nosotros' },
    { section: Section.Contacto, label: 'Contacto' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
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
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} setGlobalSearch={setGlobalSearch} setActiveSection={setActiveSection} />}
    </>
  );
};

export default Header;