import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from './GlassCard';
import WatermarkedImage from './WatermarkedImage';
import { Plan } from '../types';

interface PlansPageProps {
    globalSearch: string;
    setGlobalSearch: (term: string) => void;
    setQrModalPlan: (plan: Plan) => void;
    setDetailModalPlan: (plan: Plan) => void;
    setQuoteRequestPlan: (plan: Plan) => void;
    plans: Plan[];
    logoUrl: string;
}

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

const PlansPage: React.FC<PlansPageProps> = ({ globalSearch, setGlobalSearch, setQrModalPlan, setDetailModalPlan, setQuoteRequestPlan, plans, logoUrl }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
      category: 'Todos',
      price: 'any',
      duration: 'any',
      departureDate: '',
      returnDate: '',
  });
  const [sortBy, setSortBy] =useState('default');
  
  useEffect(() => {
    if (globalSearch) {
      setSearchTerm(globalSearch);
      setGlobalSearch(''); // Reset global search after applying it
    }
  }, [globalSearch, setGlobalSearch]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'searchTerm') {
          setSearchTerm(value);
      } else {
          setFilters(prev => ({ ...prev, [name]: value }));
      }
  };

  const categories = useMemo(() => ['Todos', ...new Set(plans.map(p => p.category))], [plans]);

  const filteredAndSortedPlans = useMemo(() => {
    let filteredPlans = plans.filter(plan => {
      if (!plan.isVisible) return false;
        
      const { category, price, duration } = filters;

      const matchesCategory = category === 'Todos' || plan.category === category;
      
      const matchesPrice = price === 'any' ||
        (price === 'lt1m' && plan.priceValue < 1000000) ||
        (price === '1m-2m' && plan.priceValue >= 1000000 && plan.priceValue <= 2000000) ||
        (price === 'gt2m' && plan.priceValue > 2000000);

      const matchesDuration = duration === 'any' ||
        (duration === '1-3' && plan.durationDays >= 1 && plan.durationDays <= 3) ||
        (duration === '4-6' && plan.durationDays >= 4 && plan.durationDays <= 6) ||
        (duration === '7+' && plan.durationDays >= 7);
      
      // Note: Date filtering is for UI demonstration; logic would need to be more complex for real-world use cases.
      const matchesDeparture = !filters.departureDate || new Date(plan.departureDate) >= new Date(filters.departureDate);
      const matchesReturn = !filters.returnDate || new Date(plan.returnDate) <= new Date(filters.returnDate);

      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            plan.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch && matchesPrice && matchesDuration && matchesDeparture && matchesReturn;
    });

    switch (sortBy) {
        case 'price_asc':
            filteredPlans.sort((a, b) => a.priceValue - b.priceValue);
            break;
        case 'price_desc':
            filteredPlans.sort((a, b) => b.priceValue - a.priceValue);
            break;
        case 'name_az':
            filteredPlans.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            break;
    }

    return filteredPlans;
  }, [searchTerm, filters, sortBy, plans]);

  const inputStyle = "w-full bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none";

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-5xl font-black text-center text-white mb-4 drop-shadow-lg">Nuestros Planes y Servicios</h1>
      <p className="text-center text-white/80 mb-8 max-w-3xl mx-auto">
        Descubre la variedad de experiencias que hemos diseñado para ti. Filtra por categoría o busca tu destino soñado.
      </p>

      {/* Filters */}
      <GlassCard className="p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            <input
                type="text"
                name="searchTerm"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={handleFilterChange}
                className={`${inputStyle} lg:col-span-3`}
            />
            <select name="category" value={filters.category} onChange={handleFilterChange} className={`${inputStyle} appearance-none`}>
                {categories.map(cat => <option key={cat} value={cat} className="bg-purple-800">{cat}</option>)}
            </select>
            <select name="price" value={filters.price} onChange={handleFilterChange} className={`${inputStyle} appearance-none`}>
                <option value="any" className="bg-purple-800">Cualquier Precio</option>
                <option value="lt1m" className="bg-purple-800">&lt; $1,000,000</option>
                <option value="1m-2m" className="bg-purple-800">$1,000,000 - $2,000,000</option>
                <option value="gt2m" className="bg-purple-800">&gt; $2,000,000</option>
            </select>
             <select name="duration" value={filters.duration} onChange={handleFilterChange} className={`${inputStyle} appearance-none`}>
                <option value="any" className="bg-purple-800">Cualquier Duración</option>
                <option value="1-3" className="bg-purple-800">1-3 Días</option>
                <option value="4-6" className="bg-purple-800">4-6 Días</option>
                <option value="7+" className="bg-purple-800">7+ Días</option>
            </select>
            <div className='relative'>
                 <label className="absolute top-[-10px] left-3 text-xs text-white/70 bg-black/10 px-1 rounded-full">Salida desde:</label>
                <input type="date" name="departureDate" value={filters.departureDate} onChange={handleFilterChange} className={`${inputStyle} pt-5`} />
            </div>
            <div className='relative'>
                 <label className="absolute top-[-10px] left-3 text-xs text-white/70 bg-black/10 px-1 rounded-full">Regreso hasta:</label>
                <input type="date" name="returnDate" value={filters.returnDate} onChange={handleFilterChange} className={`${inputStyle} pt-5`} />
            </div>

        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-white/20">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputStyle} sm:w-auto mb-2 sm:mb-0 appearance-none`}>
                <option value="default" className="bg-purple-800">Ordenar por defecto</option>
                <option value="price_asc" className="bg-purple-800">Precio: Menor a Mayor</option>
                <option value="price_desc" className="bg-purple-800">Precio: Mayor a Menor</option>
                <option value="name_az" className="bg-purple-800">Nombre: A-Z</option>
            </select>
            <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-500/50' : 'bg-white/20'} text-white`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-500/50' : 'bg-white/20'} text-white`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </button>
            </div>
        </div>
      </GlassCard>

      {/* Plans Grid/List */}
      {filteredAndSortedPlans.length > 0 ? (
        viewMode === 'grid' ? (
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedPlans.map(plan => (
                    <GlassCard key={plan.id} className="flex flex-col hover:scale-105 transition-transform duration-300 relative">
                        <PlanActions plan={plan} setQrModalPlan={setQrModalPlan} />
                        <div onClick={() => setDetailModalPlan(plan)} className="cursor-pointer">
                            <WatermarkedImage src={plan.images[0]} alt={plan.title} containerClassName="h-64 rounded-t-xl" logoUrl={logoUrl} />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <span className="text-xs font-semibold text-pink-300">{plan.category}</span>
                            <h3 className="text-xl font-bold text-white mt-1">{plan.title}</h3>
                            <p className="text-pink-200 font-semibold mt-1">{plan.price}</p>
                            <p className="mt-2 text-white/80 text-sm flex-grow">{plan.description}</p>
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
                            <WatermarkedImage src={plan.images[0]} alt={plan.title} containerClassName="h-56 md:h-full rounded-t-xl md:rounded-l-xl md:rounded-t-none" logoUrl={logoUrl} />
                        </div>
                        <div className="p-4 md:p-6 md:w-2/3">
                             <span className="text-xs font-semibold text-pink-300">{plan.category}</span>
                            <h3 className="text-xl font-bold text-white mt-1">{plan.title}</h3>
                            <p className="text-pink-200 font-semibold mt-1">{plan.price}</p>
                            <p className="mt-2 text-white/80 text-sm">{plan.description}</p>
                            <div className="mt-3 border-t border-white/20 pt-3 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                <div>
                                    <h4 className="font-semibold text-white text-sm">Incluye:</h4>
                                    <ul className="text-xs text-white/70 list-disc list-inside mt-1 space-y-1">
                                        {plan.includes.slice(0, 2).map(item => <li key={item}>{item}</li>)}
                                        {plan.includes.length > 2 && <li>y más...</li>}
                                    </ul>
                                </div>
                                 <div className="mt-4 sm:mt-0 sm:ml-auto flex gap-2">
                                    <button onClick={() => setDetailModalPlan(plan)} className="bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-colors">Ver Detalles</button>
                                    <button onClick={() => setQuoteRequestPlan(plan)} className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">Cotizar</button>
                                </div>
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
        )
      }
    </div>
  );
};

export default PlansPage;