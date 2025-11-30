
import { Plan, FAQItem, BotResponse } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS, REVIEW_MESSAGE, REVIEW_IMAGE_URL } from "../constants";

// --- CONFIGURACIÓN DE VIDEOS ---
const DEFAULT_VIDEO_ID = "i9E_Blai8vk"; 
const DESTINATION_VIDEOS: Record<string, string> = {
    "san andres": "Kj6W5Z5vQz0",
    "cartagena": "8X7Gg4Q5X0A",
    "santa marta": "Vq1_1hZq6Xg",
    "eje cafetero": "Zt2fC0oVq_w",
    "amazonas": "e7bC30sI1Yg",
    "cancun": "S-gYtE3GvQ8", 
    "punta cana": "rM2C3w6hJk8", 
    "panama": "5_w1f7y3x8k" 
};

type ConversationStep = 
    | 'GREETING'       
    | 'OPEN_QUESTION'  // Nuevo estado flexible
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

let botData: AppDataForBot | null = null;
let context: ConversationContext = {
    step: 'GREETING',
    data: {}
};

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const extractName = (input: string): string => {
    const cleanText = input.replace(/[^\w\sÁÉÍÓÚáéíóúñÑ]/g, " ").trim();
    const strongPattern = /(?:me llamo|mi nombre es|yo soy|soy)(?:\s+el|\s+la)?\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i;
    const match = cleanText.match(strongPattern);

    if (match && match[1]) {
        const potentialName = match[1];
        const blackList = ['un', 'una', 'el', 'la', 'tu', 'viajero', 'cliente', 'usuario', 'planifica', 'sueno', 'bot', 'inteligencia', 'interesado', 'hola'];
        if (!blackList.includes(potentialName.toLowerCase())) {
            return potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
        }
    }
    return "Viajero";
};

// Algoritmo de búsqueda inteligente de planes
const findBestMatchingPlans = (input: string, plans: Plan[]): Plan[] => {
    const normalizedInput = normalize(input);
    const keywords = normalizedInput.split(' ').filter(w => w.length > 3);

    // Sistema de puntuación
    const scoredPlans = plans.map(plan => {
        let score = 0;
        const normalizedTitle = normalize(plan.title);
        const normalizedDesc = normalize(plan.description);
        const normalizedCity = normalize(plan.city);
        const normalizedCountry = normalize(plan.country);
        const normalizedAmenities = plan.amenities.map(a => normalize(a));
        const normalizedIncludes = plan.includes.map(i => normalize(i));

        // Coincidencia de destino (Alto valor)
        if (normalizedInput.includes(normalizedCity)) score += 20;
        if (normalizedInput.includes(normalizedCountry)) score += 15;

        // Coincidencia en título
        if (normalizedTitle.includes(normalizedInput)) score += 25;

        // Búsqueda por palabras clave
        keywords.forEach(keyword => {
            if (normalizedTitle.includes(keyword)) score += 5;
            if (normalizedDesc.includes(keyword)) score += 2;
            if (normalizedAmenities.some(a => a.includes(keyword))) score += 4; // Ej: "Piscina", "Wifi"
            if (normalizedIncludes.some(i => i.includes(keyword))) score += 3; // Ej: "Todo incluido"
        });

        // Detectar intenciones específicas
        if ((input.includes('pareja') || input.includes('novios')) && plan.travelerTypes.includes('Parejas')) score += 10;
        if ((input.includes('familia') || input.includes('niños')) && plan.travelerTypes.includes('Familias')) score += 10;
        if (input.includes('barato') || input.includes('economico')) score -= (plan.priceValue / 100000); // Penaliza precio alto levemente

        return { plan, score };
    });

    // Filtrar y ordenar
    return scoredPlans
        .filter(item => item.score > 5) // Umbral mínimo de relevancia
        .sort((a, b) => b.score - a.score)
        .map(item => item.plan)
        .slice(0, 5); // Top 5
};

export const startChat = (appData: AppDataForBot) => {
    botData = appData;
    context = { step: 'GREETING', data: {} };
};

export const resetBotContext = () => {
    context = { step: 'GREETING', data: {} };
};

const processFlow = (input: string): BotResponse => {
    const cleanInput = normalize(input);
    
    if (/(reiniciar|borrar|inicio|empezar de nuevo)/.test(cleanInput)) {
        resetBotContext();
        return { 
            text: "¡Listo! Empecemos de cero. 👋\n\nPara poder asesorarte mejor, cuéntame, **¿con quién tengo el gusto?**",
            videoId: DEFAULT_VIDEO_ID 
        };
    }

    switch (context.step) {
        case 'GREETING':
            const name = extractName(input);
            if (name !== "Viajero") context.data.name = name;
            
            // Si el usuario ya menciona un destino en el saludo (ej: "Hola soy Juan y quiero ir a San Andrés")
            const initialPlans = findBestMatchingPlans(input, botData?.plans || []);
            
            if (initialPlans.length > 0) {
                context.step = 'ASK_DATES'; // Saltamos directo a fechas si ya entendimos qué quiere
                context.data.destination = initialPlans[0].city; // Asumimos el destino del mejor match
                
                const greeting = context.data.name ? `¡Hola ${context.data.name}! ` : "¡Hola! ";
                
                return {
                    text: `${greeting}Veo que te interesa **${context.data.destination}**. ¡Tengo excelentes opciones!\n\nMira estos planes que coinciden con lo que buscas 👇\n\n¿Para qué **fecha** te gustaría viajar?`,
                    recommendedPlans: initialPlans,
                    videoId: DESTINATION_VIDEOS[normalize(initialPlans[0].city)] || DEFAULT_VIDEO_ID,
                    showDatePicker: true
                };
            }

            context.step = 'OPEN_QUESTION';
            const greeting = context.data.name ? `¡Un gusto, **${context.data.name}**! 👋` : "¡Un gusto saludarte! 👋";
            return {
                text: `${greeting}\n\nSoy experto en todos nuestros destinos. Cuéntame, **¿qué tipo de experiencia buscas?**\n\n_(Ej: "Quiero playa en San Andrés", "Un hotel con piscina en Santa Marta", "Algo romántico en Cartagena" o "Aventura en el Amazonas")_`,
                videoId: DEFAULT_VIDEO_ID
            };

        case 'OPEN_QUESTION':
            // Análisis profundo de la intención
            const matchedPlans = findBestMatchingPlans(input, botData?.plans || []);

            if (matchedPlans.length > 0) {
                context.data.destination = matchedPlans[0].city;
                context.step = 'ASK_DATES';
                
                // Determinar video
                let videoId = DEFAULT_VIDEO_ID;
                for (const [key, id] of Object.entries(DESTINATION_VIDEOS)) {
                    if (normalize(input).includes(key) || normalize(matchedPlans[0].city).includes(key)) {
                        videoId = id;
                        break;
                    }
                }

                return {
                    text: `¡Excelente elección! 🤩 Basado en lo que me dices, **estos planes son perfectos para ti**:\n\nPara verificar disponibilidad y darte el mejor precio, ¿tienes una **fecha tentativa** para tu viaje?`,
                    recommendedPlans: matchedPlans,
                    videoId: videoId,
                    showDatePicker: true
                };
            } else {
                // No se encontró nada específico, respuesta genérica pero útil
                return {
                    text: "Mmm, suena interesante pero necesito un poco más de detalle para encontrar el plan perfecto. 🤔\n\n¿Tienes algún destino en mente como **San Andrés, Santa Marta, Cartagena o Cancún**? ¿O prefieres que te recomiende algo según tu presupuesto?",
                    videoId: DEFAULT_VIDEO_ID
                };
            }

        case 'ASK_DATES':
            context.data.dates = input;
            context.step = 'ASK_PEOPLE';
            return {
                text: `¡Anotado! 🗓️ Viajar en **${input}** es una gran idea.\n\nPor último, cuéntame **¿cuántas personas viajarían?** (Adultos y niños). Así podré calcular el presupuesto exacto.`,
            };

        case 'ASK_PEOPLE':
            context.data.people = input;
            context.step = 'COMPLETED';
            
            const phone = botData?.contact.phone.replace(/\D/g, '') || "573113653379";
            const nameMsg = context.data.name ? `, soy *${context.data.name}*` : "";
            const destMsg = context.data.destination ? ` a *${context.data.destination}*` : "";
            
            const message = `👋 Hola Planifica Tu Sueño${nameMsg}.\n\nEstoy chateando con PlaniBot y me interesan los planes${destMsg}.\n🗓️ Fechas: *${context.data.dates}*\n👥 Viajeros: ${context.data.people}\n\nQuedo atento a la cotización formal. ¡Gracias!`;
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            return {
                text: `¡Perfecto! Ya tengo toda la información. 🎉\n\nUn asesor humano revisará la disponibilidad real para esas fechas y te enviará la cotización oficial.\n\n👇 **Da clic abajo para finalizar tu solicitud en WhatsApp:**`,
                whatsappLink: waLink
            };

        case 'COMPLETED':
             return {
                 text: "¡Ya tenemos tus datos! 😊 Si quieres consultar otro destino, escribe 'reiniciar'.",
                 whatsappLink: `https://wa.me/${botData?.contact.phone.replace(/\D/g, '')}?text=Hola,%20quisiera%20retomar%20mi%20cotización`
             };
    }

    return { text: "¿Podrías repetirme eso? Estoy aprendiendo y a veces me confundo. 😅" };
};

const processLocalResponse = (input: string): BotResponse => {
    if (!botData) return { text: "Error: Cerebro no inicializado." };
    const cleanInput = normalize(input);

    // Respuestas Fácticas Rápidas
    if (/(ubicacion|direccion|donde estan|oficina)/.test(cleanInput)) return { text: `Estamos en: **${botData.contact.address}**.` };
    if (/(telefono|celular|numero|whatsapp)/.test(cleanInput)) return { text: `Contáctanos al: **${botData.contact.phone}**.` };
    if (/(redes|instagram|facebook|fotos|confiable)/.test(cleanInput)) return { text: REVIEW_MESSAGE, image: REVIEW_IMAGE_URL };

    return processFlow(input);
};

export const sendMessageToBot = async (message: string): Promise<BotResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const response = processLocalResponse(message);
            resolve(response);
        }, 600 + Math.random() * 600); 
    });
};
