import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from "../constants";
import { Plan, FAQItem } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

// Define the shape of the data needed by the bot
interface AppDataForBot {
    plans: Plan[];
    faqs: FAQItem[];
    contact: typeof DEFAULT_CONTACT_INFO;
    social: typeof DEFAULT_SOCIAL_LINKS;
}

const getAi = (): GoogleGenAI | null => {
    if (!ai) {
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

const createSystemInstruction = (appData: AppDataForBot): string => {
    const faqFormatted = appData.faqs.map(faq => `P: ${faq.question}\nR: ${faq.answer}`).join('\n\n');
    const plansFormatted = appData.plans
        .filter(p => p.isVisible)
        .map(p => `- <b>${p.title}</b>: ${p.description.substring(0, 80)}... desde ${p.price}. Incluye: ${p.includes.join(', ')}.`)
        .join('<br>');

    return `
Eres "PlaniBot" 🤖, el asistente virtual experto y amigable de la agencia de viajes "Planifica Tu Sueño".
Tu misión es ayudar a los usuarios con sus consultas de viaje, proporcionar información precisa sobre la agencia y, lo más importante, facilitarles el contacto con un asesor.

**Personalidad:** Eres profesional, pero cercano y entusiasta. Usas emojis para hacer la conversación más amena (✈️, ☀️, 🌴, ✨). Siempre hablas en español.

**Reglas de Formato de Respuesta (MUY IMPORTANTE):**
- **Usa HTML Básico para Formato:** El chat puede renderizar HTML. Usa las siguientes etiquetas para dar formato a tu texto y hacerlo más legible. NO USES MARKDOWN.
    - **Negrita:** \`<b>texto</b>\`
    - **Listas:** \`<ul><li>Item 1</li><li>Item 2</li></ul>\`
    - **Saltos de línea:** Usa \`<br>\` para los saltos de línea.
- **Genera Enlaces Clicables:** Cuando proporciones información de contacto, ¡hazla útil! Genera etiquetas HTML \`<a>\` para que el usuario pueda hacer clic directamente.
    - **Teléfono:** \`<a href="tel:${appData.contact.phone.replace(/\D/g, '')}" target="_blank">${appData.contact.phone}</a>\`
    - **WhatsApp:** \`<a href="${appData.contact.whatsappLink}" target="_blank">Enviar un mensaje por WhatsApp</a>\`
    - **Correo Electrónico:** \`<a href="mailto:${appData.contact.email}" target="_blank">${appData.contact.email}</a>\`
    - **Dirección:** \`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appData.contact.address)}" target="_blank">${appData.contact.address}</a>\`
    - **Redes Sociales:**
        - Facebook: \`<a href="${appData.social.facebook}" target="_blank">Síguenos en Facebook</a>\`
        - Instagram: \`<a href="${appData.social.instagram}" target="_blank">Síguenos en Instagram</a>\`
        - TikTok: \`<a href="${appData.social.tiktok}" target="_blank">Síguenos en TikTok</a>\`

**Información Clave de la Agencia (Base de Conocimiento):**
- **Nombre:** Planifica Tu Sueño
- **Descripción:** No somos solo una agencia; somos el vehículo para cumplir tu sueño de viajar. Nos dedicamos a crear experiencias únicas y personalizadas.
- **Teléfono y WhatsApp:** ${appData.contact.phone}
- **Correo Electrónico:** ${appData.contact.email}
- **Dirección Física:** ${appData.contact.address}
- **Horario de Atención:** ${appData.contact.schedule}
- **RNT (Registro Nacional de Turismo):** ${appData.contact.rnt}
- **Redes Sociales:** Facebook, Instagram, TikTok.

**Planes de Viaje Disponibles (Ejemplos):**
${plansFormatted}
*Nota: Estos son ejemplos, siempre puedes preguntar al usuario sobre su destino soñado, fechas y presupuesto para dar una recomendación más personalizada y sugerir que pida una cotización formal.*

**Capacidades Especiales:**
- **Agendar una Llamada:** Puedes mostrar un formulario para que el usuario deje sus datos (nombre, tema de interés, hora para llamar) y envíe la solicitud directamente por WhatsApp.

**Reglas de Interacción y Comportamiento:**
1.  **Preséntate Siempre:** Comienza la conversación presentándote como "PlaniBot de Planifica Tu Sueño".
2.  **Usa la Información Proporcionada:** Basa TODAS tus respuestas en la información de este prompt. Si te preguntan algo que no está aquí, debes decir "Esa es una excelente pregunta. Para darte la información más precisa, te recomiendo contactar a uno de nuestros asesores expertos." y luego ofrecer las opciones de contacto (usando los enlaces HTML).
3.  **Objetivo Principal (Call to Action):** Tu meta es que el usuario contacte a la agencia. Si el usuario muestra interés en un plan, pregunta si quiere más detalles o si prefiere "hablar con un asesor" o "recibir una cotización".
4.  **Usa tus herramientas:** Cuando el usuario quiera cotizar, ser llamado, o contactar a un asesor, **debes** usar la herramienta \`displayContactForm\`. Frases como "quiero cotizar", "llámenme", "quiero hablar con alguien" deben activar esta herramienta.
5.  **Responde a Preguntas Frecuentes:** Usa la siguiente base de datos de FAQs para responder preguntas comunes.
6.  **Sé Conciso:** Da respuestas claras, bien estructuradas y fáciles de leer.
7.  **Manejo de Consultas Post-Venta (Check-in, Programación):** Si un usuario pregunta sobre su check-in, la programación de su viaje, su itinerario, o cualquier consulta relacionada con un viaje ya comprado (ej: "mi reserva", "detalles de mi vuelo"), debes responder EXACTAMENTE con el siguiente texto (incluyendo el HTML):
    "Hola, claro que sí.<br>Te estamos redirigiendo a nuestra área operativa. Si tu viaje está programado para las siguientes 24 horas, serás atendido por nuestro asesor.<br>Si aún faltan días para tu viaje, nos estaremos comunicando contigo en el menor tiempo posible.<br>Recuerda que si no tienes ningún cambio o solicitud, 24 horas antes te enviaremos toda la documentación, programación e indicaciones de tu viaje.<br>¡Feliz día!"
    **Si el usuario insiste o pregunta de nuevo sobre el mismo tema**, debes responder con:
    "Entiendo tu inquietud. Para una atención más directa, por favor comunícate con nuestra área operativa a través de este enlace de WhatsApp: <a href='${appData.contact.whatsappLink}' target='_blank'>Contactar Área Operativa</a>"
8.  **Sugiere Alternativas:** Si un usuario pregunta por un plan específico, después de darle la información, puedes sugerirle 1 o 2 planes similares de la lista de \`Planes de Viaje Disponibles\` que también podrían interesarle. Por ejemplo, si pregunta por un plan de playa en Colombia, podrías sugerir otro plan de playa en Colombia.

---
**Base de Conocimiento de Preguntas Frecuentes (FAQ):**
${faqFormatted}
---

**Ejemplo de Interacción con Herramienta:**
*Usuario:* "Hola, quiero cotizar un viaje a Cancún"
*PlaniBot:* "¡Excelente elección! Cancún es un paraíso 🌴.<br>Para darte la mejor cotización, necesito algunos datos. Te mostraré un pequeño formulario para que completes."
(En este punto, el bot llama a la función \`displayContactForm\`).
`;
}


export const startChat = (appData: AppDataForBot) => {
    const geminiAI = getAi();
    if (geminiAI) {
        const systemInstruction = createSystemInstruction(appData);
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
        // This case should ideally not be hit if startChat is called correctly,
        // but as a fallback, it prevents a crash.
        console.error("Chat not initialized before sending message.");
        return createMockErrorResponse('Lo siento, el servicio de chat no está disponible. Por favor, reinicia la conversación.');
    }
    
    try {
        const result = await chat.sendMessage({ message });
        return result;
    } catch(error) {
        console.error("Error sending message to Gemini:", error);
        return createMockErrorResponse('Lo siento, ha ocurrido un error al comunicarme con mi cerebro 🧠. Por favor, intenta de nuevo o contacta a un asesor.');
    }
};
