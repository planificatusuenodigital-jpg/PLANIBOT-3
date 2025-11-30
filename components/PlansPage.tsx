
import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';
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
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareData = {
            title: plan.title,
            text: `¡Mira este plan! ${plan.title} en ${plan.city}`,
            url: `${window.location.origin}${window.location.pathname}?plan=${plan.id}`
        };
        if (navigator.share && navigator.canShare(shareData)) {
            try { await navigator.share(shareData); } catch (error) { console.error(error); }
        } else {
            navigator.clipboard.writeText(shareData.url).then(() => alert('Link copiado'));
        }
    };

    return (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 sm:gap-2 z-10">
            <button onClick={(e) => { e.stopPropagation(); setQrModalPlan(plan); }} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-pink-500 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5h3v3H5V5zm0 7h3v3H5v-3zM12 5h3v3h-3V5zm0 7h3v3h-3v-3z"/><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 1h10v10H4V4z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={handleShare} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-pink-500 transition-colors flex items-center justify-center">
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

const PlansPage: React.FC<PlansPageProps> = ({ globalSearch, setGlobalSearch, setQrModalPlan, setDetailModalPlan, setQuoteRequestPlan, plans, logoUrl }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (globalSearch) {
      setFilters(prev => ({...prev, searchTerm: globalSearch}));
      setGlobalSearch(''); 
    }
  }, [globalSearch, setGlobalSearch]);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (filterKey: 'travelerTypes' | 'amenities', value: string) => {
      const currentValues = filters[filterKey] as string[];
      const newValues = currentValues.includes(value) 
          ? currentValues.filter(v => v !== value) 
          : [...currentValues, value];
      handleFilterChange(filterKey, newValues);
  }

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

  const FilterGroup: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="py-3 border-b border-white/20">
      <h3 className="font-bold text-white mb-2 text-sm md:text-lg">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  const Checkbox: React.FC<{label: string, value: string, checked: boolean, onChange: (value: string) => void}> = ({ label, value, checked, onChange }) => (
    <label className="flex items-center gap-2 text-xs md:text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
      <input type="checkbox" checked={checked} onChange={() => onChange(value)} className="w-3 h-3 md:w-4 md:h-4 rounded bg-white/20 border-white/30 text-pink-500 focus:ring-pink-400" />
      {label}
    </label>
  );

  const selectStyle = "w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none appearance-none";

  const renderFilters = () => (
    <GlassCard className="p-3 md:p-4 h-full flex flex-col">
        <div className='flex justify-between items-center mb-2'>
            <h2 className="text-xl md:text-2xl font-bold text-white">Filtros</h2>
            <button onClick={() => setFilters(initialFilters)} className="text-xs text-pink-200 hover:text-white">Limpiar</button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            <FilterGroup title="Buscar">
                <input type="text" placeholder="Busca tu aventura..." value={filters.searchTerm} onChange={e => handleFilterChange('searchTerm', e.target.value)} className={selectStyle}/>
            </FilterGroup>
            <FilterGroup title="Ubicación">
                <select value={filters.country} onChange={e => handleFilterChange('country', e.target.value)} className={`${selectStyle} mb-2`}>
                    {allCountries.map(c => <option key={c} value={c} className="bg-purple-800">{c}</option>)}
                </select>
                <select value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className={selectStyle} disabled={filters.country === 'Todos'}>
                    {allCities.map(c => <option key={c} value={c} className="bg-purple-800">{c}</option>)}
                </select>
            </FilterGroup>
            <FilterGroup title="Rango de Precios (M)">
                <div className='flex items-center gap-1 md:gap-2'>
                    <input type="number" placeholder="Min" value={filters.priceRange.min} onChange={e => handleFilterChange('priceRange', {...filters.priceRange, min: e.target.value})} className={`${selectStyle}`} />
                    <span className='text-white/50'>-</span>
                    <input type="number" placeholder="Max" value={filters.priceRange.max} onChange={e => handleFilterChange('priceRange', {...filters.priceRange, max: e.target.value})} className={`${selectStyle}`} />
                </div>
            </FilterGroup>
             <FilterGroup title="Tipo de Plan">
                 <select value={filters.regime} onChange={e => handleFilterChange('regime', e.target.value)} className={selectStyle}>
                     {allRegimes.map(r => <option key={r} value={r} className="bg-purple-800">{r}</option>)}
                 </select>
             </FilterGroup>
            <FilterGroup title="Ideal para...">
                {allTravelerTypes.map(type => {
                    const label = type === 'Parejas' ? 'Parejas (Lunamieleros)' : type;
                    return <Checkbox key={type} label={label} value={type} checked={filters.travelerTypes.includes(type)} onChange={(v) => handleCheckboxChange('travelerTypes', v)}/>
                })}
            </FilterGroup>
            {Object.entries(ALL_AMENITIES).map(([group, amenities]) => (
                <FilterGroup key={group} title={group}>
                    {amenities.map(amenity => <Checkbox key={amenity} label={amenity} value={amenity} checked={filters.amenities.includes(amenity)} onChange={(v) => handleCheckboxChange('amenities', v)} />)}
                </FilterGroup>
            ))}
        </div>
    </GlassCard>
  );

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-4 drop-shadow-lg">Nuestros Planes</h1>
        <p className="text-center text-white/80 mb-4 md:mb-8 max-w-3xl mx-auto text-sm md:text-base">
          Descubre la variedad de experiencias que hemos diseñado para ti.
        </p>
      </div>

      <div className="flex gap-4 md:gap-8 relative">
        {/* Mobile Filter Button */}
        <div className="md:hidden fixed bottom-5 left-5 z-40">
            <button onClick={() => setIsFilterOpen(true)} className="bg-pink-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2 text-sm font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" /></svg>
                Filtros
            </button>
        </div>
        
        {/* Filter Sidebar - Mobile (Drawer) */}
        <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isFilterOpen ? 'bg-black/60 pointer-events-auto' : 'bg-transparent pointer-events-none opacity-0'}`} onClick={() => setIsFilterOpen(false)}>
            <aside className={`absolute top-0 left-0 h-full w-4/5 max-w-xs p-4 bg-purple-900/95 backdrop-blur-lg transition-transform duration-300 transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                {renderFilters()}
            </aside>
        </div>

        {/* Filter Sidebar - Desktop */}
        <aside className="hidden md:block w-1/4 lg:w-1/5 sticky top-24 h-[calc(100vh-8rem)]">
            {renderFilters()}
        </aside>

        <main className="flex-1 min-w-0">
            <GlassCard className="p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-white/80 text-xs md:text-sm">{filteredAndSortedPlans.length} planes</p>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${selectStyle} flex-grow sm:flex-grow-0`}>
                            <option value="default" className="bg-purple-800">Ordenar por</option>
                            <option value="price_asc" className="bg-purple-800">Precio: Menor</option>
                            <option value="price_desc" className="bg-purple-800">Precio: Mayor</option>
                            <option value="name_az" className="bg-purple-800">Nombre: A-Z</option>
                        </select>
                        <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                             <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-pink-500' : 'text-white/60 hover:text-white'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-pink-500' : 'text-white/60 hover:text-white'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {filteredAndSortedPlans.length > 0 ? (
              viewMode === 'grid' ? (
                // Force 2 columns on small screens, 3 on large
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {filteredAndSortedPlans.map(plan => (
                        <GlassCard key={plan.id} className="flex flex-col hover:scale-[1.02] transition-transform duration-300 relative group overflow-hidden">
                            <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                            <div onClick={() => setDetailModalPlan(plan)} className="cursor-pointer h-32 sm:h-48 md:h-56 w-full relative">
                                {plan.images && plan.images.length > 0 ? (
                                    <WatermarkedImage src={plan.images[0]} alt={plan.title} containerClassName="h-full w-full" imageClassName="rounded-t-xl md:rounded-t-2xl" logoUrl={logoUrl} />
                                ) : (
                                    <div className="h-full w-full bg-black/20 flex items-center justify-center text-white/50 text-xs">
                                        Sin Imagen
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 md:opacity-60"></div>
                                <span className="absolute bottom-2 left-2 text-[10px] md:text-xs font-bold text-white bg-pink-600/80 px-2 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[90%]">{plan.city}</span>
                            </div>
                            <div className="p-2 md:p-4 flex flex-col flex-grow bg-black/20">
                                <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white leading-tight line-clamp-2 min-h-[2.5em]">{plan.title}</h3>
                                <p className="text-pink-300 font-bold text-xs sm:text-sm md:text-base mt-1">{plan.price}</p>
                                {/* Hide description on mobile to save space and maintain 2 columns */}
                                <p className="hidden md:block mt-2 text-white/70 text-xs line-clamp-2">{plan.description}</p>
                                <div className="mt-auto pt-2 flex flex-col gap-2">
                                    <button onClick={() => setDetailModalPlan(plan)} className="w-full bg-white/10 text-white text-[10px] sm:text-xs md:text-sm py-1.5 md:py-2 rounded hover:bg-white/20 transition-colors">Ver +</button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                    {filteredAndSortedPlans.map(plan => (
                        <GlassCard key={plan.id} className="relative overflow-hidden transition-all duration-300 flex flex-row h-24 md:h-48">
                            <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                            <div className="w-1/3 md:w-1/3 cursor-pointer relative" onClick={() => setDetailModalPlan(plan)}>
                                {plan.images && plan.images.length > 0 ? (
                                    <WatermarkedImage src={plan.images[0]} alt={plan.title} containerClassName="h-full w-full" logoUrl={logoUrl} />
                                ) : (
                                    <div className="h-full w-full bg-black/10 flex items-center justify-center text-white/50 text-xs">
                                        N/A
                                    </div>
                                )}
                            </div>
                            <div className="w-2/3 md:w-2/3 p-2 md:p-6 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <div className='pr-6'>
                                        <h3 className="text-sm md:text-xl font-bold text-white leading-tight line-clamp-1 md:line-clamp-2">{plan.title}</h3>
                                        <p className="text-[10px] md:text-sm text-pink-300 font-semibold">{plan.city}</p>
                                    </div>
                                    <p className="hidden md:block text-pink-200 font-bold text-lg">{plan.price}</p>
                                </div>
                                <p className="hidden md:block mt-2 text-white/80 text-sm line-clamp-2">{plan.description}</p>
                                <div className="mt-auto flex justify-between items-end">
                                    <p className="md:hidden text-pink-200 font-bold text-xs">{plan.price}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setDetailModalPlan(plan)} className="bg-white/20 text-white text-[10px] md:text-sm py-1 px-3 rounded hover:bg-white/30 transition-colors">Ver</button>
                                        <button onClick={() => setQuoteRequestPlan(plan)} className="bg-pink-500 text-white text-[10px] md:text-sm py-1 px-3 rounded hover:bg-pink-600 transition-colors font-bold">Cotizar</button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
              )
            ) : (
              <div className="text-center py-10 md:py-16">
                <GlassCard className="p-6 md:p-8 inline-block">
                  <h3 className="text-xl md:text-2xl text-white font-bold">No se encontraron planes</h3>
                  <p className="text-white/80 mt-2 text-sm">Intenta ajustar tu búsqueda o filtros.</p>
                </GlassCard>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default PlansPage;
