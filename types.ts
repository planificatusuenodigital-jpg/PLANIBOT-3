export enum Section {
  Inicio,
  Planes,
  Destinos,
  Acerca,
  Contacto,
  Legal,
  FAQ,
}

export interface Plan {
  id: number;
  title: string;
  category: string;
  price: string;
  description: string;
  image: string;
  includes: string[];
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
