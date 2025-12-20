import { Plan, FAQItem, BotResponse, Regime, TravelerType } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from "../constants";
import { GoogleGenAI, Type } from "@google/genai";

// Inicialización del SDK de Gemini siguiendo las reglas de seguridad
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Video ID proporcionado por el usuario (YouTube Short: 3SLzkimnJ0U)
const DEFAULT_VIDEO_ID = "3SLzkimnJ0U"; 
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
    | 'ASK_DESTINATION' 
    | 'ASK_DATES'      
    | 'ASK_PEOPLE'     
    | 'WAITING_VIDEO'     
    | 'COMPLETED';     

interface ConversationContext {
    step: ConversationStep;
    data: {
        name?: string;
        destination?: string;
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

let botData: AppDataForBot | null = null;
let context: ConversationContext = { step: 'GREETING', data: {} };

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const extractName = (input: string): string => {
    const cleanText = input.replace(/[^\w\sÁÉÍÓÚáéíóúñÑ]/g, " ").trim();
    const strongPattern = /(?:me llamo|mi nombre es|yo soy|soy)(?:\s+el|\s+la)?\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i;
    const match = cleanText.match(strongPattern);
    if (match && match[1]) return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const words = cleanText.split(/\s+/);
    const stopWords = new Set(['hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'soy', 'yo', 'el', 'la']);
    const candidates = words.filter(w => !stopWords.has(w.toLowerCase()));
    return candidates.length > 0 ? candidates[0].charAt(0).toUpperCase() + candidates[0].slice(1).toLowerCase() : "Viajero";
};

const getVideoForDestination = (text: string): string => {
    const cleanText = normalize(text);
    for (const [key, id] of Object.entries(DESTINATION_VIDEOS)) {
        if (cleanText.includes(key)) return id;
    }
    return DEFAULT_VIDEO_ID;
};

const findPlansByQuery = (text: string): Plan[] => {
    if (!botData) return [];
    const cleanText = normalize(text);
    return botData.plans.filter(p => 
        p.isVisible && (
            normalize(p.city).includes(cleanText) || 
            normalize(p.country).includes(cleanText) || 
            normalize(p.title).includes(cleanText) ||
            normalize(p.category).includes(cleanText) ||
            cleanText.includes(normalize(p.city))
        )
    );
};

export const startChat = (appData: AppDataForBot) => {
    botData = appData;
};

export const resetBotContext = () => {
    context = { step: 'GREETING', data: {} };
};

const processFlow = (input: string): BotResponse => {
    const cleanInput = normalize(input);
    
    if (input === "REINICIAR_CHAT" || /(reiniciar|empezar de nuevo|borrar todo)/.test(cleanInput)) {
        resetBotContext();
        return { text: "¡Listo! He borrado nuestra memoria. 👋\n\nCuéntame, **¿con quién tengo el gusto?**" };
    }

    if (input === "VER_CATALOGO" || /(ver catalogo|mostrar planes|que destinos tienen|que manejan|lista de planes|todos los planes|donde puedo ir)/.test(cleanInput)) {
        const allVisible = botData?.plans.filter(p => p.isVisible) || [];
        return { 
            text: `¡Claro que sí! Aquí tienes **todos nuestros planes (${allVisible.length} disponibles)**. Desliza para ver las miniaturas y toca la que más te guste para ver los detalles:`,
            recommendedPlans: allVisible
        };
    }

    const searchResults = findPlansByQuery(input);
    if (searchResults.length > 0 && context.step !== 'ASK_DESTINATION' && context.step !== 'GREETING') {
        return {
            text: `¡Excelente elección! Encontré **${searchResults.length} opciones** increíbles para lo que buscas. Aquí puedes verlas en miniatura:`,
            recommendedPlans: searchResults
        };
    }

    switch (context.step) {
        case 'GREETING':
            context.data.name = extractName(input);
            context.step = 'ASK_DESTINATION';
            return { text: `¡Mucho gusto, **${context.data.name}**! 👋\n\nPara ayudarte a planificar el viaje perfecto, cuéntame:\n\n🌎 **¿A qué destino te gustaría viajar?**` };

        case 'ASK_DESTINATION':
            context.data.destination = input;
            const foundPlans = findPlansByQuery(input);
            context.step = 'ASK_DATES';
            
            let respText = `¡Excelente elección! **${context.data.destination}** es un lugar maravilloso. ✈️\n\n📅 **¿En qué fecha tienes pensado viajar?**`;
            if (foundPlans.length > 0) {
                respText = `¡Mira lo que encontré para **${context.data.destination}**! 😍 Estos son nuestros planes disponibles en ese destino. Mientras los revisas, dime:\n\n📅 **¿En qué fecha te gustaría viajar?**`;
            }

            return { 
                text: respText, 
                showDatePicker: true,
                recommendedPlans: foundPlans.length > 0 ? foundPlans : undefined
            };

        case 'ASK_DATES':
            context.data.dates = input;
            context.step = 'ASK_PEOPLE';
            return { text: `¡Perfecto! Registrado para el **${context.data.dates}**. 🗓️\n\n👨‍👩‍👧‍👦 **¿Cuántas personas viajarían contigo?**\n_(Dime cuántos adultos y niños)_` };

        case 'ASK_PEOPLE':
            context.data.people = input;
            context.step = 'WAITING_VIDEO';
            const vidId = getVideoForDestination(context.data.destination || '');
            return { 
                text: "Un momento por favor, estoy verificando la mejor disponibilidad para ti... mientras tanto, disfruta de este breve video (22s) de tu próximo destino.",
                videoId: vidId
            };

        case 'WAITING_VIDEO':
            context.step = 'COMPLETED';
            const phone = botData?.contact.phone.replace(/\D/g, '') || "573113653379";
            const waMsg = `👋 Hola Planifica Tu Sueño, soy *${context.data.name}*.\n\nHe terminado de hablar con PlaniBot y estoy muy interesado en viajar a: *${context.data.destination}*.\n🗓️ Fecha: *${context.data.dates}*\n👥 Viajeros: ${context.data.people}`;
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`;
            
            return {
                text: `¡Gracias por tu paciencia! 🎉 Ya tengo todo listo para tu cotización personalizada.\n\nPresiona el botón de abajo para que un asesor termine de ajustar los detalles contigo por WhatsApp.`,
                whatsappLink: waLink
            };

        case 'COMPLETED':
             return { text: "Si deseas cotizar otro viaje o ver el catálogo de nuevo, escribe 'reiniciar' o 'catálogo'. 😊" };
    }
    return { text: "Lo siento, no logré entender eso. ¿Podrías repetirlo? O si prefieres, pide ver el 'catálogo'." };
};

export const sendMessageToBot = async (message: string): Promise<BotResponse> => {
    if (!botData) return { text: "Error: No se cargaron los datos de la agencia." };
    return new Promise((resolve) => {
        setTimeout(() => resolve(processFlow(message)), 600);
    });
};

export const parseTravelPlanFromText = async (rawText: string): Promise<Partial<Plan>> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analiza la siguiente descripción de un hotel o plan de viaje y extrae la información estructurada en JSON.
        Categorías válidas: Sol y Playa, Rural, Internacional, Caribeño, Aventura, Cultural, Romántico.
        Regímenes válidos: Todo Incluido, Pensión Completa, Con Desayuno Incluido, Solo Alojamiento, Paquete Promocional.
        
        Texto: "${rawText}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    price: { type: Type.STRING },
                    priceValue: { type: Type.NUMBER },
                    durationDays: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                    country: { type: Type.STRING },
                    city: { type: Type.STRING },
                    regime: { type: Type.STRING },
                    includes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    whatsappCatalogUrl: { type: Type.STRING }
                },
                required: ['title', 'category', 'description', 'priceValue']
            }
        }
    });

    try {
        const text = response.text || '{}';
        return JSON.parse(text);
    } catch (error) {
        console.error("Error parsing Gemini travel plan:", error);
        return {};
    }
};