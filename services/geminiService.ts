
import { GoogleGenAI, Chat } from "@google/genai";
import { CONTACT_INFO, SOCIAL_LINKS, TRAVEL_PLANS } from "../constants";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const systemInstruction = `
Eres "PlaniBot", el asistente virtual de la agencia de viajes "Planifica Tu Sueño". Eres amigable, servicial y experto en viajes.
Tu objetivo principal es ayudar a los usuarios a encontrar información sobre la agencia y sus planes, y guiarlos para que coticen un viaje.
Debes usar la siguiente información para responder:
- **Agencia:** Planifica Tu Sueño
- **Teléfono/WhatsApp:** ${CONTACT_INFO.phone}
- **Correo:** ${CONTACT_INFO.email}
- **Dirección:** ${CONTACT_INFO.address}
- **Horario:** ${CONTACT_INFO.schedule}
- **Redes Sociales:** Facebook (${SOCIAL_LINKS.facebook}), Instagram (${SOCIAL_LINKS.instagram}), TikTok (${SOCIAL_LINKS.tiktok}).
- **RNT (Registro Nacional de Turismo):** ${CONTACT_INFO.rnt}

**Planes de Viaje Disponibles:**
${TRAVEL_PLANS.map(p => `- ${p.title}: ${p.description} por ${p.price}. Incluye: ${p.includes.join(', ')}.`).join('\n')}

**Reglas de Interacción:**
1. Siempre preséntate como PlaniBot de Planifica Tu Sueño.
2. Sé siempre cortés y profesional. Usa emojis para ser más amigable. 🏖️✈️☀️
3. Si no sabes una respuesta, dirige al usuario a los canales de contacto directo (WhatsApp o correo). No inventes información.
4. Anima a los usuarios a visitar la sección de "Contacto" o "Planes" del sitio web para más detalles.
5. Mantén tus respuestas concisas y fáciles de leer.
6. Habla en español.
`;


export const startChat = () => {
    const geminiAI = getAi();
    chat = geminiAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
};

export const sendMessageToGemini = async (message: string) => {
    if (!chat) {
        startChat();
    }
    if (chat) {
        const result = await chat.sendMessageStream({ message });
        return result;
    }
    throw new Error("Chat not initialized");
};
