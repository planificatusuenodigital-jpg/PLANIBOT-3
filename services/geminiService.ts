
import { Plan, FAQItem, BotResponse } from '../types';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from "../constants";

// --- TIPOS DE ESTADO Y CONTEXTO ---

type ConversationStep = 
    | 'GREETING'       // Saludo inicial, pide nombre
    | 'ASK_DESTINATION' // Ya tiene nombre, pide destino
    | 'ASK_DATES'      // Ya tiene destino, pide fechas
    | 'ASK_PEOPLE'     // Ya tiene fechas, pide pax
    | 'ASK_BUDGET'     // (Opcional) Pide presupuesto o cierra
    | 'COMPLETED';     // Flujo terminado

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

// --- ESTADO GLOBAL (SIMULADO) ---
let botData: AppDataForBot | null = null;
let isInitialized = false;

// Contexto de la conversación actual (En una app real, esto iría por sesión de usuario)
let context: ConversationContext = {
    step: 'GREETING',
    data: {}
};

// --- BASE DE CONOCIMIENTO (CEREBRO DEL EXPERTO) ---

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

// --- UTILIDADES ---

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const extractName = (input: string): string => {
    // Intenta extraer el nombre de frases como "Soy Juan", "Me llamo Maria", "Mi nombre es Pedro"
    const clean = input.replace(/[¿?!¡.,]/g, ''); // Quitar puntuación
    const words = clean.split(' ');
    
    // Heurística simple: si es una palabra, es el nombre
    if (words.length === 1) return words[0].charAt(0).toUpperCase() + words[0].slice(1);

    const triggers = ["soy", "llamo", "es"];
    for (let i = 0; i < words.length; i++) {
        if (triggers.includes(words[i].toLowerCase()) && i + 1 < words.length) {
            let name = words[i+1];
            if (name.toLowerCase() === "el" || name.toLowerCase() === "la") continue; // Evitar "Soy el..."
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    }
    // Si no encuentra patrón, toma la última palabra si no es muy larga (probablemente el nombre)
    const lastWord = words[words.length - 1];
    if (lastWord.length > 2) return lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
    
    return "Viajero";
};

// --- INICIALIZACIÓN ---

export const startChat = (appData: AppDataForBot) => {
    botData = appData;
    isInitialized = true;
    // Reiniciar contexto al iniciar
    context = { step: 'GREETING', data: {} };
};

export const resetBotContext = () => {
    context = { step: 'GREETING', data: {} };
};

// --- MOTOR DE LÓGICA ---

const processFlow = (input: string): BotResponse => {
    const cleanInput = normalize(input);
    
    // 0. INTERRUPCIONES GLOBALES (Ayuda, Reinicio, Saludos genéricos si ya se saludó)
    if (/(reiniciar|borrar|inicio|empezar de nuevo)/.test(cleanInput)) {
        resetBotContext();
        return { text: "¡Listo! Empecemos de cero. 👋\n\nPara poder asesorarte mejor, cuéntame, **¿con quién tengo el gusto?**" };
    }

    // 1. MAQUINA DE ESTADOS
    switch (context.step) {
        case 'GREETING':
            // Esperamos el nombre
            const name = extractName(input);
            context.data.name = name;
            context.step = 'ASK_DESTINATION';
            return {
                text: `¡Un gusto saludarte, **${name}**! 👋\n\nPara ayudarte a encontrar el viaje perfecto, cuéntame: \n\n🌎 **¿A qué destino sueñas viajar?**\n_(Ej: San Andrés, Cancún, Eje Cafetero, o busco recomendaciones)_`
            };

        case 'ASK_DESTINATION':
            context.data.destination = input; // Guardamos lo que escribió tal cual para naturalidad
            context.step = 'ASK_DATES';
            
            // Detectar si mencionó un lugar conocido para dar un dato curioso
            let funFact = "";
            const knownKey = Object.keys(KNOWLEDGE_BASE).find(k => cleanInput.includes(k));
            if (knownKey) {
                funFact = `\n\n✨ _Excelente elección. ${KNOWLEDGE_BASE[knownKey].description}_`;
            }

            return {
                text: `¡${context.data.destination} suena espectacular! ${funFact}\n\n📅 **¿Para qué fechas tienes planeado tu viaje?**\n_(Ej: En Diciembre, Del 15 al 20 de Octubre, Fechas flexibles)_`
            };

        case 'ASK_DATES':
            context.data.dates = input;
            context.step = 'ASK_PEOPLE';
            return {
                text: "Entendido. 🗓️ Ya casi terminamos.\n\n👨‍👩‍👧‍👦 **¿Cuántas personas viajan contigo?**\n_(Por favor indícame cuántos adultos y si viajan niños con sus edades)_"
            };

        case 'ASK_PEOPLE':
            context.data.people = input;
            context.step = 'COMPLETED'; // Saltamos presupuesto para no ser invasivos, o lo dejamos opcional en el form
            
            // GENERAR ENLACE DE WHATSAPP
            const phone = botData?.contact.phone.replace(/\D/g, '') || "573113653379";
            const message = `👋 Hola Planifica Tu Sueño, soy *${context.data.name}*.\n\nEstoy interesado en viajar a: *${context.data.destination}*.\n🗓️ Fechas: ${context.data.dates}\n👥 Viajeros: ${context.data.people}\n\nQuedo atento a la cotización. ¡Gracias!`;
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            return {
                text: `¡Perfecto, **${context.data.name}**! Ya tengo todos los datos para armar tu plan ideal. 🤩\n\nComo los precios de vuelos y hoteles cambian rápido, un asesor humano necesita verificar disponibilidad en tiempo real.\n\n👇 **Presiona el botón de abajo para enviar tu solicitud a nuestro WhatsApp oficial:**`,
                whatsappLink: waLink
            };

        case 'COMPLETED':
             // Si sigue escribiendo después de completar
             return {
                 text: "¡Ya tengo tus datos! 😊 Si deseas cambiar algo, dime 'reiniciar'. De lo contrario, dale clic al botón de arriba para chatear con un asesor humano en WhatsApp."
             };
    }

    return { text: "Lo siento, me perdí un poco. ¿Podrías repetirme?" };
};


const processLocalResponse = (input: string): BotResponse => {
    if (!botData) return { text: "Error: Cerebro no inicializado." };
    const cleanInput = normalize(input);

    // --- MANEJO DE PREGUNTAS FRECUENTES (INTERRUPCIONES AL FLUJO) ---
    // Si el usuario pregunta algo específico (ubicación, redes, rnt), respondemos y NO avanzamos el flujo de cotización,
    // o recordamos el flujo.

    if (/(ubicacion|direccion|donde estan|oficina)/.test(cleanInput)) {
        return { text: `Estamos ubicados en: **${botData.contact.address}**.` };
    }
    
    if (/(telefono|celular|numero)/.test(cleanInput)) {
        return { text: `Nuestro número es: **${botData.contact.phone}**.` };
    }

    if (/(redes|instagram|facebook)/.test(cleanInput)) {
         return { 
             text: "¡Claro! Síguenos en:\n" +
                   `📷 Instagram: ${botData.social.instagram}\n` +
                   `📘 Facebook: ${botData.social.facebook}`
         };
    }

    // Si no es una pregunta fáctica, procesamos el flujo de ventas
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
