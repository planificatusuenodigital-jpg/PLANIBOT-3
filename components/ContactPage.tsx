
import React from 'react';
import GlassCard from './GlassCard';
import { CONTACT_INFO } from '../constants';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white drop-shadow-lg">Ponte en Contacto</h1>
        <p className="text-white/80 mt-4 text-lg max-w-2xl mx-auto">
          ¿Listo para tu próxima aventura? Completa el formulario o contáctanos directamente. ¡Estamos aquí para ayudarte!
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <GlassCard className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-white">Envíanos un Mensaje</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="text-white/80">Nombre Completo</label>
              <input type="text" id="name" className="w-full mt-1 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="email" className="text-white/80">Correo Electrónico</label>
              <input type="email" id="email" className="w-full mt-1 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="message" className="text-white/80">Mensaje</label>
              <textarea id="message" rows={4} className="w-full mt-1 bg-white/20 border-none text-white placeholder-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
              Enviar Cotización
            </button>
          </form>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard className="p-8 space-y-4">
            <h3 className="text-2xl font-bold text-white">Información de Contacto</h3>
            <p className="flex items-center gap-3 text-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {CONTACT_INFO.address}
            </p>
            <p className="flex items-center gap-3 text-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              {CONTACT_INFO.phone}
            </p>
            <p className="flex items-center gap-3 text-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.5l7.997 3.384A2 2 0 0019 7.58V15a2 2 0 01-2 2H3a2 2 0 01-2-2V7.58a2 2 0 00.997-1.696zM10 8.5L2 5.116V15h16V5.117L10 8.5z" /></svg>
              {CONTACT_INFO.email}
            </p>
            <p className="flex items-center gap-3 text-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              {CONTACT_INFO.schedule}
            </p>
          </GlassCard>
          <GlassCard className="overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.106666993859!2d-75.7770850852388!3d4.398688496738092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e470877a5617c5d%3A0x6b44a478b0561e12!2sCentro%20Comercial%20La%20Colmena!5e0!3m2!1sen!2sco!4v1678886543210!5m2!1sen!2sco"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Planifica Tu Sueño"
            ></iframe>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
