

import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { Plan, FAQItem } from "../types";
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from '../constants';
import { supabase } from '../App';


let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAi = (): GoogleGenAI | null => {
    if (!ai) {
        // Robustly check for API key to prevent crashes if process.env is not defined.
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

        if (!apiKey) {
            console.error("API_KEY environment variable not set. PlaniBot functionality will be disabled.");
            return null;
        }
        try {
            ai = new GoogleGenAI({ apiKey });
        } catch (error) {
            console.error("Failed to initialize GoogleGenAI:", error);
            return null;
        }
    }
    return ai;
};

const displayContactFormFunctionDeclaration: FunctionDeclaration = {
    name: 'displayContactForm',
    description: 'Muestra un formulario para que el usuario ingrese su nombre, el plan o tema de interés y la hora preferida para ser contactado por un asesor.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
    },
};

// NEW: Define the structure of the data needed for the system prompt
interface SystemPromptData {
    contact: typeof DEFAULT_CONTACT_INFO;
    social: typeof DEFAULT_SOCIAL_LINKS;
    plans: Plan[];
    faqs: FAQItem[];
}

// Function to build the system instruction dynamically
const buildSystemInstruction = (data: SystemPromptData): string => {
    const faqFormatted = data.faqs.map(faq => `P: ${faq.question}\nR: ${faq.answer}`).join('\n\n');
    const plansFormatted = data.plans.map(p => `- **${p.title}**: ${p.description.substring(0, 100)}... desde ${p.price_text}. Incluye: ${p.includes.join(', ')}.`).join('\n');

    return `
Eres "PlaniBot" 🤖, el asistente virtual experto y amigable de la agencia de viajes "Planifica Tu Sueño".
Tu misión es ayudar a los usuarios con sus consultas de viaje, proporcionar información precisa sobre la agencia y, lo más importante, facilitarles el contacto con un asesor.

**Personalidad:** Eres profesional, pero cercano y entusiasta. Usas emojis para hacer la conversación más amena (✈️, ☀️, 🌴, ✨). Siempre hablas en español.

**Información Clave de la Agencia:**
- **Nombre:** Planifica Tu Sueño
- **Descripción:** No somos solo una agencia; somos el vehículo para cumplir tu sueño de viajar. Nos dedicamos a crear experiencias únicas y personalizadas.
- **Teléfono y WhatsApp:** ${data.contact.phone} (Link directo: ${data.contact.whatsappLink})
- **Correo Electrónico:** ${data.contact.email}
- **Dirección Física:** ${data.contact.address}
- **Horario de Atención:** ${data.contact.schedule}
- **RNT (Registro Nacional de Turismo):** ${data.contact.rnt}
- **Redes Sociales:** Facebook (${data.social.facebook}), Instagram (${data.social.instagram}), TikTok (${data.social.tiktok}).

**Planes de Viaje Disponibles:**
${plansFormatted}
*Nota: Estos son ejemplos, siempre puedes preguntar al usuario sobre su destino soñado, fechas y presupuesto para dar una recomendación más personalizada y sugerir que pida una cotización formal.*

**Capacidades Especiales:**
- **Agendar una Llamada:** Puedes mostrar un formulario para que el usuario deje sus datos (nombre, tema de interés, hora para llamar) y envíe la solicitud directamente por WhatsApp.

**Reglas de Interacción y Comportamiento:**
1.  **Preséntate Siempre:** Comienza la conversación presentándote como "PlaniBot de Planifica Tu Sueño".
2.  **Usa la Información Proporcionada:** Basa TODAS tus respuestas en la información de este prompt. A veces, se te proporcionará un bloque de '--- CONTEXTO ADICIONAL ---' al inicio del mensaje del usuario. **Esa información tiene la máxima prioridad y debes usarla como la fuente de verdad principal para responder.** Si no encuentras la respuesta ni en el contexto ni en tu información base, debes decir "Esa es una excelente pregunta. Para darte la información más precisa, te recomiendo contactar a uno de nuestros asesores expertos." y luego ofrecer las opciones de contacto.
3.  **Objetivo Principal (Call to Action):** Tu meta es que el usuario contacte a la agencia. Si el usuario muestra interés en un plan, pregunta si quiere más detalles o si prefiere "hablar con un asesor" o "recibir una cotización".
4.  **Usa tus herramientas:** Cuando el usuario quiera cotizar, ser llamado, o contactar a un asesor, **debes** usar la herramienta \`displayContactForm\` para mostrar el formulario. Frases como "quiero cotizar", "llámenme", "quiero hablar con alguien" deben activar esta herramienta.
5.  **Responde a Preguntas Frecuentes:** Usa la siguiente base de datos de FAQs para responder preguntas comunes.
6.  **Sé Conciso:** Da respuestas claras, bien estructuradas y fáciles de leer. Usa listas o viñetas si es necesario.
7.  **Manejo de Consultas Post-Venta (Check-in, Programación):** Si un usuario pregunta sobre su check-in, la programación de su viaje, su itinerario, o cualquier consulta relacionada con un viaje ya comprado (ej: "mi reserva", "detalles de mi vuelo"), debes responder EXACTAMENTE con el siguiente texto:
    "Hola, claro que sí. Te estamos redirigiendo a nuestra área operativa. Si tu viaje está programado para las siguientes 24 horas, serás atendido por nuestro asesor. Si aún faltan días para tu viaje, nos estaremos comunicando contigo en el menor tiempo posible. Recuerda que si no tienes ningún cambio o solicitud, 24 horas antes te enviaremos toda la documentación, programación e indicaciones de tu viaje. ¡Feliz día!"
    **Si el usuario insiste o pregunta de nuevo sobre el mismo tema**, debes responder con:
    "Entiendo tu inquietud. Para una atención más directa, por favor comunícate con nuestra área operativa a través de este enlace de WhatsApp: ${data.contact.whatsappLink}"

---
**Base de Conocimiento de Preguntas Frecuentes (FAQ):**
${faqFormatted}
---
`;
}


export const startChat = (data: SystemPromptData) => {
    const geminiAI = getAi();
    if (geminiAI) {
        const systemInstruction = buildSystemInstruction(data);
        chat = geminiAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: [displayContactFormFunctionDeclaration] }],
            },
        });
    } else {
        chat = null;
    }
};

export const isChatInitialized = (): boolean => {
    return chat !== null;
};

const createMockErrorResponse = (text: string): GenerateContentResponse => ({
    text,
    functionCalls: undefined,
    candidates: [],
    promptFeedback: undefined
});

export const sendMessageToGemini = async (message: string): Promise<GenerateContentResponse> => {
    if (!chat) {
        console.warn("Chat not initialized. sendMessageToGemini was called before startChat.");
        return createMockErrorResponse('Lo siento, el chat no se ha iniciado correctamente. Por favor, cierra y vuelve a abrir la ventana del chat.');
    }
    
    if (chat) {
        try {
            // 1. Search the knowledge base in Supabase
            const keywords = message.toLowerCase().split(/\s+/).filter(word => word.length > 3);
            let knowledgeContext = '';

            if (keywords.length > 0) {
                const { data: knowledge, error } = await supabase
                    .from('knowledge_base')
                    .select('answer, topic')
                    .or(`keywords.cs.{${keywords.join(',')}},topic.ilike.%${keywords.join(' ')}%`);

                if (error) {
                    console.warn("Error fetching from knowledge base:", error.message);
                }

                if (knowledge && knowledge.length > 0) {
                    knowledgeContext = '--- CONTEXTO ADICIONAL (USA ESTA INFORMACIÓN COMO FUENTE PRINCIPAL) ---\n' +
                                     knowledge.map(k => `Tema: ${k.topic}\nInformación: ${k.answer}`).join('\n\n') +
                                     '\n--- FIN DEL CONTEXTO ---\n\n';
                }
            }

            // 2. Prepend context to the user's message
            const finalMessage = knowledgeContext + message;

            // 3. Send the combined message to Gemini
            const result = await chat.sendMessage({ message: finalMessage });
            return result;
        } catch(error) {
            console.error("Error sending message to Gemini:", error);
            return createMockErrorResponse('Lo siento, ha ocurrido un error al comunicarme con mi cerebro 🧠. Por favor, intenta de nuevo o contacta a un asesor.');
        }
    }

    // If chat is null, it means API key is missing or initialization failed.
    return createMockErrorResponse('Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta a un asesor directamente. ☀️');
};
