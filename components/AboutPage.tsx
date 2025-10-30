
import React from 'react';
import GlassCard from './GlassCard';
import { CONTACT_INFO } from '../constants';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white drop-shadow-lg">Nuestra Esencia</h1>
        <p className="text-white/80 mt-4 text-lg">
          Más que una agencia de viajes, somos arquitectos de sueños y creadores de experiencias memorables.
        </p>
      </div>

      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Misión</h2>
        <p className="text-white/80 leading-relaxed">
          Facilitar el acceso a experiencias de viaje únicas y personalizadas que enriquezcan la vida de nuestros clientes, garantizando un servicio de alta calidad, seguridad y confianza en cada etapa del proceso. Nos comprometemos a superar las expectativas a través de una planificación detallada y una atención al cliente excepcional.
        </p>
      </GlassCard>

      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Visión</h2>
        <p className="text-white/80 leading-relaxed">
          Ser la agencia de viajes líder y de mayor confianza en Colombia, reconocida por nuestra innovación, nuestro compromiso con el turismo sostenible y nuestra capacidad para crear itinerarios que no solo muestren la belleza del mundo, sino que también fomenten la conexión humana y el respeto por las diversas culturas.
        </p>
      </GlassCard>

      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Nuestros Valores</h2>
        <ul className="grid sm:grid-cols-2 gap-6 text-white/90">
          <li className="flex items-start gap-3">
            <span className="text-pink-300 mt-1">✔</span>
            <div><strong>Pasión:</strong> Amamos lo que hacemos y transmitimos ese entusiasmo en cada viaje que planificamos.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-300 mt-1">✔</span>
            <div><strong>Integridad:</strong> Actuamos con honestidad y transparencia en todas nuestras interacciones.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-300 mt-1">✔</span>
             <div><strong>Excelencia:</strong> Buscamos la perfección en cada detalle para ofrecer un servicio impecable.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-300 mt-1">✔</span>
            <div><strong>Compromiso:</strong> La satisfacción de nuestros clientes es nuestra máxima prioridad.</div>
          </li>
        </ul>
      </GlassCard>

       <GlassCard className="p-6 text-center">
            <p className="text-white/80">Registro Nacional de Turismo (RNT)</p>
            <p className="text-3xl font-bold text-white tracking-widest">{CONTACT_INFO.rnt}</p>
        </GlassCard>

    </div>
  );
};

export default AboutPage;
