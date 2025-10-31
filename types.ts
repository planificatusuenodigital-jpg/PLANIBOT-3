
export enum Section {
  Inicio,
  Planes,
  Destinos,
  Acerca,
  Contacto,
  Legal,
  FAQ,
}

export type TravelerType = 'Familias' | 'Parejas' | 'Grupos' | 'Negocios' | 'Descanso / Relax' | 'Cultural' | 'Aventura';
export type Regime = 'Todo Incluido' | 'Pensión Completa' | 'Con Desayuno Incluido' | 'Solo Alojamiento' | 'Paquete Promocional';

// New type for tags from the database
export interface Tag {
  id: number;
  name: string;
  category: string; // e.g., 'TravelerType', 'Amenity', 'General'
}

// Updated Destination type to match the database and frontend needs
export interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  image: string;
}

// Updated Plan type to reflect the new database structure
export interface Plan {
  id: number;
  title: string;
  description: string;
  price_text: string;
  price_value: number;
  duration_days: number;
  images: string[];
  includes: string[];
  is_visible: boolean;
  destination_id: number;
  plan_type: 'Paquete Promocional' | 'Hotel' | 'Tour';
  user_id: string | null;
  // Reconstructed properties for frontend use
  destination: Destination;
  tags: Tag[];
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
