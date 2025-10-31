import React, { useState, useEffect } from 'react';
// FIX: Added Regime and TravelerType to imports for use in the PlanFormModal.
import { Plan, Testimonial, AboutUsContent, LegalContent, FAQItem, Regime, TravelerType } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from '../constants';

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
};

interface AdminPanelProps {
  appData: AppData;
  setAppData: (data: AppData) => void;
  onLogout: () => void;
}

interface AdminSubComponentProps {
    editedData: AppData;
    setEditedData: React.Dispatch<React.SetStateAction<AppData>>;
}

type AdminSection = 'dashboard' | 'plans' | 'testimonials' | 'content' | 'settings';

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


const AdminPanel: React.FC<AdminPanelProps> = ({ appData, setAppData, onLogout }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editedData, setEditedData] = useState<AppData>(appData);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(appData) !== JSON.stringify(editedData));
  }, [editedData, appData]);

  const handleSaveChanges = () => {
    if (window.confirm("¿Estás seguro de que quieres guardar todos los cambios?")) {
        setAppData(editedData);
        alert('¡Cambios guardados con éxito!');
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("¿Estás seguro de que quieres descartar todos los cambios no guardados?")) {
        setEditedData(appData);
    }
  };

  const newLogoUrl = "https://lh3.googleusercontent.com/pw/AP1GczOrs6-mkW2-MVNJc6ZYLOnXBo_5I5wqzIdxAK73M2iO9-i_veQAxrgl-l-ijl3tz6dmijK5KG0wuI7z_2WJ4YJLzd6r0MKjhmR6lNGFSFBBC5bAyEBV60o5cH-UGkC1idHPiqRfXxDUE6JFpjHmYEVs=w991-h991-s-no-gm?authuser=0";

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'plans':
        return <PlansManager editedData={editedData} setEditedData={setEditedData} />;
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
      `}</style>
      <div className="admin-panel-body min-h-screen">
        <div className="flex">
          {/* Sidebar */}
          <aside className={`fixed md:relative top-0 left-0 h-full z-20 w-64 p-4 flex-col bg-[var(--admin-bg)] transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}>
            <div className="flex items-center gap-3 mb-8">
              <img src={newLogoUrl} alt="Logo" className="h-12 w-auto" />
              <h1 className="font-bold text-lg">Admin Panel</h1>
            </div>
            <nav className="flex-grow space-y-4">
              <NavButton section="dashboard" label="Dashboard" />
              <NavButton section="plans" label="Planes y Servicios" />
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
                    <p className='font-semibold self-center'>Tienes cambios sin guardar</p>
                    <NeumorphicButton onClick={handleDiscardChanges} className="px-5 py-2 text-gray-700">Descartar</NeumorphicButton>
                    <NeumorphicButton onClick={handleSaveChanges} className="px-5 py-2 text-pink-600 font-bold">Guardar Cambios</NeumorphicButton>
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
                    Desde aquí puedes gestionar todo el contenido de tu sitio web. Usa el menú para navegar entre las diferentes secciones y dar vida a tus planes de viaje.
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
            const newPlan = { ...planToSave, id: Date.now() };
            updatedPlans = [...editedData.plans, newPlan];
        }
        setEditedData({ ...editedData, plans: updatedPlans });
    };

    const handleDeletePlan = (planId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
            const updatedPlans = editedData.plans.filter(p => p.id !== planId);
            setEditedData({ ...editedData, plans: updatedPlans });
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
                <NeumorphicButton onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="py-2 px-4 text-pink-600">
                    Añadir Nuevo Plan
                </NeumorphicButton>
            </div>
             <NeumorphicCard type="flat" className="p-4">
                <div className="space-y-4">
                    {editedData.plans.map(plan => (
                        <NeumorphicCard key={plan.id} className="flex flex-col md:flex-row items-center justify-between p-3">
                            <div className="mb-2 md:mb-0">
                                <h3 className="font-bold">{plan.title} <span className={`text-xs font-normal ${plan.isVisible ? 'text-green-600' : 'text-gray-500'}`}>{plan.isVisible ? '(Visible)' : '(Oculto)'}</span></h3>
                                <p className="text-sm text-gray-600">{plan.category} - {plan.price}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <NeumorphicButton onClick={() => handleToggleVisibility(plan.id)} className={`px-3 py-1 text-xs ${plan.isVisible ? 'text-yellow-700' : 'text-green-700'}`}>
                                    {plan.isVisible ? 'Ocultar' : 'Mostrar'}
                                </NeumorphicButton>
                                <NeumorphicButton onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="px-3 py-1 text-xs text-blue-700">Editar</NeumorphicButton>
                                <NeumorphicButton onClick={() => handleDeletePlan(plan.id)} className="px-3 py-1 text-xs text-red-700">Eliminar</NeumorphicButton>
                            </div>
                        </NeumorphicCard>
                    ))}
                </div>
            </NeumorphicCard>
            {isModalOpen && <PlanFormModal plan={editingPlan} onSave={handleSavePlan} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

// FIX: Corrected the initial state for the form to include all properties of the Plan type.
// Also added form fields for the new properties to prevent data loss on edit.
const PlanFormModal: React.FC<{ plan: Plan | null, onSave: (plan: Plan) => void, onClose: () => void }> = ({ plan, onSave, onClose }) => {
    const [formData, setFormData] = useState<Plan>({
        id: plan?.id || 0,
        title: plan?.title || '',
        category: plan?.category || '',
        price: plan?.price || '',
        priceValue: plan?.priceValue || 0,
        durationDays: plan?.durationDays || 0,
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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleIncludesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({...p, includes: e.target.value.split('\n')}));
    const handleImagesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, images: e.target.value.split('\n').filter(url => url.trim() !== '') }));
    const handleTravelerTypesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({...p, travelerTypes: e.target.value.split('\n').filter(t => t.trim() !== '') as TravelerType[]}));
    const handleAmenitiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, amenities: e.target.value.split('\n').filter(a => a.trim() !== '') }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    const allRegimes: Regime[] = ['Todo Incluido', 'Pensión Completa', 'Con Desayuno Incluido', 'Solo Alojamiento', 'Paquete Promocional'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
            <NeumorphicCard className="p-6 w-full max-w-lg text-[var(--admin-text)]" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{plan ? 'Editar' : 'Añadir'} Plan</h2>
                <form onSubmit={handleSubmit} className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Título" className="neu-input w-full p-3 rounded-lg" required />
                    <input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría" className="neu-input w-full p-3 rounded-lg" />
                    <input name="price" value={formData.price} onChange={handleChange} placeholder="Precio (texto, ej: $1,200,000 COP)" className="neu-input w-full p-3 rounded-lg" />
                    <input type="number" name="priceValue" value={formData.priceValue} onChange={handleChange} placeholder="Precio (valor numérico)" className="neu-input w-full p-3 rounded-lg" />
                    <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} placeholder="Duración (días)" className="neu-input w-full p-3 rounded-lg" />
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs ml-2">Fecha Salida</label>
                            <input type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} className="neu-input w-full p-3 rounded-lg"/>
                        </div>
                        <div>
                            <label className="text-xs ml-2">Fecha Regreso</label>
                            <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} className="neu-input w-full p-3 rounded-lg"/>
                        </div>
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" className="neu-textarea w-full p-3 rounded-lg" />
                    <input name="country" value={formData.country} onChange={handleChange} placeholder="País" className="neu-input w-full p-3 rounded-lg" />
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="Ciudad" className="neu-input w-full p-3 rounded-lg" />
                    <select name="regime" value={formData.regime} onChange={handleChange} className="neu-select w-full p-3 rounded-lg">
                        {allRegimes.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <textarea value={formData.travelerTypes.join('\n')} onChange={handleTravelerTypesChange} placeholder="Tipos de Viajero (uno por línea)" className="neu-textarea w-full h-24 p-3 rounded-lg" />
                    <textarea value={formData.amenities.join('\n')} onChange={handleAmenitiesChange} placeholder="Comodidades (una por línea)" className="neu-textarea w-full h-24 p-3 rounded-lg" />
                    <textarea value={formData.images.join('\n')} onChange={handleImagesChange} placeholder="URLs de Imagen (una por línea)" className="neu-textarea w-full h-24 p-3 rounded-lg" />
                    <textarea value={formData.includes.join('\n')} onChange={handleIncludesChange} placeholder="Incluye (un item por línea)" className="neu-textarea w-full h-24 p-3 rounded-lg" />
                     <div className="flex items-center gap-3 p-3">
                        <input type="checkbox" id="isVisible" name="isVisible" checked={formData.isVisible} onChange={e => setFormData(p => ({...p, isVisible: e.target.checked}))} className="w-5 h-5" />
                        <label htmlFor="isVisible">Visible en el sitio</label>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <NeumorphicButton onClick={onClose} className="px-4 py-2 text-gray-700">Cancelar</NeumorphicButton>
                        <NeumorphicButton type="submit" className="px-4 py-2 text-pink-600">Guardar</NeumorphicButton>
                    </div>
                </form>
            </NeumorphicCard>
        </div>
    );
};


const TestimonialsManager: React.FC<AdminSubComponentProps> = ({ editedData, setEditedData }) => {
    
    const addTestimonial = () => setEditedData(prev => ({...prev, testimonials: [...prev.testimonials, { id: Date.now(), author: '', text: '' }]}));
    
    const updateTestimonial = (id: number, field: 'author' | 'text', value: string) => {
        setEditedData(prev => ({
            ...prev,
            testimonials: prev.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t)
        }));
    };
    
    const deleteTestimonial = (id: number) => {
        setEditedData(prev => ({
            ...prev,
            testimonials: prev.testimonials.filter(t => t.id !== id)
        }));
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Gestionar Testimonios</h1>
                <NeumorphicButton onClick={addTestimonial} className="py-2 px-4 text-blue-700">Añadir Testimonio</NeumorphicButton>
            </div>
            <NeumorphicCard type="flat" className="p-4 space-y-4">
                {editedData.testimonials.map(t => (
                    <NeumorphicCard key={t.id} className="p-3 space-y-2">
                        <input value={t.author} onChange={e => updateTestimonial(t.id, 'author', e.target.value)} placeholder="Autor" className="neu-input w-full p-2 rounded-lg" />
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