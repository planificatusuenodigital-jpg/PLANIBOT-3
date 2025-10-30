import React, { useState } from 'react';
import { Section } from '../types';
import { LOGO_URL } from '../constants';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
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
    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
      activeSection === section
        ? 'text-white bg-white/20'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { section: Section.Inicio, label: 'Inicio' },
    { section: Section.Planes, label: 'Planes y Servicios' },
    { section: Section.Destinos, label: 'Destinos' },
    { section: Section.Acerca, label: 'Acerca de Nosotros' },
    { section: Section.Contacto, label: 'Contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="m-4 bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button onClick={() => setActiveSection(Section.Inicio)} className="flex-shrink-0">
                <img src={LOGO_URL} alt="Planifica Tu Sueño Logo" className="h-20 w-auto" />
              </button>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {navItems.map(item => (
                  <NavLink key={item.section} {...{...item, activeSection, setActiveSection}}>{item.label}</NavLink>
                ))}
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 focus:outline-none"
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
  );
};

export default Header;
