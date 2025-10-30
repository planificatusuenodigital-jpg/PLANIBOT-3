
import { Plan, Destination, Testimonial } from './types';

export const CONTACT_INFO = {
  phone: "+57 3113653379",
  whatsappLink: "https://wa.me/573113653379",
  email: "planificatusueno12@gmail.com",
  address: "Centro comercial La Colmena, Cra. 4 #13-32, Anserma, Caldas",
  schedule: "Lun-Vie: 8am-12pm y 2pm-5:30pm; Sáb: 8am-1pm",
  rnt: "181495",
};

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
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
