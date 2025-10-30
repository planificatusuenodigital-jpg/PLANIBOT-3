
export enum Section {
  Inicio,
  Planes,
  Destinos,
  Acerca,
  Contacto,
  Legal
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
