
import React, { useState, useEffect } from 'react';
import { Plan, Testimonial, AboutUsContent, LegalContent, FAQItem, Destination, Tag } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from '../constants';
import { supabase } from '../App';

type AppData = {
  plans: Plan[];
  destinations: Destination[];
  tags: Tag[];
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
  onDataChange: () => void; // Callback to refresh data in App.tsx
  onLogout: () => void;
}

interface AdminSubComponentProps {
    appData: AppData;
    onDataChange: () => void;
}

type AdminSection = 'dashboard' | 'plans' | 'destinations' | 'tags' | 'testimonials' | 'content' | 'settings';

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


const AdminPanel: React.FC<AdminPanelProps> = ({ appData, onDataChange, onLogout }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Note: Direct data management will happen in sub-components to keep logic contained.
  // The onDataChange prop will trigger a full refresh from App.tsx after a save.

  const newLogoUrl = "https://lh3.googleusercontent.com/pw/AP1GczOrs6-mkW2-MVNJc6ZYLOnXBo_5I5wqzIdxAK73M2iO9-i_veQAxrgl-l-ijl3tz6dmijK5KG0wuI7z_2WJ4YJLzd6r0MKjhmR6lNGFSFBBC5bAyEBV60o5cH-UGkC1idHPiqRfXxDUE6JFpjHmYEVs=w991-h991-s-no-gm?authuser=0";

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'plans':
        return <PlansManager appData={appData} onDataChange={onDataChange} />;
      // TODO: Implement other managers for destinations, tags, etc.
      case 'testimonials':
      case 'content':
      case 'settings':
      default:
        return <div className="p-8 text-center neumorphic-flat rounded-2xl">
            <h2 className="text-2xl font-bold">Sección en Construcción</h2>
            <p className="text-gray-600 mt-2">Esta área del panel de administración está siendo desarrollada.</p>
        </div>;
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
              <NavButton section="destinations" label="Destinos" />
              <NavButton section="tags" label="Etiquetas (Tags)" />
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


const PlansManager: React.FC<AdminSubComponentProps> = ({ appData, onDataChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const handleDeletePlan = async (planId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este plan? Esto también eliminará sus etiquetas asociadas.')) {
            // First, delete from the join table
            const { error: planTagsError } = await supabase.from('plan_tags').delete().match({ plan_id: planId });
            if (planTagsError) {
                alert('Error al eliminar las etiquetas del plan: ' + planTagsError.message);
                return;
            }

            // Then, delete the plan itself
            const { error: planError } = await supabase.from('plans').delete().match({ id: planId });
             if (planError) {
                alert('Error al eliminar el plan: ' + planError.message);
                return;
            }
            alert('Plan eliminado con éxito.');
            onDataChange();
        }
    };
    
    const handleToggleVisibility = async (plan: Plan) => {
        const { error } = await supabase.from('plans').update({ is_visible: !plan.is_visible }).match({ id: plan.id });
        if (error) {
            alert('Error al cambiar la visibilidad: ' + error.message);
        } else {
            onDataChange();
        }
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
                    {appData.plans.map(plan => (
                        <NeumorphicCard key={plan.id} className="flex flex-col md:flex-row items-center justify-between p-3">
                            <div className="mb-2 md:mb-0">
                                <h3 className="font-bold">{plan.title} <span className={`text-xs font-normal ${plan.is_visible ? 'text-green-600' : 'text-gray-500'}`}>{plan.is_visible ? '(Visible)' : '(Oculto)'}</span></h3>
                                <p className="text-sm text-gray-600">{plan.destination?.name} - {plan.price_text}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <NeumorphicButton onClick={() => handleToggleVisibility(plan)} className={`px-3 py-1 text-xs ${plan.is_visible ? 'text-yellow-700' : 'text-green-700'}`}>
                                    {plan.is_visible ? 'Ocultar' : 'Mostrar'}
                                </NeumorphicButton>
                                <NeumorphicButton onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="px-3 py-1 text-xs text-blue-700">Editar</NeumorphicButton>
                                <NeumorphicButton onClick={() => handleDeletePlan(plan.id)} className="px-3 py-1 text-xs text-red-700">Eliminar</NeumorphicButton>
                            </div>
                        </NeumorphicCard>
                    ))}
                </div>
            </NeumorphicCard>
            {isModalOpen && <PlanFormModal plan={editingPlan} destinations={appData.destinations} tags={appData.tags} onSave={onDataChange} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const PlanFormModal: React.FC<{ plan: Plan | null; destinations: Destination[]; tags: Tag[]; onSave: () => void; onClose: () => void; }> = ({ plan, destinations, tags, onSave, onClose }) => {
    
    type FormData = Omit<Plan, 'id' | 'destination' | 'tags'> & { tag_ids: number[] };

    const [formData, setFormData] = useState<FormData>({
        title: plan?.title || '',
        description: plan?.description || '',
        price_text: plan?.price_text || '',
        price_value: plan?.price_value || 0,
        duration_days: plan?.duration_days || 0,
        images: plan?.images || [],
        includes: plan?.includes || [],
        is_visible: plan?.is_visible ?? true,
        destination_id: plan?.destination_id || 0,
        plan_type: plan?.plan_type || 'Hotel',
        user_id: plan?.user_id || null,
        tag_ids: plan?.tags.map(t => t.id) || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleTagChange = (tagId: number) => {
        setFormData(p => {
            const newTagIds = p.tag_ids.includes(tagId)
                ? p.tag_ids.filter(id => id !== tagId)
                : [...p.tag_ids, tagId];
            return { ...p, tag_ids: newTagIds };
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const planDataToSave = {
            title: formData.title,
            description: formData.description,
            price_text: formData.price_text,
            price_value: Number(formData.price_value),
            duration_days: Number(formData.duration_days),
            images: formData.images,
            includes: formData.includes,
            is_visible: formData.is_visible,
            destination_id: Number(formData.destination_id),
            plan_type: formData.plan_type,
        };

        // Upsert the plan
        const { data: savedPlan, error: planError } = await supabase
            .from('plans')
            .upsert(plan ? { ...planDataToSave, id: plan.id } : planDataToSave)
            .select()
            .single();

        if (planError || !savedPlan) {
            alert('Error al guardar el plan: ' + planError?.message);
            return;
        }

        // --- Manage Tags ---
        // 1. Delete existing tags for this plan
        const { error: deleteError } = await supabase.from('plan_tags').delete().match({ plan_id: savedPlan.id });
        if (deleteError) {
             alert('Error al actualizar las etiquetas (eliminación): ' + deleteError.message);
             return;
        }
        
        // 2. Insert new tags
        if (formData.tag_ids.length > 0) {
            const planTagsToInsert = formData.tag_ids.map(tagId => ({ plan_id: savedPlan.id, tag_id: tagId }));
            const { error: insertError } = await supabase.from('plan_tags').insert(planTagsToInsert);
            if (insertError) {
                 alert('Error al actualizar las etiquetas (inserción): ' + insertError.message);
                 return;
            }
        }
        
        alert('Plan guardado con éxito!');
        onSave();
        onClose();
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
            <NeumorphicCard className="p-6 w-full max-w-2xl text-[var(--admin-text)]" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{plan ? 'Editar' : 'Añadir'} Plan</h2>
                <form onSubmit={handleSubmit} className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Título" className="neu-input w-full p-3 rounded-lg" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input name="price_text" value={formData.price_text} onChange={handleChange} placeholder="Precio (texto)" className="neu-input w-full p-3 rounded-lg" />
                        <input type="number" step="0.01" name="price_value" value={formData.price_value} onChange={handleChange} placeholder="Precio (valor numérico)" className="neu-input w-full p-3 rounded-lg" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                         <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} placeholder="Duración (días)" className="neu-input w-full p-3 rounded-lg" />
                         <select name="destination_id" value={formData.destination_id} onChange={handleChange} className="neu-select w-full p-3 rounded-lg">
                            <option value={0}>Selecciona un Destino</option>
                            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select name="plan_type" value={formData.plan_type} onChange={handleChange} className="neu-select w-full p-3 rounded-lg">
                            <option value="Hotel">Hotel</option>
                            <option value="Paquete Promocional">Paquete Promocional</option>
                             <option value="Tour">Tour</option>
                        </select>
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" className="neu-textarea w-full p-3 rounded-lg" />
                    <textarea name="images" value={Array.isArray(formData.images) ? formData.images.join('\n') : ''} onChange={e => setFormData(p => ({...p, images: e.target.value.split('\n')}))} placeholder="URLs de Imagen (una por línea)" className="neu-textarea w-full h-24 p-3 rounded-lg" />
                    <textarea name="includes" value={Array.isArray(formData.includes) ? formData.includes.join('\n') : ''} onChange={e => setFormData(p => ({...p, includes: e.target.value.split('\n')}))} placeholder="Incluye (un item por línea)" className="neu-textarea w-full h-24 p-3 rounded-lg" />
                     <div>
                        <h4 className="font-semibold mb-2">Etiquetas (Tags)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 neu-input p-3 rounded-lg">
                            {tags.map(tag => (
                                <label key={tag.id} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={formData.tag_ids.includes(tag.id)} onChange={() => handleTagChange(tag.id)} />
                                    {tag.name}
                                </label>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3">
                        <input type="checkbox" id="is_visible" name="is_visible" checked={formData.is_visible} onChange={e => setFormData(p => ({...p, is_visible: e.target.checked}))} className="w-5 h-5" />
                        <label htmlFor="is_visible">Visible en el sitio</label>
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

export default AdminPanel;
