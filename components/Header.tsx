
import React, { useState } from 'react';
import { Section } from '../types';
import { CONTACT_INFO } from '../constants';

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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => setActiveSection(Section.Inicio)} className="flex-shrink-0 text-white flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12.71,2.29a1,1,0,0,0-1.42,0l-9,9a1,1,0,0,0,0,1.42A1,1,0,0,0,3,13H4.08L2.2,16.7a1,1,0,0,0,1.21,1.21l3.59-1.88a1,1,0,0,0,.6-.16l.37-.21a1,1,0,0,0,.42,0l.33.19.09.05.37.21a1,1,0,0,0,.6.16l3.59,1.88a1,1,0,0,0,1.21-1.21L14.92,13H16a1,1,0,0,0,.71-1.71A1,1,0,0,0,17,11l2-2,2.71-2.71a1,1,0,0,0,0-1.42,1,1,0,0,0-1.42,0L18,7.17V4a1,1,0,0,0-2,0v2.17l-2-2L12.71,2.29ZM11,12.59,9.41,14,8.5,13.52,7.41,14,6,12.59,7.41,11.17,6,9.76,7.41,8.34,8.5,8.83l1.09-.58L11,6.84,12.59,8.34,14,9.76,12.59,11.17,14,12.59,11,12.59Z"/></svg>
                <span className="font-logo text-3xl">Planifica Tu Sueño</span>
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
