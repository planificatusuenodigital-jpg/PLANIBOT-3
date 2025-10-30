import { Plan, Destination, Testimonial, AboutUsContent, LegalContent, FAQItem } from './types';

export const LOGO_URL = 'https://lh3.googleusercontent.com/pw/AP1GczMVaa2t54xizfCT4x_LuthxbgVvbVait9QQs24AIFmmP11LvYGDQCc64rLNBOLySyjTMcywDRVWC5dm5Qlh5NNm9pOTJYkVQXX9XOHUlLIpOHbE4-5gZOdIICB1sueb_fejAJa5mRmHv-1PNAbqA-U=w991-h991-s-no-gm?authuser=0';
export const PLANIBOT_AVATAR_URL = 'https://lh3.googleusercontent.com/pw/AP1GczN-20Rl_25uHFSXkszlbrLCBXowweXMKM6gxTaAT5SxEiJzHe6w1RzNl3uS9CDqypFK2VJwzZ0FJTKL2B9BsZwJg4yYjms8Xs6DGU6GvzMZ842bWpb6K9sot2XwqJdManGzs9soffeOFZjMlRm6COE=w991-h991-s-no-gm?authuser=0';

export const CONTACT_INFO = {
  phone: "+57 3113653379",
  whatsappLink: "https://wa.me/573113653379",
  email: "planificatusueno12@gmail.com",
  address: "Centro comercial La Colmena, Cra. 4 #13-32, Anserma, Caldas",
  schedule: "Lun-Vie: 8am-12pm y 2pm-5:30pm; Sáb: 8am-1pm",
  rnt: "181495",
};

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/planifica.tusueno/",
  instagram: "https://www.instagram.com/planificatusueno/",
  tiktok: "https://www.tiktok.com/@planificatusueno",
};

export const TRAVEL_PLANS: Plan[] = [
  {
    id: 1,
    title: "San Andrés Mágico",
    category: "Caribeño",
    price: "$1,200,000 COP",
    description: "Disfruta del mar de los siete colores en la paradisíaca isla de San Andrés.",
    image: "https://picsum.photos/seed/sanandres/400/300",
    includes: ["Tiquetes aéreos", "Alojamiento 4 noches", "Alimentación completa", "Tour por la isla"],
  },
  {
    id: 2,
    title: "Aventura en la Costa Caribeña",
    category: "Sol y Playa",
    price: "$950,000 COP",
    description: "Explora las playas de Santa Marta, Cartagena y Barranquilla en un solo viaje.",
    image: "https://picsum.photos/seed/caribe/400/300",
    includes: ["Transporte terrestre", "Alojamiento 5 noches", "Desayunos", "Visita al Parque Tayrona"],
  },
  {
    id: 3,
    title: "Eje Cafetero Encantador",
    category: "Cultural",
    price: "$800,000 COP",
    description: "Sumérgete en la cultura del café, visitando fincas y pueblos pintorescos.",
    image: "https://picsum.photos/seed/eje/400/300",
    includes: ["Transporte", "Alojamiento 3 noches", "Tour del café", "Entrada a parques temáticos"],
  },
  {
    id: 4,
    title: "Escapada a Cancún",
    category: "Internacional",
    price: "$2,500,000 COP",
    description: "Vive la experiencia del Caribe Mexicano con sus playas de arena blanca y aguas turquesas.",
    image: "https://picsum.photos/seed/cancun/400/300",
    includes: ["Tiquetes aéreos", "Hotel todo incluido", "Tours a Chichén Itzá", "Vida nocturna"],
  },
];

export const DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "San Andrés Isla",
    description: "Conocida por su mar de siete colores, es el destino perfecto para el buceo, el snorkel y relajarse en playas de arena blanca. Un paraíso en el Caribe colombiano.",
    image: "https://picsum.photos/seed/dest-sanandres/600/400",
  },
  {
    id: 2,
    name: "Costa Caribeña",
    description: "Desde la histórica Cartagena hasta las playas vírgenes del Parque Tayrona, la costa caribeña ofrece una mezcla inigualable de cultura, historia y belleza natural.",
    image: "https://picsum.photos/seed/dest-caribe/600/400",
  },
  {
    id: 3,
    name: "Eje Cafetero",
    description: "El corazón de la cultura cafetera de Colombia. Paisajes montañosos, pueblos coloridos y el aroma del mejor café del mundo te esperan en esta región única.",
    image: "https://picsum.photos/seed/dest-eje/600/400",
  },
];

export const TESTIMONIALS: Testimonial[] = [
    { id: 1, author: "Ana Pérez", text: "¡El viaje a San Andrés fue increíble! Todo estuvo perfectamente organizado. Gracias a Planifica Tu Sueño por hacer nuestras vacaciones inolvidables." },
    { id: 2, author: "Carlos Gómez", text: "Excelente servicio y atención al detalle. Nos ayudaron a personalizar nuestro tour por el Eje Cafetero y superó todas nuestras expectativas." },
    { id: 3, author: "Lucía Fernández", text: "La mejor agencia de viajes. Son profesionales, amables y siempre están dispuestos a ayudar. ¡Recomendadísimos!" },
];

export const ABOUT_US_CONTENT: AboutUsContent = {
    mission: "Ser el portal profesional de salida (gateway) que facilita la materialización de los sueños de escape vacacional y ocio de la población en el Occidente de Caldas, ofreciendo una gestión de viajes organizada, vibrante y confiable.",
    vision: "Consolidar el liderazgo de reputación en nuestro mercado regional, manteniendo el alto nivel de satisfacción del cliente demostrado por nuestra calificación promedio de 4.9 estrellas sobre 5.0, y proyectar una imagen de marca dinámica, accesible y profesional.",
    foundations: [
        "Adherencia al régimen de responsabilidad establecido por la Ley 300/96 y normativas relacionadas.",
        "Operar como una Agencia de Viajes y Turismo clasificada como Prestadora de Servicios Turísticos (PST), con RNT 181495.",
        "El alto Capital Reputacional (4.9/5.0) y la integración en la economía social local.",
        "La identidad de 'Organización de Sueños' proyectada a través de una estética vibrante y soñadora."
    ],
    principles: [
        { title: "Legalidad", text: "El tratamiento debe sujetarse a la ley y las disposiciones que la desarrollen." },
        { title: "Finalidad", text: "El tratamiento debe obedecer a una finalidad legítima de acuerdo con la Constitución y la Ley." },
        { title: "Libertad", text: "El tratamiento solo puede ejercerse con el consentimiento previo, expreso e informado del titular." },
        { title: "Veracidad o Calidad", text: "La información debe ser veraz, completa, exacta, actualizada, comprobable y comprensible." },
        { title: "Transparencia", text: "Se debe garantizar el derecho del titular a obtener información acerca de la existencia de datos que le conciernan." },
        { title: "Acceso y Circulación Restringida", text: "El tratamiento se sujeta a los límites derivados de la naturaleza de los datos y solo podrá hacerse por personas autorizadas." },
        { title: "Seguridad", text: "La información se deberá manejar con las medidas necesarias para evitar su adulteración, pérdida, consulta o acceso no autorizado." },
        { title: "Confidencialidad", text: "Las personas que intervengan en el tratamiento de datos no públicos están obligadas a garantizar la reserva de la información." }
    ],
    values: [
        { title: "Confianza y Amabilidad", text: "Generada por nuestra alta reputación online y una atención cercana." },
        { title: "Profesionalismo y Seriedad", text: "Reflejado en nuestro conocimiento y atención al detalle." },
        { title: "Dinamismo y Entusiasmo", text: "Transmitido por nuestra energía y la pasión por lo que hacemos." },
        { title: "Organización", text: "Implícito en nuestro nombre, garantizando atención al detalle en la planificación." },
        { title: "Conocimiento Global", text: "Representando nuestra capacidad de ofrecer una amplia variedad de viajes." }
    ]
};

export const LEGAL_CONTENT: LegalContent = {
    generalPolicy: `Planifica tu sueño está sujeta al régimen de responsabilidad que establece la ley 300/96, D.R. 1075/97, Decreto 2438 de 2010 y las normas que los modifiquen, adicionen o reformen. La responsabilidad del organizador del plan o paquete turístico se limita a los términos y condiciones del programa en relación con la prestación y calidad de los servicios. La agencia no asume ninguna responsabilidad frente al usuario por el servicio de transporte aéreo, salvo que se trate de vuelo fletado y de acuerdo con las condiciones del contrato de transporte. Las políticas de reembolso de los servicios no prestados en razón a situaciones de fuerza mayor o caso fortuito, acción u omisión de terceros o del pasajero, no atribuibles a la agencia de viajes, antes o durante el viaje, que puedan ser objeto de devolución, serán definidas por cada operador y las mismas serán confirmadas al usuario una vez se reserven y expidan los documentos de viaje, así como los porcentajes de penalidades o deducciones a que hubiere lugar. En caso de fuerza mayor o caso fortuito antes o durante el viaje (accidentes, huelgas, asonadas, terremotos, factores climáticos, condiciones de seguridad, etc.), o para garantizar el éxito del plan, el operador y/o la agencia podrán modificar, reemplazar o cancelar itinerarios, fechas, vuelos, hoteles, servicios opcionales, lo cual es desde ahora aceptado por el pasajero al momento de adquirir los servicios. El pasajero será el exclusivo responsable de la custodia de su equipaje y documentos de viaje.`,
    privacyPolicy: `Conscientes de la importancia que tiene la protección y el buen manejo de la información personal suministrada, LA AGENCIA DE VIAJES PLANIFICA TU SUEÑO ha diseñado la presente política para hacer un uso adecuado de sus datos personales, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013. Su objetivo es garantizar la reserva de la información y la seguridad sobre el tratamiento que se le dará a la misma a todos los clientes, proveedores, empleados y terceros. El tratamiento de datos personales debe realizarse respetando las normas generales y especiales sobre la materia. Usted tiene derecho a conocer, actualizar, rectificar, consultar sus datos personales, solicitar prueba de la autorización otorgada, ser informado sobre el uso de sus datos, presentar quejas ante la Superintendencia de Industria y Comercio, revocar la autorización y/o solicitar la supresión de algún dato, y acceder en forma gratuita a sus datos personales.`
};

export const FAQS: FAQItem[] = [
    { id: 1, category: "Legal y Operacional", question: "¿Cuál es la ubicación física y el teléfono de contacto?", answer: "Nuestra oficina está en el Centro Comercial La Colmena, Carrera 4 #13-32, Anserma, Caldas. Nuestro teléfono es 311 3653379." },
    { id: 2, category: "Legal y Operacional", question: "¿Cuál es el número del Registro Nacional de Turismo (RNT)?", answer: "Nuestro RNT es el 181495. Estamos clasificados como una Agencia de Viajes y Turismo (PST)." },
    { id: 3, category: "Políticas de Viaje", question: "¿Qué sucede si mi viaje se cancela por fuerza mayor?", answer: "En casos de fuerza mayor (clima, huelgas, etc.), para garantizar el éxito del plan, el operador o la agencia podrán modificar, reemplazar o cancelar itinerarios, fechas, vuelos y hoteles. Estas condiciones son aceptadas al adquirir los servicios." },
    { id: 4, category: "Políticas de Viaje", question: "¿En cuánto tiempo se procesan los reembolsos?", answer: "Los reembolsos, si aplican, se realizarán dentro de los 30 días calendario siguientes a la solicitud. El monto dependerá de las condiciones del proveedor y los gastos de administración." },
    { id: 5, category: "Políticas de Viaje", question: "¿La agencia se encarga del trámite de visas?", answer: "Brindamos la asesoría necesaria, pero el trámite, costos y la decisión final son de exclusiva autonomía de la autoridad consular. En caso de negativa de visa, no habrá lugar a reembolso." },
    { id: 6, category: "Datos Personales", question: "¿Cuáles son mis derechos sobre mis datos personales?", answer: "Usted tiene derecho a conocer, actualizar, rectificar, consultar y solicitar la supresión de sus datos personales, así como revocar la autorización para su tratamiento." },
    { id: 7, category: "Datos Personales", question: "¿Cómo puedo hacer una consulta o reclamo sobre mis datos?", answer: "Puede enviar sus solicitudes al correo electrónico planificatusueno12@gmail.com. Las consultas se atienden en máximo 10 días hábiles y los reclamos en 15 días hábiles." },
];
