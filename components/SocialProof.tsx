
import React, { useState, useEffect } from 'react';

const messages = [
  "Alguien de Bogotá acaba de cotizar un viaje a San Andrés! 🏝️",
  "¡Una familia de Medellín está planeando su aventura en la Costa Caribeña! ☀️",
  "Un viajero de Cali ha solicitado información sobre Cancún. ✈️",
  "¡Alguien de Pereira está explorando el Eje Cafetero! ☕",
  "Una pareja de Barranquilla acaba de cotizar sus vacaciones soñadas. ✨"
];

const SocialProof: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const showRandomMessage = () => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Hide after 5 seconds
    };

    // Initial delay
    const initialTimeout = setTimeout(showRandomMessage, 8000);
    
    // Interval to show subsequent messages
    const interval = setInterval(showRandomMessage, 20000); // Show every 20 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-4 z-30 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-lg p-3 max-w-[200px] sm:max-w-xs flex items-center gap-2">
        <span className="text-xl">🎉</span>
        <p className="text-[10px] sm:text-xs text-white/90 leading-tight">{message}</p>
      </div>
    </div>
  );
};

export default SocialProof;
