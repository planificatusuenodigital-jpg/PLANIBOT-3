
import React, { useState, useMemo, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';
import TextToSpeechButton from './TextToSpeechButton';
import { Plan, Regime, TravelerType } from '../types';

interface PlansPageProps {
    globalSearch: string;
    setGlobalSearch: (term: string) => void;
    setQrModalPlan: (plan: Plan) => void;
    setDetailModalPlan: (plan: Plan) => void;
    setQuoteRequestPlan: (plan: Plan) => void;
    plans: Plan[];
    logoUrl: string;
}

const ALL_AMENITIES = {
    'Comodidades Principales': ['Piscina', 'Acceso a la Playa', 'A pocos metros de la playa', 'Ubicación privilegiada en Bocagrande', 'Wifi Gratis', 'Aire Acondicionado', 'Estacionamiento', 'Restaurante', 'Bar / Lounge'],
    'Bienestar y Relax': ['Jacuzzi', 'Spa', 'Sauna', 'Turco / Baño de vapor', 'Gimnasio'],
    'Para Familias': ['Piscina para niños', 'Club de niños', 'Toboganes / Parque Acuático'],
    'Actividades': ['Shows Nocturnos / Animación', 'Discoteca / Club Nocturno', 'Casino', 'Campo de Golf'],
    'Por Habitación': ['Balcón / Terraza', 'Vista al Mar', 'Agua Caliente'],
};

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
            navigator.clipboard.writeText(shareData.url).then(() => {
                alert('¡Enlace del plan copiado al portapapeles!');
            });
        }
    };

    return (
        <div className="absolute top-2 right-2 flex gap-1 sm:gap-2 z-10">
            <div className="scale-75 sm:scale-100 origin-top-right">
                 <TextToSpeechButton 
                    title={plan.title} 
                    description={plan.description} 
                    includes={plan.includes} 
                    mini={true} 
                />
            </div>
            <button onClick={(e) => {e.stopPropagation(); setQrModalPlan(plan)}} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center" title="Generar Código QR">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5h3v3H5V5zm0 7h3v3H5v-3zM12 5h3v3h-3V5zm0 7h3v3h-3v-3z"/><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 1h10v10H4V4z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={(e) => {e.stopPropagation(); handleShare()}} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center" title="Compartir Plan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            </button>
        </div>
    );
};

const initialFilters = {
    searchTerm: '',
    country: 'Todos',
    city: 'Todos',
    regime: 'Todos',
    travelerTypes: [] as TravelerType[],
    amenities: [] as string[],
    priceRange: { min: '', max: '' },
};

// --- Extracted Components to prevent re-renders ---

const FilterGroup: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="py-3 border-b border-white/20">
      <h3 className="font-bold text-white mb-3 text-lg drop-shadow-md">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
);

const Checkbox: React.FC<{label: string, value: string, checked: boolean, onChange: (value: string) => void}> = ({ label, value, checked, onChange }) => (
    <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer hover:text-white transition-colors group">
      <input type="checkbox" checked={checked} onChange={() => onChange(value)} className="w-4 h-4 rounded bg-white/10 border-white/40 text-pink-500 focus:ring-pink-400 group-hover:border-white transition-colors" />
      <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
    </label>
);

const FiltersSidebar: React.FC<{
    filters: typeof initialFilters;
    onFilterChange: (name: string, value: any) => void;
    onClear: () => void;
    allCountries: string[];
    allCities: string[];
    allRegimes: string[];
    allTravelerTypes: string[];
    onClose?: () => void;
    className?: string; // Allow custom classes for wrapper
}> = ({ filters, onFilterChange, onClear, allCountries, allCities, allRegimes, allTravelerTypes, onClose, className }) => {
    
    const handleCheckboxChange = (filterKey: 'travelerTypes' | 'amenities', value: string) => {
        const currentValues = filters[filterKey] as string[];
        const newValues = currentValues.includes(value) 
            ? currentValues.filter(v => v !== value) 
            : [...currentValues, value];
        onFilterChange(filterKey, newValues);
    };

    const selectStyle = "w-full bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-400 focus:outline-none focus:bg-white/20 transition-all appearance-none shadow-inner";

    const hasActiveFilters = 
        filters.searchTerm !== '' ||
        filters.country !== 'Todos' ||
        filters.city !== 'Todos' ||
        filters.regime !== 'Todos' ||
        filters.travelerTypes.length > 0 ||
        filters.amenities.length > 0 ||
        filters.priceRange.min !== '' ||
        filters.priceRange.max !== '';

    return (
        <div className={`p-5 h-full flex flex-col ${className || 'bg-black/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg'}`}>
            <div className='flex flex-col gap-3 mb-2 border-b border-white/10 pb-3 flex-shrink-0'>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-white tracking-wide drop-shadow-md">Filtros</h2>
                        {onClose && hasActiveFilters && (
                            <span className="bg-pink-500/80 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-full text-white font-bold border border-pink-400/50 shadow-lg">
                                Activos
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3 items-center">
                        <button onClick={onClear} className="text-xs text-pink-300 hover:text-white font-semibold underline decoration-pink-300/50 hover:decoration-white transition-all">
                            Borrar
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 border border-white/20 flex items-center justify-center gap-2">
                        Ver Resultados
                    </button>
                )}
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-1 pb-4">
                <FilterGroup title="Buscar">
                    <input type="text" placeholder="Busca tu aventura..." value={filters.searchTerm} onChange={e => onFilterChange('searchTerm', e.target.value)} className={selectStyle}/>
                </FilterGroup>
                <FilterGroup title="Ubicación">
                    <select value={filters.country} onChange={e => onFilterChange('country', e.target.value)} className={selectStyle}>
                        {allCountries.map(c => <option key={c} value={c} className="bg-purple-900 text-white">{c}</option>)}
                    </select>
                    <div className="mt-3"></div>
                    <select value={filters.city} onChange={e => onFilterChange('city', e.target.value)} className={selectStyle} disabled={filters.country === 'Todos'}>
                        {allCities.map(c => <option key={c} value={c} className="bg-purple-900 text-white">{c}</option>)}
                    </select>
                </FilterGroup>
                <FilterGroup title="Rango de Precios (COP)">
                    <div className='flex items-center gap-2'>
                        <input type="number" placeholder="Min (M)" value={filters.priceRange.min} onChange={e => onFilterChange('priceRange', {...filters.priceRange, min: e.target.value})} className={`${selectStyle} text-sm`} />
                        <span className='text-white/50 font-bold'>-</span>
                        <input type="number" placeholder="Max (M)" value={filters.priceRange.max} onChange={e => onFilterChange('priceRange', {...filters.priceRange, max: e.target.value})} className={`${selectStyle} text-sm`} />
                    </div>
                </FilterGroup>
                 <FilterGroup title="Tipo de Plan (Régimen)">
                     <select value={filters.regime} onChange={e => onFilterChange('regime', e.target.value)} className={selectStyle}>
                         {allRegimes.map(r => <option key={r} value={r} className="bg-purple-900 text-white">{r}</option>)}
                     </select>
                 </FilterGroup>
                <FilterGroup title="Ideal para...">
                    {allTravelerTypes.map(type => {
                        const label = type === 'Parejas' ? 'Parejas (Lunamieleros)' : type;
                        return <Checkbox key={type} label={label} value={type} checked={filters.travelerTypes.includes(type as TravelerType)} onChange={(v) => handleCheckboxChange('travelerTypes', v)}/>
                    })}
                </FilterGroup>
                {Object.entries(ALL_AMENITIES).map(([group, amenities]) => (
                    <FilterGroup key={group} title={group}>
                        {amenities.map(amenity => <Checkbox key={amenity} label={amenity} value={amenity} checked={filters.amenities.includes(amenity)} onChange={(v) => handleCheckboxChange('amenities', v)} />)}
                    </FilterGroup>
                ))}
            </div>
        </div>
    );
};

const PlansPage: React.FC<PlansPageProps> = ({ globalSearch, setGlobalSearch, setQrModalPlan, setDetailModalPlan, setQuoteRequestPlan, plans, logoUrl }) => {
  // Mobile defaults to 'list' (1 column), but 'grid' will mean 2 columns on mobile now
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (globalSearch) {
      setFilters(prev => ({...prev, searchTerm: globalSearch}));
      setGlobalSearch(''); // Reset global search after applying it
    }
  }, [globalSearch, setGlobalSearch]);

  // Scroll detection to hide/show toolbar
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 10) {
            setIsToolbarVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            // Scrolling down & past threshold
            setIsToolbarVisible(false);
        } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up
            setIsToolbarVisible(true);
        }
        
        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const allCountries = useMemo(() => ['Todos', ...Array.from(new Set(plans.map(p => p.country)))], [plans]);
  const allCities = useMemo(() => {
    const relevantPlans = filters.country === 'Todos' ? plans : plans.filter(p => p.country === filters.country);
    return ['Todos', ...Array.from(new Set(relevantPlans.map(p => p.city)))];
  }, [plans, filters.country]);
  const allRegimes = useMemo(() => ['Todos', ...Array.from(new Set(plans.map(p => p.regime)))], [plans]);
  const allTravelerTypes = useMemo(() => Array.from(new Set(plans.flatMap(p => p.travelerTypes))), [plans]);

  useEffect(() => {
    if (!allCities.includes(filters.city)) {
        handleFilterChange('city', 'Todos');
    }
  }, [allCities, filters.city]);


  const filteredAndSortedPlans = useMemo(() => {
    let filteredPlans = plans.filter(plan => {
      if (!plan.isVisible) return false;
        
      const { searchTerm, country, city, regime, travelerTypes, amenities, priceRange } = filters;

      const matchesSearch = searchTerm === '' || plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = country === 'Todos' || plan.country === country;
      const matchesCity = city === 'Todos' || plan.city === city;
      const matchesRegime = regime === 'Todos' || plan.regime === regime;

      const minPrice = priceRange.min === '' ? 0 : parseFloat(priceRange.min) * 1000000;
      const maxPrice = priceRange.max === '' ? Infinity : parseFloat(priceRange.max) * 1000000;
      const matchesPrice = plan.priceValue >= minPrice && plan.priceValue <= maxPrice;

      const matchesTravelerTypes = travelerTypes.length === 0 || travelerTypes.every(type => plan.travelerTypes.includes(type as TravelerType));
      const matchesAmenities = amenities.length === 0 || amenities.every(amenity => plan.amenities.includes(amenity));

      return matchesSearch && matchesCountry && matchesCity && matchesRegime && matchesPrice && matchesTravelerTypes && matchesAmenities;
    });

    switch (sortBy) {
        case 'price_asc': filteredPlans.sort((a, b) => a.priceValue - b.priceValue); break;
        case 'price_desc': filteredPlans.sort((a, b) => b.priceValue - a.priceValue); break;
        case 'name_az': filteredPlans.sort((a, b) => a.title.localeCompare(b.title)); break;
        default: break;
    }

    return filteredPlans;
  }, [filters, sortBy, plans]);

  const selectStyle = "w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none appearance-none";

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg">Nuestros Planes y Servicios</h1>
        <p className="text-center text-white/80 mb-8 max-w-3xl mx-auto">
          Descubre la variedad de experiencias que hemos diseñado para ti. Filtra por categoría o busca tu destino soñado.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar - Mobile (Drawer with Satin Glassmorphism) */}
        <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ${isFilterOpen ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none opacity-0'}`} onClick={() => setIsFilterOpen(false)}>
            <aside 
                className={`absolute top-0 right-0 h-[100dvh] w-full transition-transform duration-500 transform shadow-2xl ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`} 
                onClick={e => e.stopPropagation()}
            >
                <FiltersSidebar 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                    onClear={() => setFilters(initialFilters)}
                    allCountries={allCountries}
                    allCities={allCities}
                    allRegimes={allRegimes}
                    allTravelerTypes={allTravelerTypes}
                    onClose={() => setIsFilterOpen(false)}
                    className="h-full rounded-none border-l border-white/30 bg-gradient-to-b from-purple-900/70 to-purple-950/80 backdrop-blur-[40px] backdrop-saturate-150 shadow-[inset_1px_0_0_rgba(255,255,255,0.3),inset_0_0_40px_rgba(255,255,255,0.1)]"
                />
            </aside>
        </div>

        {/* Filter Sidebar - Desktop */}
        <aside className="hidden md:block w-1/4 lg:w-1/5">
            <FiltersSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onClear={() => setFilters(initialFilters)}
                allCountries={allCountries}
                allCities={allCities}
                allRegimes={allRegimes}
                allTravelerTypes={allTravelerTypes}
            />
        </aside>

        <main className="flex-1">
            <div className={`sticky top-4 md:top-20 z-30 transition-transform duration-300 ${isToolbarVisible ? 'translate-y-0' : '-translate-y-40'}`}>
                <GlassCard className="p-4 mb-6 bg-black/20 backdrop-blur-xl border border-white/10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex justify-between items-center w-full sm:w-auto">
                            <p className="text-white/80 text-sm font-medium">{filteredAndSortedPlans.length} planes encontrados</p>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Mobile Trigger Button inside Toolbar */}
                            <button 
                                onClick={() => setIsFilterOpen(true)} 
                                className="md:hidden flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" /></svg>
                                <span className="font-bold text-sm">Filtros</span>
                            </button>

                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${selectStyle} flex-[2] sm:w-auto appearance-none text-sm`}>
                                <option value="default" className="bg-purple-800">Ordenar por</option>
                                <option value="price_asc" className="bg-purple-800">Precio: Menor a Mayor</option>
                                <option value="price_desc" className="bg-purple-800">Precio: Mayor a Menor</option>
                                <option value="name_az" className="bg-purple-800">Nombre: A-Z</option>
                            </select>
                            
                            {/* View Toggle Buttons - Visible on Mobile now */}
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setViewMode('grid')} 
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-pink-500/50 text-white' : 'bg-white/10 text-white/70'}`}
                                    title="Ver en Cuadrícula (2 columnas)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')} 
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-pink-500/50 text-white' : 'bg-white/10 text-white/70'}`}
                                    title="Ver en Lista (1 columna)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {filteredAndSortedPlans.length > 0 ? (
              // Logic Update: 'grid' means 2 cols on mobile/tablet, 3 on desktop. 'list' means 1 col always.
              // We removed the conditional block rendering entirely different structures to unify and simplify logic for mobile.
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredAndSortedPlans.map(plan => (
                        <GlassCard 
                            key={plan.id} 
                            className={`flex ${viewMode === 'list' ? 'flex-col md:flex-row items-center' : 'flex-col'} hover:scale-105 transition-transform duration-300 relative overflow-hidden group`}
                        >
                            <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                            
                            <div onClick={() => setDetailModalPlan(plan)} className={`cursor-pointer ${viewMode === 'list' ? 'w-full md:w-1/3' : 'w-full'}`}>
                                {plan.images && plan.images.length > 0 ? (
                                    <WatermarkedImage 
                                        src={plan.images[0]} 
                                        alt={plan.title} 
                                        containerClassName={`${viewMode === 'list' ? 'h-56 md:h-full rounded-t-xl md:rounded-l-xl md:rounded-t-none' : 'h-32 sm:h-64 rounded-t-xl'}`} 
                                        logoUrl={logoUrl} 
                                    />
                                ) : (
                                    <div className={`${viewMode === 'list' ? 'h-56 md:h-full' : 'h-32 sm:h-64'} bg-black/10 flex items-center justify-center text-white/50`}>
                                        Imagen no disponible
                                    </div>
                                )}
                            </div>

                            <div className={`p-3 flex flex-col flex-grow ${viewMode === 'list' ? 'w-full md:w-2/3 md:p-6' : ''}`}>
                                <span className="text-[10px] sm:text-xs font-semibold text-pink-300 truncate block">{plan.city}, {plan.country}</span>
                                
                                <h3 className={`font-bold text-white mt-1 leading-tight line-clamp-2 ${viewMode === 'grid' ? 'text-xs sm:text-xl' : 'text-xl'}`}>
                                    {plan.title}
                                </h3>
                                
                                <p className={`text-pink-200 font-semibold mt-1 ${viewMode === 'grid' ? 'text-xs sm:text-base' : 'text-lg'}`}>
                                    {plan.price}
                                </p>
                                
                                {viewMode === 'list' && (
                                    <p className="mt-2 text-white/80 text-sm line-clamp-2 hidden sm:block">{plan.description}</p>
                                )}

                                <div className={`mt-2 sm:mt-4 flex gap-2 ${viewMode === 'list' ? 'sm:ml-auto' : 'flex-col sm:flex-row'}`}>
                                    <button 
                                        onClick={() => setDetailModalPlan(plan)} 
                                        className={`bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors ${viewMode === 'grid' ? 'py-1.5 text-[10px] sm:text-sm sm:py-2' : 'py-2 px-4'}`}
                                    >
                                        Ver Detalles
                                    </button>
                                    <button 
                                        onClick={() => setQuoteRequestPlan(plan)} 
                                        className={`bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-colors ${viewMode === 'grid' ? 'py-1.5 text-[10px] sm:text-sm sm:py-2' : 'py-2 px-4'}`}
                                    >
                                        Cotizar
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <GlassCard className="p-8 inline-block">
                  <h3 className="text-2xl text-white font-bold">No se encontraron planes</h3>
                  <p className="text-white/80 mt-2">Intenta ajustar tu búsqueda o filtros.</p>
                </GlassCard>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default PlansPage;
