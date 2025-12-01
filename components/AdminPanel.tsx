
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { parseTravelPlanFromText } from '../services/geminiService';
import { Plan, Testimonial, AboutUsContent, LegalContent, FAQItem, Regime, TravelerType } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS, DEFAULT_CATEGORIES } from '../constants';

type AppData = {
  plans: Plan[];
  testimonials: Testimonial[];
  aboutUs: AboutUsContent;
  legal: LegalContent;
  faqs: FAQItem[];
  contact: typeof DEFAULT_CONTACT_INFO;
  social: typeof DEFAULT_SOCIAL_LINKS;
  logoUrl: string;
  planibotAvatarUrl: string;
  seoImageUrl: string;
  categories: string[];
};

interface AdminPanelProps {
  appData: AppData;
  onSave: (data: AppData) => Promise<boolean>;
  onLogout: () => void;
}

interface AdminSubComponentProps {
    editedData: AppData;
    setEditedData: React.Dispatch<React.SetStateAction<AppData>>;
}

type AdminSection = 'dashboard' | 'plans' | 'categories' | 'testimonials' | 'content' | 'settings';

const NeumorphicCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (event: React.MouseEvent<HTMLDivElement>) => void }> = ({ children, className = '', onClick }) => {
    return (
        <div onClick={onClick} className={`bg-white rounded-xl shadow-md border border-gray-100 p-4 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
};

const NeumorphicButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean; title?: string }> = ({ children, className = '', onClick, disabled = false, title }) => {
    return (
        <button type="button" onClick={onClick} disabled={disabled} title={title} className={`font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:shadow-inner ${className}`}>
            {children}
        </button>
    );
};

// --- Sub-Components ---

const Dashboard: React.FC<{ avatarUrl: string; plansCount: number }> = ({ avatarUrl, plansCount }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NeumorphicCard className="flex items-center space-x-4">
                 <div className="p-3 rounded-full bg-pink-100 text-pink-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                 </div>
                 <div>
                     <p className="text-gray-500 text-sm">Planes Activos</p>
                     <p className="text-2xl font-bold text-gray-800">{plansCount}</p>
                 </div>
            </NeumorphicCard>
             <NeumorphicCard className="flex items-center space-x-4">
                 <div className="p-3 rounded-full bg-green-100 text-green-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                     <p className="text-gray-500 text-sm">Estado del Sistema</p>
                     <p className="text-xl font-bold text-green-600">En Línea</p>
                 </div>
            </NeumorphicCard>
             <NeumorphicCard className="flex items-center space-x-4">
                 <img src={avatarUrl} alt="Bot Avatar" className="w-12 h-12 rounded-full border border-gray-200" />
                 <div>
                     <p className="text-gray-500 text-sm">PlaniBot</p>
                     <p className="text-xl font-bold text-blue-600">Activo</p>
                 </div>
            </NeumorphicCard>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-800">Bienvenido al Administrador</h3>
            <p className="text-blue-600 text-sm mt-1">Utiliza el menú lateral para gestionar el contenido de la aplicación. No olvides guardar tus cambios antes de salir.</p>
        </div>
    </div>
);

// --- PLAN EDITOR COMPONENT ---
const PlanEditor: React.FC<{ 
    plan: Plan; 
    onSave: (plan: Plan) => void; 
    onCancel: () => void;
    categories: string[];
}> = ({ plan, onSave, onCancel, categories }) => {
    const [formData, setFormData] = useState<Plan>(plan);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
    };

    // Helper for array fields (images, includes, amenities)
    const handleArrayChange = (index: number, value: string, field: 'images' | 'includes' | 'amenities') => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field: 'images' | 'includes' | 'amenities') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (index: number, field: 'images' | 'includes' | 'amenities') => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-fade-in-right p-6">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{plan.id ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                    <div className="flex gap-2">
                        <NeumorphicButton onClick={onCancel} className="px-4 py-2 text-gray-500 hover:bg-gray-100">Cancelar</NeumorphicButton>
                        <NeumorphicButton onClick={() => onSave(formData)} className="px-4 py-2 bg-pink-500 text-white hover:bg-pink-600">Guardar</NeumorphicButton>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título del Plan</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Régimen</label>
                            <select name="regime" value={formData.regime} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none">
                                <option value="Todo Incluido">Todo Incluido</option>
                                <option value="Pensión Completa">Pensión Completa</option>
                                <option value="Con Desayuno Incluido">Con Desayuno Incluido</option>
                                <option value="Solo Alojamiento">Solo Alojamiento</option>
                                <option value="Paquete Promocional">Paquete Promocional</option>
                            </select>
                        </div>
                    </div>

                    {/* Location & Dates */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">País</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Salida</label>
                            <input type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Regreso</label>
                            <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>

                    {/* Price & Description */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Texto Precio (Visible)</label>
                                <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="ej: $500.000 COP" className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Valor Numérico (Para ordenar)</label>
                                <input type="number" name="priceValue" value={formData.priceValue} onChange={handleNumberChange} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Completa</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Link Catálogo WhatsApp (Opcional)</label>
                            <input type="text" name="whatsappCatalogUrl" value={formData.whatsappCatalogUrl || ''} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" placeholder="https://wa.me/p/..." />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">Imágenes (URLs)</label>
                            <button type="button" onClick={() => addArrayItem('images')} className="text-xs text-pink-500 font-bold hover:underline">+ Agregar Imagen</button>
                        </div>
                        <div className="space-y-2">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input type="text" value={img} onChange={(e) => handleArrayChange(idx, e.target.value, 'images')} className="flex-grow p-2 border rounded-lg text-sm" placeholder="https://..." />
                                    <button type="button" onClick={() => removeArrayItem(idx, 'images')} className="text-red-500 hover:text-red-700 px-2">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Includes */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">El plan incluye:</label>
                            <button type="button" onClick={() => addArrayItem('includes')} className="text-xs text-pink-500 font-bold hover:underline">+ Agregar Item</button>
                        </div>
                        <div className="space-y-2">
                            {formData.includes.map((inc, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input type="text" value={inc} onChange={(e) => handleArrayChange(idx, e.target.value, 'includes')} className="flex-grow p-2 border rounded-lg text-sm" />
                                    <button type="button" onClick={() => removeArrayItem(idx, 'includes')} className="text-red-500 hover:text-red-700 px-2">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PlansManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    const [aiText, setAiText] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const handleAiParse = async () => {
        if (!aiText.trim()) return;
        setLoading(true);
        try {
            const partialPlan = await parseTravelPlanFromText(aiText);
            const newPlan: Plan = {
                id: Date.now(),
                title: partialPlan.title || 'Nuevo Plan Generado',
                category: partialPlan.category || 'Sol y Playa',
                price: partialPlan.price || 'Consultar Precio',
                priceValue: partialPlan.priceValue || 0,
                durationDays: partialPlan.durationDays || 1,
                description: partialPlan.description || 'Descripción pendiente.',
                images: partialPlan.images || [],
                includes: partialPlan.includes || [],
                isVisible: true,
                isFeatured: false,
                departureDate: partialPlan.departureDate || '',
                returnDate: partialPlan.returnDate || '',
                country: partialPlan.country || 'Colombia',
                city: partialPlan.city || '',
                regime: (partialPlan.regime as Regime) || 'Solo Alojamiento',
                travelerTypes: (partialPlan.travelerTypes as TravelerType[]) || ['Familias'],
                amenities: partialPlan.amenities || [],
                whatsappCatalogUrl: partialPlan.whatsappCatalogUrl
            };
            setEditedData(prev => ({ ...prev, plans: [newPlan, ...prev.plans] }));
            setAiText('');
            alert('Plan generado correctamente. Puedes editarlo en la lista.');
        } catch (error) {
            console.error(error);
            alert('Error al generar el plan con IA.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = (id: number) => {
        if (window.confirm('¿Eliminar este plan?')) {
            setEditedData(prev => ({
                ...prev,
                plans: prev.plans.filter(p => p.id !== id)
            }));
        }
    };

    const toggleFeatured = (id: number) => {
         setEditedData(prev => ({
            ...prev,
            plans: prev.plans.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p)
        }));
    };

    const toggleVisibility = (id: number) => {
        setEditedData(prev => ({
            ...prev,
            plans: prev.plans.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p)
        }));
    };

    const handleCreateManual = () => {
        const newPlan: Plan = {
            id: Date.now(),
            title: '',
            category: 'Sol y Playa',
            price: '',
            priceValue: 0,
            durationDays: 1,
            description: '',
            images: [],
            includes: [],
            isVisible: true,
            isFeatured: false,
            departureDate: '',
            returnDate: '',
            country: '',
            city: '',
            regime: 'Solo Alojamiento',
            travelerTypes: [],
            amenities: []
        };
        setEditingPlan(newPlan);
    };

    const handleSaveEditedPlan = (updatedPlan: Plan) => {
        setEditedData(prev => {
            const planExists = prev.plans.some(p => p.id === updatedPlan.id);
            if (planExists) {
                return { ...prev, plans: prev.plans.map(p => p.id === updatedPlan.id ? updatedPlan : p) };
            } else {
                return { ...prev, plans: [updatedPlan, ...prev.plans] };
            }
        });
        setEditingPlan(null);
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
             <div className="grid md:grid-cols-2 gap-6">
                 {/* AI Generator */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-pink-100 shadow-sm">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                        ✨ Generador IA
                    </h3>
                    <textarea
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        placeholder="Pega aquí la descripción del hotel/plan..."
                        className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm bg-white h-24 resize-none"
                    />
                    <div className="mt-3 flex justify-end">
                        <NeumorphicButton 
                            onClick={handleAiParse} 
                            disabled={loading || !aiText.trim()}
                            className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 shadow-md text-sm"
                        >
                            {loading ? '...' : 'Generar'}
                        </NeumorphicButton>
                    </div>
                </div>

                {/* Manual Actions */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Creación Manual</h3>
                    <p className="text-gray-500 text-sm mb-4">Crea un plan desde cero con control total.</p>
                    <NeumorphicButton 
                        onClick={handleCreateManual}
                        className="px-6 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-pink-500 hover:text-pink-500 w-full"
                    >
                        + Nuevo Plan Manual
                    </NeumorphicButton>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {editedData.plans.map(plan => (
                    <NeumorphicCard key={plan.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group hover:shadow-lg transition-shadow">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            {plan.images[0] && <img src={plan.images[0]} alt={plan.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-gray-800">{plan.title}</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">{plan.category}</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">{plan.city}</span>
                                <span className="font-semibold text-green-600">{plan.price}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button 
                                onClick={() => setEditingPlan(plan)}
                                className="p-2 rounded-full text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
                                title="Editar Detalles"
                            >
                                ✎
                            </button>
                            <button 
                                onClick={() => toggleFeatured(plan.id)}
                                className={`p-2 rounded-full transition-colors ${plan.isFeatured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-yellow-400'}`}
                                title="Destacar"
                            >
                                ★
                            </button>
                            <button 
                                onClick={() => toggleVisibility(plan.id)}
                                className={`p-2 rounded-full transition-colors ${plan.isVisible ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-green-400'}`}
                                title="Visibilidad"
                            >
                                👁
                            </button>
                            <button 
                                onClick={() => handleDeletePlan(plan.id)}
                                className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Eliminar"
                            >
                                🗑
                            </button>
                        </div>
                    </NeumorphicCard>
                ))}
            </div>

            {/* Modal Editor */}
            {editingPlan && (
                <PlanEditor 
                    plan={editingPlan} 
                    onSave={handleSaveEditedPlan} 
                    onCancel={() => setEditingPlan(null)}
                    categories={editedData.categories}
                />
            )}
        </div>
    );
};

const CategoriesManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    const [newCat, setNewCat] = useState('');

    const addCategory = () => {
        if (newCat.trim() && !editedData.categories.includes(newCat.trim())) {
            setEditedData(prev => ({ ...prev, categories: [...prev.categories, newCat.trim()] }));
            setNewCat('');
        }
    };

    const removeCategory = (cat: string) => {
        setEditedData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newCat} 
                    onChange={e => setNewCat(e.target.value)} 
                    placeholder="Nueva categoría..." 
                    className="flex-grow p-2 border rounded-lg outline-none focus:border-pink-500"
                />
                <NeumorphicButton onClick={addCategory} className="px-4 bg-pink-500 text-white hover:bg-pink-600">Agregar</NeumorphicButton>
            </div>
            <div className="flex flex-wrap gap-2">
                {editedData.categories.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-white border rounded-full text-sm text-gray-700 flex items-center gap-2 shadow-sm">
                        {cat}
                        <button onClick={() => removeCategory(cat)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                    </span>
                ))}
            </div>
        </div>
    );
};

const TestimonialsManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Testimonios</h2>
            <div className="grid gap-4">
                {editedData.testimonials.map((t, idx) => (
                    <NeumorphicCard key={t.id} className="relative">
                         <button 
                            onClick={() => {
                                const newTestimonials = [...editedData.testimonials];
                                newTestimonials.splice(idx, 1);
                                setEditedData({...editedData, testimonials: newTestimonials});
                            }}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >✕</button>
                        <input 
                            value={t.author} 
                            onChange={e => {
                                const newTestimonials = [...editedData.testimonials];
                                newTestimonials[idx].author = e.target.value;
                                setEditedData({...editedData, testimonials: newTestimonials});
                            }}
                            className="font-bold text-gray-800 w-full mb-1 bg-transparent outline-none border-b border-transparent focus:border-gray-300" 
                        />
                        <textarea 
                            value={t.text} 
                            onChange={e => {
                                const newTestimonials = [...editedData.testimonials];
                                newTestimonials[idx].text = e.target.value;
                                setEditedData({...editedData, testimonials: newTestimonials});
                            }}
                            className="w-full text-gray-600 text-sm bg-transparent outline-none resize-none focus:bg-gray-50 rounded p-1" 
                        />
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                    key={star} 
                                    onClick={() => {
                                        const newTestimonials = [...editedData.testimonials];
                                        newTestimonials[idx].rating = star;
                                        setEditedData({...editedData, testimonials: newTestimonials});
                                    }}
                                    className={`text-lg ${star <= t.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >★</button>
                            ))}
                        </div>
                    </NeumorphicCard>
                ))}
                <NeumorphicButton 
                    onClick={() => setEditedData(prev => ({ ...prev, testimonials: [...prev.testimonials, { id: Date.now(), author: 'Nuevo Cliente', text: 'Reseña aquí...', rating: 5 }] }))}
                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-pink-500 hover:text-pink-500"
                >
                    + Agregar Testimonio
                </NeumorphicButton>
            </div>
        </div>
    );
};

const ContentManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Sobre Nosotros</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Misión</label>
                        <textarea 
                            value={editedData.aboutUs.mission} 
                            onChange={e => setEditedData({...editedData, aboutUs: {...editedData.aboutUs, mission: e.target.value}})}
                            className="w-full p-2 border rounded-lg mt-1 text-sm focus:ring-1 focus:ring-pink-500 outline-none" 
                            rows={3}
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase">Visión</label>
                        <textarea 
                            value={editedData.aboutUs.vision} 
                            onChange={e => setEditedData({...editedData, aboutUs: {...editedData.aboutUs, vision: e.target.value}})}
                            className="w-full p-2 border rounded-lg mt-1 text-sm focus:ring-1 focus:ring-pink-500 outline-none" 
                            rows={3}
                        />
                    </div>
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Legal</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Política General</label>
                        <textarea 
                            value={editedData.legal.generalPolicy} 
                            onChange={e => setEditedData({...editedData, legal: {...editedData.legal, generalPolicy: e.target.value}})}
                            className="w-full p-2 border rounded-lg mt-1 text-sm focus:ring-1 focus:ring-pink-500 outline-none" 
                            rows={4}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const SettingsManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    return (
        <div className="space-y-8 animate-fade-in">
             <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Contacto</h3>
                <div className="grid gap-4">
                    <input 
                        value={editedData.contact.phone} 
                        onChange={e => setEditedData({...editedData, contact: {...editedData.contact, phone: e.target.value}})}
                        placeholder="Teléfono" className="p-2 border rounded"
                    />
                    <input 
                        value={editedData.contact.email} 
                        onChange={e => setEditedData({...editedData, contact: {...editedData.contact, email: e.target.value}})}
                        placeholder="Email" className="p-2 border rounded"
                    />
                    <input 
                        value={editedData.contact.address} 
                        onChange={e => setEditedData({...editedData, contact: {...editedData.contact, address: e.target.value}})}
                        placeholder="Dirección" className="p-2 border rounded"
                    />
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Imágenes del Sistema</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500">URL Logo</label>
                        <input 
                            value={editedData.logoUrl} 
                            onChange={e => setEditedData({...editedData, logoUrl: e.target.value})}
                            className="w-full p-2 border rounded mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500">URL Avatar Bot</label>
                        <input 
                            value={editedData.planibotAvatarUrl} 
                            onChange={e => setEditedData({...editedData, planibotAvatarUrl: e.target.value})}
                            className="w-full p-2 border rounded mt-1"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ appData, onSave, onLogout }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editedData, setEditedData] = useState<AppData>(appData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(appData) !== JSON.stringify(editedData));
  }, [editedData, appData]);

  const handleSaveChanges = async () => {
    if (window.confirm("¿Estás seguro de que quieres guardar todos los cambios en la base de datos?")) {
        setIsSaving(true);
        const success = await onSave(editedData);
        setIsSaving(false);
        if (success) {
            alert('¡Cambios guardados con éxito!');
        }
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("¿Estás seguro de que quieres descartar todos los cambios no guardados?")) {
        setEditedData(appData);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard avatarUrl={editedData.planibotAvatarUrl} plansCount={editedData.plans.length} />;
      case 'plans':
        return <PlansManager editedData={editedData} setEditedData={setEditedData} />;
      case 'categories':
        return <CategoriesManager editedData={editedData} setEditedData={setEditedData} />;
      case 'testimonials':
        return <TestimonialsManager editedData={editedData} setEditedData={setEditedData} />;
      case 'content':
        return <ContentManager editedData={editedData} setEditedData={setEditedData} />;
      case 'settings':
        return <SettingsManager editedData={editedData} setEditedData={setEditedData} />;
      default:
        return null;
    }
  };

  const NavButton: React.FC<{ section: AdminSection, label: string, icon: React.ReactNode }> = ({ section, label, icon }) => (
    <button
      onClick={() => {
        setActiveSection(section);
        setIsSidebarOpen(false);
      }}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
        activeSection === section
          ? 'bg-pink-50 text-pink-600 font-bold shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800 font-sans">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-black text-pink-600 tracking-tighter flex items-center gap-2">
                    <span>⚙️</span> ADMIN PANEL
                </h1>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
                <NavButton section="dashboard" label="Dashboard" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} />
                <NavButton section="plans" label="Planes" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} />
                <NavButton section="categories" label="Categorías" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>} />
                <NavButton section="testimonials" label="Testimonios" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>} />
                <NavButton section="content" label="Contenido" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
                <NavButton section="settings" label="Configuración" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
            </nav>
            
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
                <button onClick={onLogout} className="flex items-center space-x-2 text-red-500 hover:text-red-700 w-full px-4 py-2 rounded transition-colors font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
            <header className="bg-white shadow-sm z-10 p-4 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div className="flex items-center space-x-4 ml-auto">
                   {isDirty && (
                       <div className="hidden sm:flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                           <span>⚠️ Cambios sin guardar</span>
                       </div>
                   )}
                    <NeumorphicButton onClick={handleDiscardChanges} disabled={!isDirty} className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                        Descartar
                    </NeumorphicButton>
                    <NeumorphicButton onClick={handleSaveChanges} disabled={!isDirty || isSaving} className="px-5 py-2 bg-pink-500 text-white hover:bg-pink-600 shadow-md shadow-pink-200">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </NeumorphicButton>
                </div>
            </header>
            
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    {renderSection()}
                </div>
            </div>
        </main>
    </div>
  );
};

export default AdminPanel;
