
import React from 'react';
import GlassCard from './GlassCard';

const LegalPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 text-white/90">
        <div className="text-center">
            <h1 className="text-5xl font-black text-white drop-shadow-lg">Políticas y Términos Legales</h1>
            <p className="text-white/80 mt-4 text-lg">
                Tu confianza es nuestra prioridad. Aquí detallamos cómo manejamos tu información.
            </p>
      </div>

      <GlassCard className="p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Política de Privacidad y Tratamiento de Datos Personales</h2>
        <p>
          De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, <strong>Planifica Tu Sueño</strong> informa que los datos personales que usted suministre serán tratados con la finalidad de realizar gestión de clientes, gestión administrativa, prospección comercial, fidelización de clientes, marketing y envío de comunicaciones comerciales.
        </p>
        <p>
          El titular de los datos tiene derecho a conocer, actualizar, rectificar y suprimir su información personal, así como el derecho a revocar el consentimiento otorgado para el tratamiento de datos personales.
        </p>
      </GlassCard>

      <GlassCard className="p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Política General</h2>
        <p>
          En cumplimiento de la Ley 300 de 1996 (Ley General de Turismo) y demás normatividad vigente, <strong>Planifica Tu Sueño</strong> se compromete a promover prácticas de turismo responsable. Rechazamos la explotación sexual comercial de niños, niñas y adolescentes (ESCNNA) y estamos comprometidos con la prevención de este delito.
        </p>
        <p>
          Nuestra agencia opera bajo los más altos estándares de calidad y legalidad, garantizando la satisfacción y seguridad de nuestros viajeros en todos los servicios contratados.
        </p>
      </GlassCard>
    </div>
  );
};

export default LegalPage;
