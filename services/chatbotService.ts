import { Plan, FAQItem, BotResponse } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from "../constants";

// --- CONFIGURACIÓN DE RECURSOS ---
const DEFAULT_VIDEO_ID = "i9E_Blai8vk"; 
const DESTINATION_VIDEOS: Record<string, string> = {
    "san andres": "Kj6W5Z5vQz0",
    "cartagena": "8X7Gg4Q5X0A",
    "santa marta": "Vq1_1hZq6Xg",
    "eje cafetero": "Zt2fC0oVq_w",
    "amazonas": "e7bC30sI1Yg",
    "leticia": "e7bC30sI1Yg",
    "cancun": "S-gYtE3GvQ8", 
    "punta cana": "rM2C3w6hJk8", 
    "panama": "5_w1f7y3x8k" 
};

// Estados del Flujo de Conversación (Árbol de decisiones)
type FlowState = 
    | 'MENU_PRINCIPAL'
    | 'BUSCAR_DESTINO'
    | 'SELECCIONAR_DESTINO_ESPECIFICO'
    | 'MOSTRAR_PLANES'
    | 'SELECCIONAR_FECHA'
    | 'SELECCIONAR_PERSONAS'
    | 'CONFIRMAR_WHATSAPP'
    | 'PREGUNTAS_FRECUENTES'
    | 'CONTACTO_ASESOR';

interface ConversationContext {
    state: FlowState;
    data: {
        destination?: string;
        selectedPlanId?: number;
        dates?: string;
        people?: string;
    };
}

interface AppDataForBot {
    plans: Plan[];
    faqs: FAQItem[];
    contact: typeof DEFAULT_CONTACT_INFO;
    social: typeof DEFAULT_SOCIAL_LINKS;
}

// Singleton local para mantener el estado
let botData: AppDataForBot | null = null;
let context: ConversationContext = {
    state: 'MENU_PRINCIPAL',
    data: {}
};

// --- UTILIDADES ---

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const getUniqueCities = (plans: Plan[]): string[] => {
    const cities = plans.map(p => p.city);
    return [...new Set(cities)];
};

const filterPlansByCity = (city: string, plans: Plan[]): Plan[] => {
    return plans.filter(p => normalize(p.city) === normalize(city) && p.isVisible);
};

// --- LÓGICA DEL CHATBOT ---

export const startChat = (appData: AppDataForBot) => {
    botData = appData;
    context = { state: 'MENU_PRINCIPAL', data: {} };
};

export const resetBotContext = () => {
    context = { state: 'MENU_PRINCIPAL', data: {} };
};

export const getInitialGreeting = (): BotResponse => {
    return {
        text: "¡Hola! 👋 Soy tu Asistente Virtual de *Planifica Tu Sueño*.\n\nEstoy aquí para ayudarte a organizar tus próximas vacaciones de forma rápida. ¿Qué deseas hacer hoy?",
        options: ["Ver Planes de Viaje ✈️", "Preguntas Frecuentes ❓", "Hablar con un Asesor 👤"],
        videoId: DEFAULT_VIDEO_ID
    };
};

export const sendMessageToBot = async (message: string): Promise<BotResponse> => {
    // Simulamos un pequeño delay para que se sienta natural, pero rápido (es un bot de reglas)
    return new Promise((resolve) => {
        setTimeout(() => {
            const response = processRuleBasedLogic(message);
            resolve(response);
        }, 600); 
    });
};

const processRuleBasedLogic = (input: string): BotResponse => {
    if (!botData) return { text: "El sistema se está iniciando..." };
    
    const cleanInput = normalize(input);

    // Comandos Globales de Reinicio
    if (cleanInput === 'inicio' || cleanInput === 'menu' || cleanInput === 'reiniciar' || cleanInput === 'volver') {
        resetBotContext();
        return getInitialGreeting();
    }

    // Máquina de Estados
    switch (context.state) {
        case 'MENU_PRINCIPAL':
            if (cleanInput.includes('planes') || cleanInput.includes('viaje')) {
                context.state = 'BUSCAR_DESTINO';
                const cities = getUniqueCities(botData.plans);
                const topCities = cities.slice(0, 5); // Limitamos para UI
                
                return {
                    text: "¡Excelente! Tenemos destinos increíbles. 🌍\n\nSelecciona uno de nuestros destinos populares o escribe el nombre de la ciudad que te interesa:",
                    options: [...topCities, "Ver todos"],
                    videoId: DEFAULT_VIDEO_ID
                };
            } else if (cleanInput.includes('preguntas') || cleanInput.includes('frecuentes')) {
                context.state = 'PREGUNTAS_FRECUENTES';
                const categories = [...new Set(botData.faqs.map(f => f.category))];
                return {
                    text: "Claro, aquí resuelvo tus dudas. Selecciona un tema:",
                    options: [...categories, "Volver al Inicio"]
                };
            } else if (cleanInput.includes('asesor') || cleanInput.includes('hablar') || cleanInput.includes('contacto')) {
                const phone = botData.contact.phone.replace(/\D/g, '');
                return {
                    text: "Si prefieres atención personalizada humana, puedes contactarnos directamente por WhatsApp.",
                    whatsappLink: `https://wa.me/${phone}?text=Hola,%20quisiera%20hablar%20con%20un%20asesor.`,
                    options: ["Volver al Inicio"]
                };
            } else {
                return {
                    text: "No entendí esa opción. Por favor selecciona una de las opciones del menú:",
                    options: ["Ver Planes de Viaje ✈️", "Preguntas Frecuentes ❓", "Hablar con un Asesor 👤"]
                };
            }

        case 'BUSCAR_DESTINO':
            const allCities = getUniqueCities(botData.plans);
            const selectedCity = allCities.find(c => normalize(c) === cleanInput || normalize(c).includes(cleanInput));

            if (selectedCity) {
                context.data.destination = selectedCity;
                context.state = 'MOSTRAR_PLANES';
                const plans = filterPlansByCity(selectedCity, botData.plans);
                const videoId = DESTINATION_VIDEOS[normalize(selectedCity)] || DEFAULT_VIDEO_ID;

                return {
                    text: `¡Gran elección! **${selectedCity}** es un destino maravilloso. 🏝️\n\nAquí tienes los planes disponibles. Revisa los detalles y luego selecciona una fecha:`,
                    recommendedPlans: plans,
                    showDatePicker: true,
                    videoId: videoId,
                };
            } else if (cleanInput === 'ver todos') {
                 return {
                     text: "Nuestros destinos principales son: " + allCities.join(", ") + ".\n\nEscribe el nombre del que te interese.",
                     options: ["Volver al Inicio"]
                 };
            } else {
                return {
                    text: `Lo siento, por ahora no tengo planes registrados con el nombre "${input}". Intenta con uno de estos:`,
                    options: [...allCities.slice(0, 5), "Volver al Inicio"]
                };
            }

        case 'MOSTRAR_PLANES':
            if (input.length > 0) {
                context.data.dates = input;
                context.state = 'SELECCIONAR_PERSONAS';
                return {
                    text: `¡Perfecto! Viajar en **${input}** suena bien.\n\n¿Cuántas personas viajarán?`,
                    options: ["1 Persona", "Pareja (2)", "Familia (3-4)", "Grupo (+5)"]
                };
            }
            return { text: "Por favor selecciona una fecha en el calendario de arriba o escríbela." };

        case 'SELECCIONAR_PERSONAS':
            context.data.people = input;
            context.state = 'CONFIRMAR_WHATSAPP';
            
            const phone = botData.contact.phone.replace(/\D/g, '') || "573113653379";
            const destMsg = context.data.destination ? ` a *${context.data.destination}*` : "";
            
            const message = `👋 Hola, estoy usando el Asistente Virtual.\n\nMe interesan los planes${destMsg}.\n🗓️ Fecha deseada: *${context.data.dates}*\n👥 Viajeros: ${context.data.people}\n\nQuedo atento a la cotización.`;
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            return {
                text: `¡Listo! He recopilado tu información. 🎉\n\nPara recibir la cotización formal y verificar disponibilidad real, envía esta solicitud a nuestro WhatsApp oficial pulsando el botón:`,
                whatsappLink: waLink,
                options: ["Volver al Inicio"]
            };

        case 'PREGUNTAS_FRECUENTES':
            if (botData.faqs.some(f => f.category === input)) {
                const questions = botData.faqs.filter(f => f.category === input).map(f => f.question);
                return {
                    text: `Preguntas sobre **${input}**:`,
                    options: [...questions, "Volver a Categorías"]
                };
            }
            
            const answerItem = botData.faqs.find(f => f.question === input);
            if (answerItem) {
                return {
                    text: `🤓 **${answerItem.question}**\n\n${answerItem.answer}`,
                    options: ["Ver otra pregunta", "Volver a Categorías"]
                };
            }

            if (input === 'ver otra pregunta' || input === 'volver a categorias') {
                 const categories = [...new Set(botData.faqs.map(f => f.category))];
                 return {
                     text: "Claro, selecciona un tema:",
                     options: [...categories, "Volver al Inicio"]
                 };
            }
            
             const categories = [...new Set(botData.faqs.map(f => f.category))];
             return {
                 text: "No entendí tu selección. Por favor elige una categoría:",
                 options: [...categories, "Volver al Inicio"]
             };

        case 'CONFIRMAR_WHATSAPP':
             return {
                 text: "¡Excelente! Si ya confirmaste en WhatsApp, nuestro equipo te atenderá pronto. ¿Deseas consultar algo más?",
                 options: ["Volver al Inicio"]
             };

        default:
            return {
                text: "Lo siento, no entendí. ¿Podrías intentar de nuevo o seleccionar una opción del menú?",
                options: ["Volver al Inicio"]
            };
    }
};