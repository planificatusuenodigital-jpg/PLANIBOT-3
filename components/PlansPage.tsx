
import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';
import { Plan, Tag, Destination } from '../types';

interface PlansPageProps {
    globalSearch: string;
    setGlobalSearch: (term: string) => void;
    setQrModalPlan: (plan: Plan) => void;
    setDetailModalPlan: (plan: Plan) => void;
    setQuoteRequestPlan: (plan: Plan) => void;
    plans: Plan[];
    destinations: Destination[];
    tags: Tag[];
    logoUrl: string;
}

const ALL_AMENITIES_CATEGORIES = ['Comodidades Principales', 'Bienestar y Relax', 'Para Familias', 'Actividades', 'Por Habitación'];

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
        <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button onClick={() => setQrModalPlan(plan)} className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center" title="Generar Código QR">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5h3v3H5V5zm0 7h3v3H5v-3zM12 5h3v3h-3V5zm0 7h3v3h-3v-3z"/><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 1h10v10H4V4z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={handleShare} className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center" title="Compartir Plan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            </button>
        </div>
    );
};

const initialFilters = {
    searchTerm: '',
    country: 'Todos',
    city: 'Todos',
    planType: 'Todos',
    travelerTypes: [] as string[],
    amenities: [] as string[],
    priceRange: { min: '', max: '' },
    duration: 'any',
};

const PlansPage: React.FC<PlansPageProps> = ({ globalSearch, setGlobalSearch, setQrModalPlan, setDetailModalPlan, setQuoteRequestPlan, plans, destinations, tags, logoUrl }) => {
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

  const allCountries = useMemo(() => ['Todos', ...Array.from(new Set(destinations.map(d => d.country)))], [destinations]);
  const allCities = useMemo(() => {
    const relevantDestinations = filters.country === 'Todos' ? destinations : destinations.filter(d => d.country === filters.country);
    return ['Todos', ...Array.from(new Set(relevantDestinations.map(d => d.name)))];
  }, [destinations, filters.country]);
  const allPlanTypes = useMemo(() => ['Todos', ...Array.from(new Set(plans.map(p => p.plan_type)))], [plans]);
  const allTravelerTypes = useMemo(() => tags.filter(t => t.category === 'TravelerType').map(t => t.name), [tags]);
  const allAmenities = useMemo(() => tags.filter(t => ALL_AMENITIES_CATEGORIES.includes(t.category)), [tags]);


  useEffect(() => {
    if (!allCities.includes(filters.city)) {
        handleFilterChange('city', 'Todos');
    }
  }, [allCities, filters.city]);


  const filteredAndSortedPlans = useMemo(() => {
    let filteredPlans = plans.filter(plan => {
      if (!plan.is_visible || !plan.destination) return false;
        
      const { searchTerm, country, city, planType, travelerTypes, amenities, priceRange, duration } = filters;

      const matchesSearch = searchTerm === '' || plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = country === 'Todos' || plan.destination.country === country;
      const matchesCity = city === 'Todos' || plan.destination.name === city;
      const matchesPlanType = planType === 'Todos' || plan.plan_type === planType;

      const minPrice = priceRange.min === '' ? 0 : parseFloat(priceRange.min) * 1000000;
      const maxPrice = priceRange.max === '' ? Infinity : parseFloat(priceRange.max) * 1000000;
      const matchesPrice = plan.price_value >= minPrice && plan.price_value <= maxPrice;
      
      const matchesDuration = (() => {
        if (duration === 'any') return true;
        if (duration === 'short') return plan.duration_days >= 2 && plan.duration_days <= 3;
        if (duration === 'medium') return plan.duration_days >= 4 && plan.duration_days <= 5;
        if (duration === 'long') return plan.duration_days >= 6;
        return true;
      })();

      const planTagNames = plan.tags.map(t => t.name);
      const matchesTravelerTypes = travelerTypes.length === 0 || travelerTypes.every(type => planTagNames.includes(type));
      const matchesAmenities = amenities.length === 0 || amenities.every(amenity => planTagNames.includes(amenity));

      return matchesSearch && matchesCountry && matchesCity && matchesPlanType && matchesPrice && matchesDuration && matchesTravelerTypes && matchesAmenities;
    });

    switch (sortBy) {
        case 'price_asc': filteredPlans.sort((a, b) => a.price_value - b.price_value); break;
        case 'price_desc': filteredPlans.sort((a, b) => b.price_value - a.price_value); break;
        case 'name_az': filteredPlans.sort((a, b) => a.title.localeCompare(b.title)); break;
        default: break;
    }

    return filteredPlans;
  }, [filters, sortBy, plans]);

  const FilterGroup: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="py-3 border-b border-white/20">
      <h3 className="font-bold text-white mb-3 text-lg">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const Checkbox: React.FC<{label: string, value: string, checked: boolean, onChange: (value: string) => void}> = ({ label, value, checked, onChange }) => (
    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
      <input type="checkbox" checked={checked} onChange={() => onChange(value)} className="w-4 h-4 rounded bg-white/20 border-white/30 text-pink-500 focus:ring-pink-400" />
      {label}
    </label>
  );

  const Radio: React.FC<{label: string, value: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, value, name, checked, onChange }) => (
    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="w-4 h-4 bg-white/20 border-white/30 text-pink-500 focus:ring-pink-400 focus:ring-offset-0" />
      {label}
    </label>
  );

  const selectStyle = "w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none appearance-none";

  const renderFilters = () => (
    <GlassCard className="p-4 h-full flex flex-col">
        <div className='flex justify-between items-center mb-2'>
            <h2 className="text-2xl font-bold text-white">Filtros</h2>
            <button onClick={() => setFilters(initialFilters)} className="text-xs text-pink-200 hover:text-white">Limpiar</button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            <FilterGroup title="Buscar">
                <input type="text" placeholder="Busca tu aventura..." value={filters.searchTerm} onChange={e => handleFilterChange('searchTerm', e.target.value)} className={selectStyle}/>
            </FilterGroup>
            <FilterGroup title="Ubicación">
                <select value={filters.country} onChange={e => handleFilterChange('country', e.target.value)} className={selectStyle}>
                    {allCountries.map(c => <option key={c} value={c} className="bg-purple-800">{c}</option>)}
                </select>
                <select value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className={selectStyle} disabled={filters.country === 'Todos'}>
                    {allCities.map(c => <option key={c} value={c} className="bg-purple-800">{c}</option>)}
                </select>
            </FilterGroup>
            <FilterGroup title="Rango de Precios (COP)">
                <div className='flex items-center gap-2'>
                    <input type="number" placeholder="Min (Millones)" value={filters.priceRange.min} onChange={e => handleFilterChange('priceRange', {...filters.priceRange, min: e.target.value})} className={`${selectStyle} text-sm`} />
                    <span className='text-white/50'>-</span>
                    <input type="number" placeholder="Max (Millones)" value={filters.priceRange.max} onChange={e => handleFilterChange('priceRange', {...filters.priceRange, max: e.target.value})} className={`${selectStyle} text-sm`} />
                </div>
            </FilterGroup>
             <FilterGroup title="Duración del Viaje">
                <Radio label="Todos" value="any" name="duration" checked={filters.duration === 'any'} onChange={e => handleFilterChange('duration', e.target.value)} />
                <Radio label="2-3 días (Corto)" value="short" name="duration" checked={filters.duration === 'short'} onChange={e => handleFilterChange('duration', e.target.value)} />
                <Radio label="4-5 días (Medio)" value="medium" name="duration" checked={filters.duration === 'medium'} onChange={e => handleFilterChange('duration', e.target.value)} />
                <Radio label="6+ días (Largo)" value="long" name="duration" checked={filters.duration === 'long'} onChange={e => handleFilterChange('duration', e.target.value)} />
            </FilterGroup>
             <FilterGroup title="Tipo de Plan">
                 <select value={filters.planType} onChange={e => handleFilterChange('planType', e.target.value)} className={selectStyle}>
                     {allPlanTypes.map(r => <option key={r} value={r} className="bg-purple-800">{r}</option>)}
                 </select>
             </FilterGroup>
            <FilterGroup title="Ideal para...">
                {allTravelerTypes.map(type => <Checkbox key={type} label={type} value={type} checked={filters.travelerTypes.includes(type)} onChange={(v) => handleCheckboxChange('travelerTypes', v)}/> )}
            </FilterGroup>
            {ALL_AMENITIES_CATEGORIES.map(category => {
                const amenitiesInCategory = allAmenities.filter(a => a.category === category);
                if (amenitiesInCategory.length === 0) return null;
                return (
                    <FilterGroup key={category} title={category}>
                        {amenitiesInCategory.map(amenity => <Checkbox key={amenity.id} label={amenity.name} value={amenity.name} checked={filters.amenities.includes(amenity.name)} onChange={(v) => handleCheckboxChange('amenities', v)} />)}
                    </FilterGroup>
                );
            })}
        </div>
    </GlassCard>
  );

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg">Nuestros Planes y Servicios</h1>
        <p className="text-center text-white/80 mb-8 max-w-3xl mx-auto">
          Descubre la variedad de experiencias que hemos diseñado para ti. Filtra por categoría o busca tu destino soñado.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden fixed bottom-5 left-5 z-40">
            <button onClick={() => setIsFilterOpen(true)} className="bg-pink-500 text-white rounded-full p-4 shadow-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" /></svg>
                Filtros
            </button>
        </div>
        
        {/* Filter Sidebar - Mobile (Drawer) */}
        <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isFilterOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsFilterOpen(false)}>
            <aside className={`absolute top-0 left-0 h-full w-4/5 max-w-sm p-4 bg-purple-900/80 backdrop-blur-lg transition-transform duration-300 transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                {renderFilters()}
            </aside>
        </div>

        {/* Filter Sidebar - Desktop */}
        <aside className="hidden md:block w-1/4 lg:w-1/5">
            {renderFilters()}
        </aside>

        <main className="flex-1">
            <GlassCard className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-white/80 text-sm mb-2 sm:mb-0">{filteredAndSortedPlans.length} planes encontrados</p>
                    <div className="flex items-center gap-4">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${selectStyle} sm:w-auto appearance-none text-sm`}>
                            <option value="default" className="bg-purple-800">Ordenar por</option>
                            <option value="price_asc" className="bg-purple-800">Precio: Menor a Mayor</option>
                            <option value="price_desc" className="bg-purple-800">Precio: Mayor a Menor</option>
                            <option value="name_az" className="bg-purple-800">Nombre: A-Z</option>
                        </select>
                        <div className="hidden sm:flex items-center gap-2">
                             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-500/50' : 'bg-white/20'} text-white`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-500/50' : 'bg-white/20'} text-white`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {filteredAndSortedPlans.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSortedPlans.map(plan => (
                        <GlassCard key={plan.id} className="flex flex-col hover:scale-105 transition-transform duration-300 relative">
                            <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                            <div onClick={() => setDetailModalPlan(plan)} className="cursor-pointer">
                                {plan.images && plan.images.length > 0 ? (
                                    <WatermarkedImage src={plan.images[0]} alt={plan.title} containerClassName="h-64 rounded-t-xl" logoUrl={logoUrl} />
                                ) : (
                                    <div className="h-64 rounded-t-xl bg-gray-700/50 flex items-center justify-center text-white/50">
                                        Imagen no disponible
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <span className="text-xs font-semibold text-pink-300">{plan.destination.name}, {plan.destination.country}</span>
                                <h3 className="text-xl font-bold text-white mt-1">{plan.title}</h3>
                                <p className="text-pink-200 font-semibold mt-1">{plan.price_text}</p>
                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => setDetailModalPlan(plan)} className="w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-colors">Ver Detalles</button>
                                    <button onClick={() => setQuoteRequestPlan(plan)} className="w-full bg-pink-500 text-white font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors">Cotizar</button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                    {filteredAndSortedPlans.map(plan => (
                        <GlassCard key={plan.id} className="relative overflow-hidden transition-all duration-300 md:flex items-center">
                            <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                            <div className="md:w-1/3 cursor-pointer" onClick={() => setDetailModalPlan(plan)}>
                                {plan.images && plan.images.length > 0 ? (
                                    <WatermarkedImage src={plan.images[0]} alt={plan.title} containerClassName="h-56 md:h-full rounded-t-xl md:rounded-l-xl md:rounded-t-none" logoUrl={logoUrl} />
                                ) : (
                                    <div className="h-56 md:h-full rounded-t-xl md:rounded-l-xl md:rounded-t-none bg-gray-700/50 flex items-center justify-center text-white/50">
                                        Imagen no disponible
                                    </div>
                                )}
                            </div>
                            <div className="p-4 md:p-6 md:w-2/3">
                                <span className="text-xs font-semibold text-pink-300">{plan.destination.name}, {plan.destination.country}</span>
                                <h3 className="text-xl font-bold text-white mt-1">{plan.title}</h3>
                                <p className="text-pink-200 font-semibold mt-1">{plan.price_text}</p>
                                <p className="mt-2 text-white/80 text-sm line-clamp-2">{plan.description}</p>
                                <div className="mt-4 sm:ml-auto flex gap-2">
                                    <button onClick={() => setDetailModalPlan(plan)} className="bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-colors">Ver Detalles</button>
                                    <button onClick={() => setQuoteRequestPlan(plan)} className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">Cotizar</button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
              )
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
