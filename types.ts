
export enum Section {
  Inicio,
  Planes,
  Destinos,
  Acerca,
  Contacto,
  Legal,
  FAQ,
}

// FIX: Added 'Aventura' to the TravelerType to allow its use in travel plans.
export type TravelerType = 'Familias' | 'Parejas' | 'Grupos' | 'Negocios' | 'Descanso / Relax' | 'Cultural' | 'Aventura';
export type Regime = 'Todo Incluido' | 'Pensión Completa' | 'Con Desayuno Incluido' | 'Solo Alojamiento' | 'Paquete Promocional';

export interface Plan {
  id: number;
  title: string;
  category: string;
  price: string;
  priceValue: number;
  durationDays: number;
  description: string;
  images: string[];
  includes: string[];
  isVisible: boolean;
  departureDate: string; // e.g., "2024-10-15"
  returnDate: string; // e.g., "2024-10-20"
  
  // New properties for advanced filtering
  country: string;
  city: string;
  regime: Regime;
  travelerTypes: TravelerType[];
  amenities: string[];
}

export interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: number;
  author: string;
  text: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface AboutUsContent {
  mission: string;
  vision: string;
  foundations: string[];
  principles: { title: string; text: string }[];
  values: { title: string; text: string }[];
}

export interface LegalContent {
    generalPolicy: string;
    privacyPolicy: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}