
import { Plan, FAQItem, BotResponse } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS, REVIEW_MESSAGE, REVIEW_IMAGE_URL } from "../constants";

// --- CONFIGURACIÓN DE VIDEOS Y RECURSOS ---
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

// Estados del Flujo de Conversación
type ConversationStep = 
    | 'GREETING'       
    | 'ASK_DESTINATION'  
    | 'SHOW_OPTIONS'
    | 'ASK_DATES'      
    | 'ASK_PEOPLE'     
    | 'COMPLETED';     

interface ConversationContext {
    step: ConversationStep;
    data: {
        name?: string;
        destination?: string;
        dates?: string;
        people?: string;
        selectedPlanId?: number;
    };
}

interface AppDataForBot {
    plans: Plan[];
    faqs: FAQItem[];
    contact: typeof DEFAULT_CONTACT_INFO;
    social: typeof DEFAULT_SOCIAL_LINKS;
}

// Variables locales del servicio (Singleton simulado)
let botData: AppDataForBot | null = null;
let context: ConversationContext = {
    step: 'GREETING',
    data: {}
};

// --- UTILIDADES ---

// Normaliza texto para comparaciones (quita tildes, minúsculas)
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Extrae nombre del usuario si es posible
const extractName = (input: string): string => {
    const cleanText = input.replace(/[^\w\sÁÉÍÓÚáéíóúñÑ]/g, " ").trim();
    const strongPattern = /(?:me llamo|mi nombre es|yo soy|soy)(?:\s+el|\s+la)?\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i;
    const match = cleanText.match(strongPattern);

    if (match && match[1]) {
        const potentialName = match[1];
        const blackList = ['un', 'una', 'el', 'la', 'tu', 'viajero', 'cliente', 'usuario', 'planifica', 'sueno', 'bot', 'inteligencia', 'interesado', 'hola', 'buenas'];
        if (!blackList.includes(potentialName.toLowerCase())) {
            return potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
        }
    }
    return "Viajero";
};

// Motor de Búsqueda Local
const findBestMatchingPlans = (input: string, plans: Plan[]): Plan[] => {
    const normalizedInput = normalize(input);
    const keywords = normalizedInput.split(' ').filter(w => w.length > 3);

    // Sistema de puntuación simple
    const scoredPlans = plans.map(plan => {
        let score = 0;
        const normalizedTitle = normalize(plan.title);
        const normalizedDesc = normalize(plan.description);
        const normalizedCity = normalize(plan.city);
        const normalizedCountry = normalize(plan.country);
        
        // Coincidencias directas
        if (normalizedInput.includes(normalizedCity)) score += 30;
        if (normalizedInput.includes(normalizedCountry)) score += 20;
        if (normalizedTitle.includes(normalizedInput)) score += 25;

        // Coincidencias parciales por palabras clave
        keywords.forEach(keyword => {
            if (normalizedTitle.includes(keyword)) score += 5;
            if (normalizedCity.includes(keyword)) score += 5;
            if (normalizedDesc.includes(keyword)) score += 2;
            
            // Características especiales
            if (keyword === 'piscina' && plan.amenities.some(a => normalize(a).includes('piscina'))) score += 3;
            if (keyword === 'todo' && input.includes('incluido') && plan.regime === 'Todo Incluido') score += 5;
            if (keyword === 'pareja' && plan.travelerTypes.includes('Parejas')) score += 5;
            if (keyword === 'familia' && plan.travelerTypes.includes('Familias')) score += 5;
        });

        return { plan, score };
    });

    // Filtrar planes relevantes y ordenar
    return scoredPlans
        .filter(item => item.score > 5) // Umbral mínimo
        .sort((a, b) => b.score - a.score)
        .map(item => item.plan)
        .slice(0, 5); // Máximo 5 resultados
};

// Búsqueda en FAQs
const findFAQAnswer = (input: string, faqs: FAQItem[]): string | null => {
    const normalizedInput = normalize(input);
    const keywords = normalizedInput.split(' ').filter(w => w.length > 3);
    
    // Palabras clave específicas para mapeo directo
    if (normalizedInput.includes('rnt') || normalizedInput.includes('registro')) return faqs.find(f => f.question.includes('RNT'))?.answer || null;
    if (normalizedInput.includes('ubicacion') || normalizedInput.includes('donde estan')) return faqs.find(f => f.question.includes('ubicación'))?.answer || null;
    if (normalizedInput.includes('pago') || normalizedInput.includes('pagar')) return "Manejamos diversos métodos de pago. Al cotizar con nuestros asesores te indicarán las cuentas oficiales.";

    // Búsqueda genérica
    for (const faq of faqs) {
        const normQ = normalize(faq.question);
        if (keywords.some(k => normQ.includes(k))) return faq.answer;
    }
    return null;
};

// --- LÓGICA PRINCIPAL DEL BOT ---

export const startChat = (appData: AppDataForBot) => {
    botData = appData;
    context = { step: 'GREETING', data: {} };
};

export const resetBotContext = () => {
    context = { step: 'GREETING', data: {} };
};

export const sendMessageToBot = async (message: string): Promise<BotResponse> => {
    // Simular delay de red para realismo
    return new Promise((resolve) => {
        setTimeout(() => {
            const response = processLogic(message);
            resolve(response);
        }, 500 + Math.random() * 500); 
    });
};

const processLogic = (input: string): BotResponse => {
    if (!botData) return { text: "Estoy inicializando mis sistemas... por favor espera un momento." };
    
    const cleanInput = normalize(input);

    // 1. Comandos Globales
    if (/(reiniciar|borrar|inicio|empezar)/.test(cleanInput)) {
        resetBotContext();
        return { 
            text: "¡Claro! Empecemos de nuevo. 👋\n\nCuéntame, **¿cuál es tu nombre?**",
            videoId: DEFAULT_VIDEO_ID 
        };
    }

    // 2. Respuestas Fácticas Rápidas (FAQs) - Interrumpen el flujo si es una pregunta directa
    const faqAnswer = findFAQAnswer(input, botData.faqs);
    if (faqAnswer && context.step !== 'GREETING') { // Permitir saludos en el primer paso
        return { text: `🤓 **Información:** ${faqAnswer}\n\n¿Te puedo ayudar con algo más sobre tu viaje?` };
    }
    
    // 3. Máquina de Estados
    switch (context.step) {
        case 'GREETING':
            const extractedName = extractName(input);
            if (extractedName !== "Viajero") context.data.name = extractedName;
            
            // Verificar si el usuario ya dio un destino en el saludo (ej: "Hola quiero ir a San Andrés")
            const initialSearch = findBestMatchingPlans(input, botData.plans);
            
            if (initialSearch.length > 0) {
                context.step = 'ASK_DATES';
                context.data.destination = initialSearch[0].city;
                const videoId = DESTINATION_VIDEOS[normalize(initialSearch[0].city)] || DEFAULT_VIDEO_ID;
                
                return {
                    text: `¡Hola ${context.data.name || ''}! 👋 Veo que te interesa **${initialSearch[0].city}**. ¡Excelente elección!\n\nMira estas opciones que tengo para ti:\n\n¿Para qué **fecha** tienes planeado viajar?`,
                    recommendedPlans: initialSearch,
                    videoId: videoId,
                    showDatePicker: true
                };
            }

            context.step = 'ASK_DESTINATION';
            return {
                text: `¡Un gusto saludarte ${context.data.name || ''}! 👋 Soy PlaniBot, tu asistente virtual.\n\nPara ayudarte a encontrar el plan perfecto, cuéntame: **¿Qué destino te gustaría visitar?**\n\n*(Ej: San Andrés, Cartagena, Santa Marta, Eje Cafetero, Cancún...)*`,
                videoId: DEFAULT_VIDEO_ID
            };

        case 'ASK_DESTINATION':
            const foundPlans = findBestMatchingPlans(input, botData.plans);

            if (foundPlans.length > 0) {
                context.data.destination = foundPlans[0].city;
                context.step = 'ASK_DATES';
                
                // Buscar video relacionado
                let videoId = DEFAULT_VIDEO_ID;
                for (const [key, id] of Object.entries(DESTINATION_VIDEOS)) {
                    if (cleanInput.includes(key) || normalize(foundPlans[0].city).includes(key)) {
                        videoId = id;
                        break;
                    }
                }

                return {
                    text: `¡Wow! **${context.data.destination}** es increíble. 🏝️\n\nHe encontrado estos planes que te podrían encantar:\n\nPara verificar disponibilidad, ¿cuál es tu **fecha tentativa de viaje**?`,
                    recommendedPlans: foundPlans,
                    videoId: videoId,
                    showDatePicker: true
                };
            } else {
                // No entendió el destino o no hay planes
                return {
                    text: "Mmm, no estoy seguro de tener planes para ese destino específico en este momento, o quizás no te entendí bien. 🤔\n\n¿Te interesaría ver opciones en **San Andrés, Santa Marta, Cartagena o Cancún**? Escribe el nombre de uno de estos lugares.",
                    videoId: DEFAULT_VIDEO_ID
                };
            }

        case 'ASK_DATES':
            context.data.dates = input;
            context.step = 'ASK_PEOPLE';
            return {
                text: `¡Entendido! 🗓️ Viajar en **${input}** suena genial.\n\nPor último, ¿para cuántas personas sería el viaje? (Adultos y niños).`,
            };

        case 'ASK_PEOPLE':
            context.data.people = input;
            context.step = 'COMPLETED';
            
            const phone = botData.contact.phone.replace(/\D/g, '') || "573113653379";
            const nameMsg = context.data.name ? `, soy *${context.data.name}*` : "";
            const destMsg = context.data.destination ? ` a *${context.data.destination}*` : "";
            
            const message = `👋 Hola Planifica Tu Sueño${nameMsg}.\n\nEstoy chateando con PlaniBot y me interesan los planes${destMsg}.\n🗓️ Fechas: *${context.data.dates}*\n👥 Viajeros: ${context.data.people}\n\nQuedo atento a la cotización formal. ¡Gracias!`;
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            return {
                text: `¡Perfecto! Ya tengo toda la información necesaria. 🎉\n\nUn asesor humano revisará la disponibilidad exacta y te enviará la mejor cotización.\n\n👇 **Haz clic abajo para enviar tu solicitud por WhatsApp:**`,
                whatsappLink: waLink
            };

        case 'COMPLETED':
             return {
                 text: "¡Tu solicitud ya está lista! 😊 Si deseas consultar otro destino, simplemente escribe 'reiniciar'.",
                 whatsappLink: `https://wa.me/${botData.contact.phone.replace(/\D/g, '')}?text=Hola,%20quisiera%20retomar%20mi%20cotización`
             };
            
        default:
            return { text: "Lo siento, me he perdido un poco. ¿Podrías escribir 'reiniciar' para empezar de nuevo?" };
    }
};
