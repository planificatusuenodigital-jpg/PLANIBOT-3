
import React, { useState, useMemo } from 'react';
import { TRAVEL_PLANS } from '../constants';
import GlassCard from './GlassCard';

const PlansPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = useMemo(() => ['Todos', ...new Set(TRAVEL_PLANS.map(p => p.category))], []);

  const filteredPlans = useMemo(() => {
    return TRAVEL_PLANS.filter(plan => {
      const matchesCategory = selectedCategory === 'Todos' || plan.category === selectedCategory;
      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-5xl font-black text-center text-white mb-4 drop-shadow-lg">Nuestros Planes y Servicios</h1>
      <p className="text-center text-white/80 mb-8 max-w-3xl mx-auto">
        Descubre la variedad de experiencias que hemos diseñado para ti. Filtra por categoría o busca tu destino soñado.
      </p>

      {/* Filters */}
      <GlassCard className="p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:flex-grow bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-white/20 border-none text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none appearance-none"
        >
          {categories.map(cat => <option key={cat} value={cat} className="bg-purple-800">{cat}</option>)}
        </select>
      </GlassCard>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <GlassCard key={plan.id} className="flex flex-col hover:scale-105 transition-transform duration-300">
              <img src={plan.image} alt={plan.title} className="w-full h-48 object-cover rounded-t-xl" />
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-sm font-semibold text-pink-300">{plan.category}</span>
                <h3 className="text-2xl font-bold text-white mt-1">{plan.title}</h3>
                <p className="text-pink-200 font-semibold mt-1">{plan.price}</p>
                <p className="mt-2 text-white/80 text-sm flex-grow">{plan.description}</p>
                <div className="mt-4 border-t border-white/20 pt-4">
                    <h4 className="font-semibold text-white">Incluye:</h4>
                    <ul className="text-xs text-white/70 list-disc list-inside mt-2 space-y-1">
                        {plan.includes.map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="lg:col-span-3 xl:col-span-4 text-center py-16">
            <GlassCard className="p-8 inline-block">
              <h3 className="text-2xl text-white font-bold">No se encontraron planes</h3>
              <p className="text-white/80 mt-2">Intenta ajustar tu búsqueda o filtros.</p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPage;
