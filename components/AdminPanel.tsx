
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { parseTravelPlanFromText } from '../services/geminiService';
import { Plan, Testimonial, AboutUsContent, LegalContent, FAQItem, Regime, TravelerType } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS, COMMON_AMENITIES, COMMON_INCLUDES } from '../constants';

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
    handleImmediateSave?: () => Promise<void>;
}

type AdminSection = 'dashboard' | 'plans' | 'categories' | 'testimonials' | 'content' | 'settings';

const NeumorphicCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (event: React.MouseEvent<HTMLDivElement>) => void; type?: 'convex' | 'concave' | 'flat' }> = ({ children, className = '', onClick, type = 'convex' }) => {
    const typeClass = {
        convex: 'neumorphic-convex',
        concave: 'neumorphic-concave',
        flat: 'neumorphic-flat'
    };
    return (
        <div onClick={onClick} className={`${typeClass[type]} rounded-2xl transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
};

const NeumorphicButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; type?: 'button' | 'submit'; disabled?: boolean; }> = ({ children, className = '', onClick, type = 'button', disabled = false }) => {
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`neumorphic-convex active:neumorphic-pressed font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
            {children}
        </button>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ appData, onSave, onLogout }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editedData, setEditedData] = useState<AppData>(appData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simple check to see if data changed
    setIsDirty(JSON.stringify(appData) !== JSON.stringify(editedData));
  }, [editedData, appData]);

  const handleSaveChanges = async () => {
    if (window.confirm("¿Estás seguro de que quieres guardar todos los cambios en la base de datos?")) {
        setIsSaving(true);
        const success = await onSave(editedData);
        setIsSaving(false);
        if (success) {
            alert('¡Cambios guardados con éxito!');
            setIsDirty(false); // Reset dirty flag
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
        return <Dashboard />;
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

  const NavButton: React.FC<{ section: AdminSection, label: string }> = ({ section, label }) => (
    <button
      onClick={() => {
        setActiveSection(section);
        setIsSidebarOpen(false); // Close sidebar on selection in mobile
      }}
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
        activeSection === section ? 'neumorphic-pressed text-pink-600' : 'neumorphic-convex active:neumorphic-pressed hover:text-pink-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <style>{`
        :root {
            --admin-bg: #e0e0e0;
            --admin-text: #333;
            --admin-shadow-light: #ffffff;
            --admin-shadow-dark: #bebebe;
            --admin-accent: #e91e63;
        }
        .admin-panel-body {
            background-color: var(--admin-bg);
            color: var(--admin-text);
            font-family: 'Roboto', sans-serif;
        }
        .neumorphic-convex {
            background: var(--admin-bg);
            box-shadow: 7px 7px 15px var(--admin-shadow-dark), -7px -7px 15px var(--admin-shadow-light);
        }
        .neumorphic-concave {
            background: var(--admin-bg);
            box-shadow: inset 7px 7px 15px var(--admin-shadow-dark), inset -7px -7px 15px var(--admin-shadow-light);
        }
         .neumorphic-flat {
            background: var(--admin-bg);
            box-shadow: inset 3px 3px 7px var(--admin-shadow-dark), inset -3px -3px 7px var(--admin-shadow-light);
        }
        .neumorphic-pressed {
            background: var(--admin-bg);
            box-shadow: inset 7px 7px 15px var(--admin-shadow-dark), inset -7px -7px 15px var(--admin-shadow-light) !important;
        }
        .neu-input, .neu-textarea, .neu-select {
            background: var(--admin-bg);
            border: none;
            outline: none;
            box-shadow: inset 4px 4px 8px var(--admin-shadow-dark), inset -4px -4px 8px var(--admin-shadow-light);
        }
        .neu-input:focus, .neu-textarea:focus, .neu-select:focus {
             box-shadow: inset 2px 2px 4px var(--admin-shadow-dark), inset -2px -2px 4px var(--admin-shadow-light);
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        /* Custom scrollbar for admin panel */
        .admin-scroll::-webkit-scrollbar {
            width: 8px;
        }
        .admin-scroll::-webkit-scrollbar-track {
            background: #e0e0e0;
        }
        .admin-scroll::-webkit-scrollbar-thumb {
            background-color: #bbb;
            border-radius: 20px;
        }
      `}</style>
      <div className="admin-panel-body min-h-screen">
        <div className="flex">
          {/* Sidebar */}
          <aside className={`fixed md:relative top-0 left-0 h-full z-20 w-64 p-4 flex-col bg-[var(--admin-bg)] transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}>
            <div className="flex items-center gap-3 mb-8">
              <img src={editedData.logoUrl} alt="Logo" className="h-12 w-auto" />
              <h1 className="font-bold text-lg">Admin Panel</h1>
            </div>
            <nav className="flex-grow space-y-4">
              <NavButton section="dashboard" label="Dashboard" />
              <NavButton section="plans" label="Planes y Servicios" />
              <NavButton section="categories" label="Categorías" />
              <NavButton section="testimonials" label="Testimonios" />
              <NavButton section="content" label="Contenido de Páginas" />
              <NavButton section="settings" label="Ajustes Generales" />
            </nav>
            <button onClick={onLogout} className="w-full text-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 bg-red-500 text-white neumorphic-convex active:neumorphic-pressed">
              Cerrar Sesión
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 min-h-screen relative">
             {/* Mobile Header */}
             <div className="md:hidden flex justify-between items-center mb-4">
                 <h1 className="font-bold text-lg">Admin Panel</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 neumorphic-convex rounded-full active:neumorphic-pressed">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            </div>
            {renderSection()}
            
            {isDirty && (
                 <div className="fixed bottom-0 right-0 p-4 w-full md:w-[calc(100%-16rem)] flex justify-end gap-4 bg-[var(--admin-bg)]/80 backdrop-blur-sm neumorphic-convex z-30 animate-fade-in">
                    <p className='font-semibold self-center hidden sm:block'>Tienes cambios sin guardar</p>
                    <NeumorphicButton onClick={handleDiscardChanges} className="px-5 py-2 text-gray-700" disabled={isSaving}>Descartar</NeumorphicButton>
                    <NeumorphicButton onClick={handleSaveChanges} className="px-5 py-2 text-pink-600 font-bold" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </NeumorphicButton>
                </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

const Dashboard: React.FC = () => (
    <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-6 text-[var(--admin-text)]">Dashboard</h1>
        <NeumorphicCard className="p-8 text-center flex flex-col md:flex-row items-center justify-center gap-8">
            <img 
                src="https://lh3.googleusercontent.com/pw/AP1GczOg5IgQQVl9w2YkK35lWrFxwq60oYcLfDlaXa9HAySS708-1MN_PcwEDF_v1FQSzLg712ydSPSUgTmIatksM6ovhV95EfzTW1cxs0X14AODWwE9ZqJuCWy4lV-Pg5NcHCKcSoHzBNq6iENlo_VL0Yc=w991-h991-s-no-gm?authuser=0"
                alt="PlaniBot"
                className="w-40 h-40 rounded-full neumorphic-convex p-2"
            />
            <div>
                 <h2 className="text-3xl font-bold mb-2">¡Bienvenido al Panel de Administración!</h2>
                <p className="text-gray-600 max-w-lg">
                    Desde aquí puedes gestionar todo el contenido de tu sitio web. Usa el menú para navegar entre las diferentes secciones, crear nuevos planes y gestionar tus categorías.
                </p>
            </div>
        </NeumorphicCard>
    </div>
);


const PlansManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const handleSavePlan = (planToSave: Plan) => {
        let updatedPlans;
        if (editingPlan) {
            updatedPlans = editedData.plans.map(p => p.id === planToSave.id ? planToSave : p);
        } else {
            // Generar un ID temporal para nuevos planes. 
            // Nota: Al guardar en Supabase, se generará un ID real si no enviamos este.
            const newPlan = { ...planToSave, id: Date.now() }; 
            updatedPlans = [...editedData.plans, newPlan];
        }
        setEditedData({ ...editedData, plans: updatedPlans });
    };

    const handleDeletePlan = async (planId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
            // Delete from Supabase immediately for cleaner logic (optional but recommended)
            try {
                const { error } = await supabase.from('plans').delete().eq('id', planId);
                if (error) throw error;
                // Update Local State
                const updatedPlans = editedData.plans.filter(p => p.id !== planId);
                setEditedData({ ...editedData, plans: updatedPlans });
            } catch (error) {
                console.error("Error deleting plan:", error);
                alert("Error al eliminar el plan de la base de datos.");
            }
        }
    };
    
    const handleToggleVisibility = (planId: number) => {
        const updatedPlans = editedData.plans.map(p => p.id === planId ? {...p, isVisible: !p.isVisible} : p);
        setEditedData({ ...editedData, plans: updatedPlans });
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-4xl font-bold">Gestionar Planes</h1>
                <NeumorphicButton onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="py-2 px-4 text-pink-600 bg-pink-100 flex items-center gap-2">
                    <span className="text-xl">+</span> Añadir Nuevo Plan
                </NeumorphicButton>
            </div>
             <NeumorphicCard type="flat" className="p-4">
                <div className="space-y-4">
                    {editedData.plans.map(plan => (
                        <NeumorphicCard key={plan.id} className="flex flex-col md:flex-row items-center justify-between p-4 hover:shadow-xl transition-shadow">
                            <div className="mb-2 md:mb-0 w-full md:w-auto">
                                <div className="flex items-center gap-2">
                                     <h3 className="font-bold text-lg">{plan.title}</h3>
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full ${plan.isVisible ? 'bg-green-200 text-green-800' : 'bg-gray-300 text-gray-700'}`}>{plan.isVisible ? 'Visible' : 'Oculto'}</span>
                                </div>
                                <p className="text-sm text-gray-600">{plan.city}, {plan.country} • {plan.category}</p>
                                <p className="text-sm font-semibold text-pink-600">{plan.price}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto mt-2 md:mt-0">
                                <NeumorphicButton onClick={() => handleToggleVisibility(plan.id)} className={`px-4 py-2 text-sm ${plan.isVisible ? 'text-gray-600' : 'text-green-700'}`}>
                                    {plan.isVisible ? 'Ocultar' : 'Publicar'}
                                </NeumorphicButton>
                                <NeumorphicButton onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="px-4 py-2 text-sm text-blue-700">Editar</NeumorphicButton>
                                <NeumorphicButton onClick={() => handleDeletePlan(plan.id)} className="px-4 py-2 text-sm text-red-700">Eliminar</NeumorphicButton>
                            </div>
                        </NeumorphicCard>
                    ))}
                </div>
            </NeumorphicCard>
            {isModalOpen && <PlanFormModal plan={editingPlan} categories={editedData.categories} onSave={handleSavePlan} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

// Helper component for multi-select (checkboxes)
const CheckboxGroup: React.FC<{ options: string[], selected: string[], onChange: (selected: string[]) => void, title: string, allowCustom?: boolean }> = ({ options, selected, onChange, title, allowCustom = true }) => {
    const [customVal, setCustomVal] = useState('');

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const addCustom = (e: React.FormEvent) => {
        e.preventDefault();
        if (customVal && !selected.includes(customVal)) {
            onChange([...selected, customVal]);
            setCustomVal('');
        }
    };

    return (
        <div className="mb-4">
            <label className="text-sm font-bold text-gray-700 block mb-2">{title}</label>
            <div className="bg-[#e0e0e0] p-3 rounded-lg neumorphic-concave">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto admin-scroll p-1">
                    {options.map(opt => (
                        <label key={opt} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-black/5 rounded p-1">
                            <input 
                                type="checkbox" 
                                checked={selected.includes(opt)} 
                                onChange={() => toggleOption(opt)}
                                className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                    {/* Show selected custom options that aren't in the default list */}
                    {selected.filter(s => !options.includes(s)).map(opt => (
                         <label key={opt} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-black/5 rounded p-1 bg-pink-100">
                            <input 
                                type="checkbox" 
                                checked={true} 
                                onChange={() => toggleOption(opt)}
                                className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
                {allowCustom && (
                    <div className="mt-3 flex gap-2">
                        <input 
                            type="text" 
                            value={customVal} 
                            onChange={e => setCustomVal(e.target.value)} 
                            placeholder="Añadir otro..." 
                            className="neu-input flex-1 p-2 rounded-lg text-sm"
                        />
                        <button type="button" onClick={addCustom} className="neumorphic-convex px-3 py-1 text-xs font-bold text-pink-600 rounded-lg">+</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PlanFormModal: React.FC<{ plan: Plan | null, categories: string[], onSave: (plan: Plan) => void, onClose: () => void }> = ({ plan, categories, onSave, onClose }) => {
    const [formData, setFormData] = useState<Plan>({
        id: plan?.id || 0,
        title: plan?.title || '',
        category: plan?.category || categories[0] || '',
        price: plan?.price || '',
        priceValue: plan?.priceValue || 0,
        durationDays: plan?.durationDays || 1,
        description: plan?.description || '',
        images: plan?.images || [],
        includes: plan?.includes || [],
        isVisible: plan?.isVisible ?? true,
        departureDate: plan?.departureDate || '',
        returnDate: plan?.returnDate || '',
        country: plan?.country || '',
        city: plan?.city || '',
        regime: plan?.regime || 'Solo Alojamiento',
        travelerTypes: plan?.travelerTypes || [],
        amenities: plan?.amenities || [],
        whatsappCatalogUrl: plan?.whatsappCatalogUrl || ''
    });
    const [activeTab, setActiveTab] = useState('basic');
    const [showAIInput, setShowAIInput] = useState(false);
    const [aiInputText, setAiInputText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // New state for manual image input
    const [tempImageInput, setTempImageInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleTravelerTypesChange = (selected: string[]) => setFormData(p => ({...p, travelerTypes: selected as TravelerType[]}));

    const handleAddImages = () => {
        if (!tempImageInput.trim()) return;
        
        // Split by newlines, commas, or spaces (handling basic bulk paste)
        const newUrls = tempImageInput
            .split(/[\n,\s]+/)
            .map(url => url.trim())
            .filter(url => url.startsWith('http')); // Basic validation

        if (newUrls.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newUrls]
            }));
            setTempImageInput('');
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    const handleAIProcess = async () => {
        if (!aiInputText.trim()) return;
        setIsAiLoading(true);
        try {
            const extractedData = await parseTravelPlanFromText(aiInputText);
            setFormData(prev => ({
                ...prev,
                ...extractedData,
                // Ensure array fields are not null/undefined
                images: extractedData.images && extractedData.images.length > 0 ? extractedData.images : prev.images,
                includes: extractedData.includes && extractedData.includes.length > 0 ? extractedData.includes : prev.includes,
                travelerTypes: (extractedData.travelerTypes as TravelerType[]) || prev.travelerTypes,
                amenities: extractedData.amenities && extractedData.amenities.length > 0 ? extractedData.amenities : prev.amenities,
                // Ensure required defaults
                category: extractedData.category || prev.category,
                regime: (extractedData.regime as Regime) || prev.regime,
                whatsappCatalogUrl: extractedData.whatsappCatalogUrl || prev.whatsappCatalogUrl
            }));
            setShowAIInput(false);
            setAiInputText('');
            alert('¡Datos extraídos y completados por la IA!');
        } catch (error) {
            console.error("AI Error", error);
            alert("Hubo un problema al procesar el texto con la IA.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const allRegimes: Regime[] = ['Todo Incluido', 'Pensión Completa', 'Con Desayuno Incluido', 'Solo Alojamiento', 'Paquete Promocional'];
    const allTravelerTypes: TravelerType[] = ['Familias', 'Parejas', 'Grupos', 'Negocios', 'Descanso / Relax', 'Cultural', 'Aventura'];

    const TabButton: React.FC<{tabId: string, label: string}> = ({tabId, label}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
                activeTab === tabId ? 'neumorphic-pressed text-pink-600 bg-gray-200' : 'hover:bg-gray-300 text-gray-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#e0e0e0] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-[#e0e0e0] border-b border-gray-300 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{plan ? 'Editar Plan' : 'Nuevo Plan de Viaje'}</h2>
                    <div className="flex items-center gap-2">
                        <NeumorphicButton 
                            onClick={() => setShowAIInput(!showAIInput)} 
                            className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg animate-pulse"
                        >
                            ✨ IA Autocompletar
                        </NeumorphicButton>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                
                {showAIInput && (
                    <div className="p-4 bg-purple-50 border-b border-purple-200 animate-fade-in">
                        <p className="text-sm text-purple-800 mb-2 font-semibold">Pega aquí toda la información del plan (Texto, Links de Fotos, WhatsApp, etc). La IA organizará todo por ti:</p>
                        <textarea 
                            value={aiInputText}
                            onChange={(e) => setAiInputText(e.target.value)}
                            className="w-full h-48 p-3 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm font-mono"
                            placeholder="Ej: HOTEL SANSIRAKA (SANTA MARTA)... (Pega aquí todo el texto desordenado)"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setShowAIInput(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
                            <button 
                                onClick={handleAIProcess} 
                                disabled={isAiLoading || !aiInputText}
                                className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                            >
                                {isAiLoading ? 'Analizando texto...' : 'Generar Plan'}
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex bg-gray-200 px-6 pt-2 space-x-1 overflow-x-auto">
                    <TabButton tabId="basic" label="Básico" />
                    <TabButton tabId="details" label="Detalles" />
                    <TabButton tabId="features" label="Incluye" />
                    <TabButton tabId="media" label="Imágenes" />
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 admin-scroll">
                        {activeTab === 'basic' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Título del Plan</label>
                                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Ej: Escapada a San Andrés" className="neu-input w-full p-3 rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="neu-select w-full p-3 rounded-lg">
                                            <option value="">Selecciona una categoría</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-1">Precio (Texto)</label>
                                        <input name="price" value={formData.price} onChange={handleChange} placeholder="Ej: $1,200,000 COP" className="neu-input w-full p-3 rounded-lg" />
                                    </div>
                                    <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-1">Valor (Numérico)</label>
                                        <input type="number" name="priceValue" value={formData.priceValue} onChange={handleChange} placeholder="Ej: 1200000" className="neu-input w-full p-3 rounded-lg" />
                                    </div>
                                    <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-1">Duración (Días)</label>
                                        <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} className="neu-input w-full p-3 rounded-lg" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="neu-textarea w-full h-32 p-3 rounded-lg" placeholder="Descripción detallada del plan..." />
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 bg-white/40 rounded-lg">
                                    <input type="checkbox" id="isVisible" name="isVisible" checked={formData.isVisible} onChange={e => setFormData(p => ({...p, isVisible: e.target.checked}))} className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                                    <label htmlFor="isVisible" className="font-semibold text-gray-700 cursor-pointer">Publicar este plan (Visible en la web)</label>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Link Catálogo WhatsApp (Opcional)</label>
                                    <input name="whatsappCatalogUrl" value={formData.whatsappCatalogUrl} onChange={handleChange} placeholder="https://wa.me/p/..." className="neu-input w-full p-3 rounded-lg" />
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'details' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Salida</label>
                                        <input type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} className="neu-input w-full p-3 rounded-lg"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Regreso</label>
                                        <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} className="neu-input w-full p-3 rounded-lg"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">País</label>
                                        <input name="country" value={formData.country} onChange={handleChange} placeholder="Ej: Colombia" className="neu-input w-full p-3 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad / Destino</label>
                                        <input name="city" value={formData.city} onChange={handleChange} placeholder="Ej: Cartagena" className="neu-input w-full p-3 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Régimen de Alojamiento</label>
                                    <select name="regime" value={formData.regime} onChange={handleChange} className="neu-select w-full p-3 rounded-lg">
                                        {allRegimes.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <CheckboxGroup 
                                    title="Tipo de Viajero (Ideal para)" 
                                    options={allTravelerTypes} 
                                    selected={formData.travelerTypes} 
                                    onChange={handleTravelerTypesChange} 
                                    allowCustom={false}
                                />
                            </div>
                        )}

                        {activeTab === 'features' && (
                            <div className="space-y-6 animate-fade-in">
                                <CheckboxGroup 
                                    title="Comodidades y Servicios (Amenities)" 
                                    options={COMMON_AMENITIES} 
                                    selected={formData.amenities} 
                                    onChange={(newVal) => setFormData(p => ({...p, amenities: newVal}))} 
                                />
                                
                                <CheckboxGroup 
                                    title="¿Qué incluye el plan?" 
                                    options={COMMON_INCLUDES} 
                                    selected={formData.includes} 
                                    onChange={(newVal) => setFormData(p => ({...p, includes: newVal}))} 
                                />
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white/50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Agregar Imágenes
                                        <span className="text-xs font-normal text-gray-500 ml-2">(Pega uno o varios enlaces separados por espacios o saltos de línea)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            value={tempImageInput}
                                            onChange={(e) => setTempImageInput(e.target.value)}
                                            onPaste={(e) => {
                                                // Allow default paste, then we can trigger add manually or via button
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddImages();
                                                }
                                            }}
                                            placeholder="https://ejemplo.com/foto1.jpg https://ejemplo.com/foto2.jpg"
                                            className="neu-input flex-1 p-3 rounded-lg text-sm"
                                        />
                                        <NeumorphicButton 
                                            onClick={handleAddImages}
                                            className="px-6 py-2 bg-pink-500 text-white hover:bg-pink-600"
                                            disabled={!tempImageInput}
                                        >
                                            Añadir
                                        </NeumorphicButton>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-gray-700">Galería ({formData.images.length})</label>
                                        {formData.images.length > 0 && (
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData(p => ({...p, images: []}))}
                                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                            >
                                                Borrar Todo
                                            </button>
                                        )}
                                    </div>
                                    
                                    {formData.images.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                                            <p className="text-gray-400 text-sm">No hay imágenes cargadas.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                                                    <img 
                                                        src={img} 
                                                        alt={`Plan image ${idx + 1}`} 
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')} 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveImage(idx)}
                                                            className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                                                            title="Eliminar imagen"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded">
                                                        #{idx + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-[#e0e0e0] border-t border-gray-300 flex justify-end gap-4">
                        <NeumorphicButton onClick={onClose} className="px-6 py-2 text-gray-700">Cancelar</NeumorphicButton>
                        <NeumorphicButton type="submit" className="px-6 py-2 text-white bg-pink-500 hover:bg-pink-600 shadow-md">
                            {plan ? 'Guardar Cambios' : 'Crear Plan'}
                        </NeumorphicButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoriesManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    const [newCategory, setNewCategory] = useState('');

    const addCategory = async () => {
        if (newCategory.trim() && !editedData.categories.includes(newCategory.trim())) {
             // Optional: Immediate DB sync could be done here, but sticking to global save
             // for simplicity of the provided Admin architecture, unless requested.
             // Given Admin Panel structure, we update local state and let user click 'Save'
             setEditedData(prev => ({
                ...prev,
                categories: [...prev.categories, newCategory.trim()]
            }));
            
            // However, inserting a category into 'categories' table often needs immediate action to have an ID
            // But here we are just storing names.
            // Let's do an immediate insert for better UX if possible, or stick to the "Save All" pattern.
            // Sticking to "Save All" pattern implemented in App.tsx -> handleSaveToSupabase which handles categories logic.
            
            // To ensure uniqueness in DB, handleSaveToSupabase needs to be smart.
            // Currently App.tsx doesn't fully sync Categories list deletions, so let's improve App.tsx logic later.
            // For now, update local state.
            
            // Improvement: Immediate insert to avoid complexity in "Save All"
             try {
                const { error } = await supabase.from('categories').insert({ name: newCategory.trim() });
                if (error && error.code !== '23505') throw error; // Ignore duplicate error
             } catch (e) {
                 console.error(e);
             }
             setNewCategory('');
        }
    };

    const removeCategory = async (cat: string) => {
        if (window.confirm(`¿Eliminar categoría "${cat}"?`)) {
             try {
                const { error } = await supabase.from('categories').delete().eq('name', cat);
                if (error) throw error;
                setEditedData(prev => ({
                    ...prev,
                    categories: prev.categories.filter(c => c !== cat)
                }));
             } catch (e) {
                 console.error(e);
                 alert("Error al eliminar categoría (puede estar en uso).");
             }
        }
    };

    return (
         <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-6">Gestionar Categorías</h1>
            <p className="mb-4 text-gray-600">Define las categorías que estarán disponibles al crear nuevos planes.</p>
            
            <NeumorphicCard type="flat" className="p-6 max-w-2xl">
                <div className="flex gap-3 mb-6">
                    <input 
                        type="text" 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)} 
                        placeholder="Nueva categoría..." 
                        className="neu-input flex-1 p-3 rounded-lg"
                        onKeyPress={e => e.key === 'Enter' && addCategory()}
                    />
                    <NeumorphicButton onClick={addCategory} className="px-6 py-2 text-white bg-pink-500">Añadir</NeumorphicButton>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {editedData.categories.map(cat => (
                        <div key={cat} className="neumorphic-convex px-4 py-2 rounded-full flex items-center gap-3 bg-gray-100">
                            <span className="font-semibold text-gray-700">{cat}</span>
                            <button onClick={() => removeCategory(cat)} className="text-red-500 hover:text-red-700 font-bold px-1 rounded hover:bg-red-100 transition-colors">
                                ×
                            </button>
                        </div>
                    ))}
                    {editedData.categories.length === 0 && <p className="text-gray-500 italic">No hay categorías definidas.</p>}
                </div>
            </NeumorphicCard>
        </div>
    );
}

const TestimonialsManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    
    const addTestimonial = () => setEditedData(prev => ({...prev, testimonials: [...prev.testimonials, { id: Date.now(), author: '', text: '', rating: 5 }]}));
    
    const updateTestimonial = (id: number, field: 'author' | 'text' | 'rating', value: any) => {
        setEditedData(prev => ({
            ...prev,
            testimonials: prev.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t)
        }));
    };
    
    const deleteTestimonial = async (id: number) => {
        // Immediate delete from DB
        try {
            await supabase.from('testimonials').delete().eq('id', id);
             setEditedData(prev => ({
                ...prev,
                testimonials: prev.testimonials.filter(t => t.id !== id)
            }));
        } catch (e) {
            console.error(e);
        }
    };
    
    // Save/Upsert happens on "Guardar Cambios" via App.tsx for edits/adds
    
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Gestionar Testimonios</h1>
                <NeumorphicButton onClick={addTestimonial} className="py-2 px-4 text-blue-700">Añadir Testimonio</NeumorphicButton>
            </div>
            <NeumorphicCard type="flat" className="p-4 space-y-4">
                {editedData.testimonials.map(t => (
                    <NeumorphicCard key={t.id} className="p-3 space-y-2">
                        <div className="flex gap-2">
                             <input value={t.author} onChange={e => updateTestimonial(t.id, 'author', e.target.value)} placeholder="Autor" className="neu-input w-2/3 p-2 rounded-lg" />
                             <input type="number" min="1" max="5" value={t.rating} onChange={e => updateTestimonial(t.id, 'rating', parseInt(e.target.value))} placeholder="Rating" className="neu-input w-1/3 p-2 rounded-lg" />
                        </div>
                        <textarea value={t.text} onChange={e => updateTestimonial(t.id, 'text', e.target.value)} placeholder="Texto del testimonio" className="neu-textarea w-full p-2 rounded-lg" />
                        <NeumorphicButton onClick={() => deleteTestimonial(t.id)} className="px-3 py-1 text-xs text-red-700">Eliminar</NeumorphicButton>
                    </NeumorphicCard>
                ))}
            </NeumorphicCard>
        </div>
    );
};

const ContentManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {

    const handleAboutChange = (field: keyof AboutUsContent, value: any) => {
        setEditedData(prev => ({...prev, aboutUs: {...prev.aboutUs, [field]: value}}));
    };

    const handleLegalChange = (field: keyof LegalContent, value: string) => {
         setEditedData(prev => ({...prev, legal: {...prev.legal, [field]: value}}));
    };

    return (
         <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-6">Gestionar Contenido</h1>
            <div className="space-y-6">
                <NeumorphicCard className="p-4">
                    <h2 className="text-2xl font-bold mb-2">Acerca de Nosotros</h2>
                    <label className="font-semibold block mb-1">Misión</label>
                    <textarea value={editedData.aboutUs.mission} onChange={e => handleAboutChange('mission', e.target.value)} className="neu-textarea w-full h-24 p-2 rounded-lg mb-2"/>
                    <label className="font-semibold block mb-1">Visión</label>
                    <textarea value={editedData.aboutUs.vision} onChange={e => handleAboutChange('vision', e.target.value)} className="neu-textarea w-full h-24 p-2 rounded-lg"/>
                </NeumorphicCard>
                <NeumorphicCard className="p-4">
                    <h2 className="text-2xl font-bold mb-2">Contenido Legal</h2>
                    <label className="font-semibold block mb-1">Política General</label>
                    <textarea value={editedData.legal.generalPolicy} onChange={e => handleLegalChange('generalPolicy', e.target.value)} className="neu-textarea w-full h-32 p-2 rounded-lg mb-2"/>
                    <label className="font-semibold block mb-1">Política de Privacidad</label>
                    <textarea value={editedData.legal.privacyPolicy} onChange={e => handleLegalChange('privacyPolicy', e.target.value)} className="neu-textarea w-full h-32 p-2 rounded-lg"/>
                </NeumorphicCard>
            </div>
        </div>
    );
};

const SettingsManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [section, key] = name.split('.');
        
        setEditedData(prev => {
            if (key) { // Nested object like 'contact' or 'social'
                 return { ...prev, [section]: { ...prev[section], [key]: value } };
            } else { // Top-level property like 'logoUrl'
                return { ...prev, [name]: value };
            }
        });
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-6">Ajustes Generales</h1>
            <NeumorphicCard type="flat" className="p-4">
                <div className="space-y-4">
                    <NeumorphicCard className="p-4">
                        <h2 className="text-xl font-bold mb-2">Imágenes</h2>
                        <label className="block mt-2 font-semibold">URL del Logo</label>
                        <input name="logoUrl" value={editedData.logoUrl} onChange={handleChange} className="neu-input w-full p-2 rounded-lg" />
                        <label className="block mt-2 font-semibold">URL Avatar PlaniBot</label>
                        <input name="planibotAvatarUrl" value={editedData.planibotAvatarUrl} onChange={handleChange} className="neu-input w-full p-2 rounded-lg" />
                        <label className="block mt-2 font-semibold">URL Imagen SEO</label>
                        <input name="seoImageUrl" value={editedData.seoImageUrl} onChange={handleChange} className="neu-input w-full p-2 rounded-lg" />
                    </NeumorphicCard>
                    <NeumorphicCard className="p-4">
                        <h2 className="text-xl font-bold mb-2">Información de Contacto</h2>
                        {Object.entries(editedData.contact).map(([key, value]) => (
                            <div key={key}>
                                <label className="block mt-2 font-semibold capitalize">{key}</label>
                                <input name={`contact.${key}`} value={value} onChange={handleChange} className="neu-input w-full p-2 rounded-lg" />
                            </div>
                        ))}
                    </NeumorphicCard>
                     <NeumorphicCard className="p-4">
                        <h2 className="text-xl font-bold mb-2">Redes Sociales</h2>
                         {Object.entries(editedData.social).map(([key, value]) => (
                            <div key={key}>
                                <label className="block mt-2 font-semibold capitalize">{key} URL</label>
                                <input name={`social.${key}`} value={value} onChange={handleChange} className="neu-input w-full p-2 rounded-lg" />
                            </div>
                        ))}
                    </NeumorphicCard>
                </div>
            </NeumorphicCard>
        </div>
    );
};

export default AdminPanel;
