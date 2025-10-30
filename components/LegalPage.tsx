
import React from 'react';
import GlassCard from './GlassCard';
import { LegalContent } from '../types';

// FIX: Added props to display dynamic legal content.
interface LegalPageProps {
  legalContent: LegalContent;
}

const LegalPage: React.FC<LegalPageProps> = ({ legalContent }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 text-white/90">
        <div className="text-center">
            <h1 className="text-5xl font-black text-white drop-shadow-lg">Políticas y Términos Legales</h1>
            <p className="text-white/80 mt-4 text-lg">
                Tu confianza es nuestra prioridad. Aquí detallamos cómo manejamos tu información.
            </p>
      </div>

      <GlassCard className="p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Política General</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line">
            {legalContent.generalPolicy}
        </p>
      </GlassCard>

      <GlassCard className="p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Política de Privacidad y Tratamiento de Datos Personales</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line">
            {legalContent.privacyPolicy}
        </p>
      </GlassCard>
    </div>
  );
};

export default LegalPage;
