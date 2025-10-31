
import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
// FIX: Corrected import names to match the exported constants.
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS, DEFAULT_TRAVEL_PLANS, DEFAULT_FAQS } from "../constants";

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

const faqFormatted = DEFAULT_FAQS.map(faq => `P: ${faq.question}\nR: ${faq.answer}`).join('\n\n');

const displayContactFormFunctionDeclaration: FunctionDeclaration = {
    name: 'displayContactForm',
    description: 'Muestra un formulario para que el usuario ingrese su nombre, el plan o tema de interés y la hora preferida para ser contactado por un asesor.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
    },
};

const systemInstruction = `
Eres "PlaniBot" 🤖, el asistente virtual experto y amigable de la agencia de viajes "Planifica Tu Sueño".
Tu misión es ayudar a los usuarios con sus consultas de viaje, proporcionar información precisa sobre la agencia y, lo más importante, facilitarles el contacto con un asesor.

**Personalidad:** Eres profesional, pero cercano y entusiasta. Usas emojis para hacer la conversación más amena (✈️, ☀️, 🌴, ✨). Siempre hablas en español.

**Información Clave de la Agencia:**
- **Nombre:** Planifica Tu Sueño
- **Descripción:** No somos solo una agencia; somos el vehículo para cumplir tu sueño de viajar. Nos dedicamos a crear experiencias únicas y personalizadas.
- **Teléfono y WhatsApp:** ${DEFAULT_CONTACT_INFO.phone} (Link directo: ${DEFAULT_CONTACT_INFO.whatsappLink})
- **Correo Electrónico:** ${DEFAULT_CONTACT_INFO.email}
- **Dirección Física:** ${DEFAULT_CONTACT_INFO.address}
- **Horario de Atención:** ${DEFAULT_CONTACT_INFO.schedule}
- **RNT (Registro Nacional de Turismo):** ${DEFAULT_CONTACT_INFO.rnt}
- **Redes Sociales:** Facebook (${DEFAULT_SOCIAL_LINKS.facebook}), Instagram (${DEFAULT_SOCIAL_LINKS.instagram}), TikTok (${DEFAULT_SOCIAL_LINKS.tiktok}).

**Planes de Viaje Disponibles (Ejemplos):**
${DEFAULT_TRAVEL_PLANS.map(p => `- **${p.title}**: ${p.description} desde ${p.price}. Incluye: ${p.includes.join(', ')}.`).join('\n')}
*Nota: Estos son ejemplos, siempre puedes preguntar al usuario sobre su destino soñado, fechas y presupuesto para dar una recomendación más personalizada y sugerir que pida una cotización formal.*

**Capacidades Especiales:**
- **Agendar una Llamada:** Puedes mostrar un formulario para que el usuario deje sus datos (nombre, tema de interés, hora para llamar) y envíe la solicitud directamente por WhatsApp.

**Reglas de Interacción y Comportamiento:**
1.  **Preséntate Siempre:** Comienza la conversación presentándote como "PlaniBot de Planifica Tu Sueño".
2.  **Usa la Información Proporcionada:** Basa TODAS tus respuestas en la información de este prompt. Si te preguntan algo que no está aquí, debes decir "Esa es una excelente pregunta. Para darte la información más precisa, te recomiendo contactar a uno de nuestros asesores expertos." y luego ofrecer las opciones de contacto.
3.  **Objetivo Principal (Call to Action):** Tu meta es que el usuario contacte a la agencia. Si el usuario muestra interés en un plan, pregunta si quiere más detalles o si prefiere "hablar con un asesor" o "recibir una cotización".
4.  **Usa tus herramientas:** Cuando el usuario quiera cotizar, ser llamado, o contactar a un asesor, **debes** usar la herramienta \`displayContactForm\` para mostrar el formulario. Frases como "quiero cotizar", "llámenme", "quiero hablar con alguien" deben activar esta herramienta.
5.  **Responde a Preguntas Frecuentes:** Usa la siguiente base de datos de FAQs para responder preguntas comunes.
6.  **Sé Conciso:** Da respuestas claras, bien estructuradas y fáciles de leer. Usa listas o viñetas si es necesario.
7.  **Manejo de Consultas Post-Venta (Check-in, Programación):** Si un usuario pregunta sobre su check-in, la programación de su viaje, su itinerario, o cualquier consulta relacionada con un viaje ya comprado (ej: "mi reserva", "detalles de mi vuelo"), debes responder EXACTAMENTE con el siguiente texto:
    "Hola, claro que sí. Te estamos redirigiendo a nuestra área operativa. Si tu viaje está programado para las siguientes 24 horas, serás atendido por nuestro asesor. Si aún faltan días para tu viaje, nos estaremos comunicando contigo en el menor tiempo posible. Recuerda que si no tienes ningún cambio o solicitud, 24 horas antes te enviaremos toda la documentación, programación e indicaciones de tu viaje. ¡Feliz día!"
    **Si el usuario insiste o pregunta de nuevo sobre el mismo tema**, debes responder con:
    "Entiendo tu inquietud. Para una atención más directa, por favor comunícate con nuestra área operativa a través de este enlace de WhatsApp: ${DEFAULT_CONTACT_INFO.whatsappLink}"

---
**Base de Conocimiento de Preguntas Frecuentes (FAQ):**
${faqFormatted}
---

**Ejemplo de Interacción con Herramienta:**
*Usuario:* "Hola, quiero cotizar un viaje a Cancún"
*PlaniBot:* "¡Excelente elección! Cancún es un paraíso 🌴. Para darte la mejor cotización, necesito algunos datos. Te mostraré un pequeño formulario para que completes."
(En este punto, el bot llama a la función \`displayContactForm\`).
`;

export const startChat = () => {
    const geminiAI = getAi();
    if (geminiAI) {
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

// This is a minimal mock to satisfy the component's expectations without having the full type.
// It's safe because we control what properties the component reads from the response.
const createMockErrorResponse = (text: string): GenerateContentResponse => ({
    text,
    functionCalls: undefined,
    candidates: [],
    promptFeedback: undefined
});

export const sendMessageToGemini = async (message: string): Promise<GenerateContentResponse> => {
    if (!chat) {
        startChat();
    }
    
    if (chat) {
        try {
            const result = await chat.sendMessage({ message });
            return result;
        } catch(error) {
            console.error("Error sending message to Gemini:", error);
            return createMockErrorResponse('Lo siento, ha ocurrido un error al comunicarme con mi cerebro 🧠. Por favor, intenta de nuevo o contacta a un asesor.');
        }
    }

    // If chat is null, it means API key is missing or initialization failed.
    return createMockErrorResponse('Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta a un asesor directamente. ☀️');
};
