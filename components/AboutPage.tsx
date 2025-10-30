import React from 'react';
import GlassCard from './GlassCard';
import { CONTACT_INFO, ABOUT_US_CONTENT } from '../constants';

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
          {ABOUT_US_CONTENT.mission}
        </p>
      </GlassCard>

      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Visión</h2>
        <p className="text-white/80 leading-relaxed">
         {ABOUT_US_CONTENT.vision}
        </p>
      </GlassCard>

      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Nuestros Fundamentos</h2>
        <ul className="space-y-3 text-white/90">
            {ABOUT_US_CONTENT.foundations.map((item, index) => (
                 <li key={index} className="flex items-start gap-3">
                    <span className="text-pink-300 mt-1">✦</span>
                    <div>{item}</div>
                </li>
            ))}
        </ul>
      </GlassCard>

      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Nuestros Valores</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-6 text-white/90">
          {ABOUT_US_CONTENT.values.map(value => (
            <div key={value.title}>
              <dt className="font-bold text-pink-200">{value.title}</dt>
              <dd className="text-sm">{value.text}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>

       <GlassCard className="p-6 text-center">
            <p className="text-white/80">Registro Nacional de Turismo (RNT)</p>
            <p className="text-3xl font-bold text-white tracking-widest">{CONTACT_INFO.rnt}</p>
        </GlassCard>

    </div>
  );
};

export default AboutPage;
