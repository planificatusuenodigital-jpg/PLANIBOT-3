
import { Plan, FAQItem, BotResponse, Regime, TravelerType } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS, REVIEW_MESSAGE, REVIEW_IMAGE_URL } from "../constants";
import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIGURACIÓN DE VIDEOS ---
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
    | 'ASK_BUDGET'     
    | 'COMPLETED';     

interface ConversationContext {
    step: ConversationStep;
    data: {
        name?: string;
        destination?: string;
        dates?: string;
        people?: string;
        budget?: string;
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

const KNOWLEDGE_BASE: Record<string, { description: string; bestSeason: string; food: string; tips: string }> = {
    "san andres": {
        description: "El mar de los siete colores. Es perfecto para bucear, relajarse en Johnny Cay y darle la vuelta a la isla en mulita.",
        bestSeason: "Enero a abril es ideal (temporada seca), aunque el Caribe es sabroso todo el año.",
        food: "Rondón, cangrejo y limonada de coco.",
        tips: "Usa zapatos de agua y bloqueador biodegradable."
    },
    "cartagena": {
        description: "Historia en la ciudad amurallada, rumba en Getsemaní y playas en Barú.",
        bestSeason: "Diciembre a abril para evitar lluvias.",
        food: "Arepa de huevo, cazuela de mariscos y cocadas.",
        tips: "Camina la ciudad vieja al atardecer."
    },
    "santa marta": {
        description: "Sierra Nevada y mar. El Parque Tayrona es imperdible.",
        bestSeason: "Enero a marzo y junio a agosto.",
        food: "Cayeye y pescado frito.",
        tips: "Vacuna de fiebre amarilla para el Tayrona."
    },
    "eje cafetero": {
        description: "Paisajes verdes, Salento, Valle del Cocora y termales.",
        bestSeason: "Todo el año es templado, evita octubre por lluvias.",
        food: "Bandeja paisa, trucha al ajillo y café.",
        tips: "Lleva abrigo ligero para las noches."
    },
    "amazonas": {
        description: "Conexión con la naturaleza, delfines rosados y selva.",
        bestSeason: "Julio a octubre (playas), Diciembre a mayo (selva inundada).",
        food: "Pescado moqueado y fariña.",
        tips: "Repelente y vacuna de fiebre amarilla obligatoria."
    },
    "cancun": {
        description: "Playas turquesas, cenotes, fiesta y cultura maya.",
        bestSeason: "Noviembre a abril.",
        food: "Tacos y cochinita pibil.",
        tips: "Revisa si tu hotel incluye transporte a Xcaret."
    },
    "punta cana": {
        description: "Resorts todo incluido de lujo y playas infinitas.",
        bestSeason: "Diciembre a abril.",
        food: "Mofongo y Sancocho.",
        tips: "Disfruta del Resort Todo Incluido."
    }
};

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const extractName = (input: string): string => {
    const cleanText = input.replace(/[^\w\sÁÉÍÓÚáéíóúñÑ]/g, " ").trim();
    const strongPattern = /(?:me llamo|mi nombre es|yo soy|soy)(?:\s+el|\s+la)?\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i;
    const match = cleanText.match(strongPattern);

    if (match && match[1]) {
        const potentialName = match[1];
        const blackList = ['un', 'una', 'el', 'la', 'tu', 'viajero', 'cliente', 'usuario', 'planifica', 'sueno', 'bot', 'inteligencia', 'interesado'];
        if (!blackList.includes(potentialName.toLowerCase())) {
            return potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
        }
    }

    const words = cleanText.split(/\s+/);
    const stopWords = new Set([
        'hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'hey', 'hi', 'hello', 'saludos', 'que', 'tal', 'como', 'estas', 'esta', 'estoy',
        'me', 'llamo', 'mi', 'nombre', 'es', 'soy', 'yo', 'el', 'la', 'un', 'una', 'por', 'favor', 'gracias', 'quisiera', 'quiero', 'cotizar',
        'busco', 'informacion', 'info', 'necesito', 'viaje', 'viajar', 'a', 'de', 'para', 'con', 'y', 'o'
    ]);
    const candidates = words.filter(w => !stopWords.has(w.toLowerCase()));
    if (candidates.length > 0) {
        const name = candidates[0];
        if (name.length > 2 && isNaN(Number(name))) {
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        }
    }
    return "Viajero";
};

const getVideoForDestination = (text: string): string => {
    const cleanText = normalize(text);
    for (const [key, id] of Object.entries(DESTINATION_VIDEOS)) {
        if (cleanText.includes(key)) {
            return id;
        }
    }
    return DEFAULT_VIDEO_ID;
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
            text: "¡Listo! Empecemos de cero. 👋\n\nPara poder asesorarte mejor, cuéntame, **¿con quién tengo el gusto?**"
        };
    }

    switch (context.step) {
        case 'GREETING':
            const name = extractName(input);
            context.data.name = name;
            context.step = 'ASK_DESTINATION';
            const greeting = name === "Viajero" 
                ? "¡Un gusto saludarte! 👋" 
                : `¡Un gusto saludarte, **${name}**! 👋`;
            return {
                text: `${greeting}\n\nPara ayudarte a encontrar el viaje perfecto, cuéntame: \n\n🌎 **¿A qué destino sueñas viajar?**\n_(Ej: San Andrés, Cancún, Eje Cafetero, o busco recomendaciones)_`
            };

        case 'ASK_DESTINATION':
             if (/(recomienda|sugiere|no se|cualquier|opciones|destinos)/.test(cleanInput)) {
                 return {
                     text: "¡Claro! 🌴 Si buscas playa, **San Andrés** y **Santa Marta** son joyas del Caribe. Para cultura y relax, **Cartagena** enamora. Y si prefieres naturaleza, el **Eje Cafetero** es mágico.\n\n¿Cuál de estos te llama más la atención?"
                 };
             }
            context.data.destination = input;
            context.step = 'ASK_DATES';
            let funFact = "";
            const knownKey = Object.keys(KNOWLEDGE_BASE).find(k => cleanInput.includes(k));
            if (knownKey) {
                funFact = `\n\n✨ _Excelente elección. ${KNOWLEDGE_BASE[knownKey].description}_`;
            }
            return {
                text: `¡${context.data.destination} suena espectacular! ${funFact}\n\n📅 **¿Para qué fecha tienes planeado tu viaje?**\nPuedes escribirla o seleccionarla aquí abajo:`,
                showDatePicker: true
            };

        case 'ASK_DATES':
            context.data.dates = input;
            context.step = 'ASK_PEOPLE';
            let relevantPlans: Plan[] = [];
            if (botData?.plans && context.data.destination) {
                const destKeywords = context.data.destination.toLowerCase().split(' ');
                relevantPlans = botData.plans.filter(p => {
                    const matchDest = destKeywords.some(keyword => 
                        keyword.length > 3 && (
                            p.title.toLowerCase().includes(keyword) || 
                            p.city.toLowerCase().includes(keyword) ||
                            p.country.toLowerCase().includes(keyword)
                        )
                    );
                    return matchDest && p.isVisible;
                }).slice(0, 5);
            }
            let plansMessage = "";
            if (relevantPlans.length > 0) {
                plansMessage = `\n\n🔎 **He encontrado estos viajes disponibles para tu destino:**`;
            }
            return {
                text: `Entendido, fecha registrada: **${context.data.dates}**. ${plansMessage}\n\n🗓️ Ya casi terminamos.\n\n👨‍👩‍👧‍👦 **¿Cuántas personas viajan contigo?**\n_(Por favor indícame cuántos adultos y si viajan niños con sus edades)_`,
                recommendedPlans: relevantPlans
            };

        case 'ASK_PEOPLE':
            context.data.people = input;
            context.step = 'COMPLETED';
            const phone = botData?.contact.phone.replace(/\D/g, '') || "573113653379";
            const nameForWA = context.data.name === "Viajero" ? "" : `, soy *${context.data.name}*`;
            const message = `👋 Hola Planifica Tu Sueño${nameForWA}.\n\nEstoy interesado en viajar a: *${context.data.destination}*.\n🗓️ Fecha deseada: *${context.data.dates}*\n👥 Viajeros: ${context.data.people}\n\nQuedo atento a la disponibilidad y cotización. ¡Gracias!`;
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            
            const finalVideoId = getVideoForDestination(context.data.destination || "");

            // RETORNAMOS TRANSICIÓN PARA EL VIDEO DE 22 SEGUNDOS
            return {
                text: "Estoy revisando tu consulta mientras puedes ver este video y calificar nuestra agencia. 😊",
                videoId: finalVideoId,
                isTransition: true,
                finalData: {
                    text: `¡Perfecto${context.data.name === "Viajero" ? "" : `, **${context.data.name}**`}! Ya tengo todos los datos para armar tu plan ideal. 🤩\n\nComo los precios de vuelos y hoteles cambian rápido, un asesor humano necesita verificar disponibilidad exacta para la fecha seleccionada.\n\n👇 **Presiona el botón de abajo para enviar tu solicitud a nuestro WhatsApp oficial:**`,
                    whatsappLink: waLink
                }
            };

        case 'COMPLETED':
             return {
                 text: "¡Ya tengo tus datos! 😊 Si deseas cambiar algo, dime 'reiniciar'. De lo contrario, dale clic al botón de arriba para chatear con un asesor humano en WhatsApp."
             };
    }
    return { text: "Lo siento, me perdí un poco. ¿Podrías repetirme?" };
};

const processLocalResponse = (input: string): BotResponse => {
    if (!botData) return { text: "Error: Cerebro no inicializado." };
    const cleanInput = normalize(input);
    if (/(ubicacion|direccion|donde estan|oficina)/.test(cleanInput)) {
        return { text: `Estamos ubicados en: **${botData.contact.address}**.` };
    }
    if (/(telefono|celular|numero)/.test(cleanInput)) {
        return { text: `Nuestro número es: **${botData.contact.phone}**.` };
    }
    if (/(redes|instagram|facebook|tiktok|fotos|confiable|opiniones|estrellas|calificacion|reputacion)/.test(cleanInput)) {
         return { 
             text: REVIEW_MESSAGE,
             image: REVIEW_IMAGE_URL
         };
    }
    return processFlow(input);
};

export const sendMessageToBot = async (message: string): Promise<BotResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const response = processLocalResponse(message);
            resolve(response);
        }, 700 + Math.random() * 800); 
    });
};

export const parseTravelPlanFromText = async (rawText: string): Promise<Partial<Plan>> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert travel agent data entry assistant. Convert the text to JSON. Extract image URLs, WhatsApp links, amenities, and determine category. Raw Text: "${rawText}"`,
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
                        images: { type: Type.ARRAY, items: { type: Type.STRING } },
                        includes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        country: { type: Type.STRING },
                        city: { type: Type.STRING },
                        regime: { type: Type.STRING },
                        travelerTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        whatsappCatalogUrl: { type: Type.STRING },
                        departureDate: { type: Type.STRING },
                        returnDate: { type: Type.STRING },
                    }
                }
            }
        });
        const jsonText = response.text;
        if (!jsonText) throw new Error("No response from AI");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error parsing plan with AI:", error);
        return {};
    }
};
