
import React, { useState, useEffect, useRef } from 'react';

interface TextToSpeechButtonProps {
  title: string;
  description: string;
  includes: string[];
  className?: string;
  mini?: boolean; // If true, renders a smaller circular button
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ title, description, includes, className = '', mini = false }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Construct the text to be read naturally
    const textToRead = `Plan: ${title}. ${description}. Este plan incluye: ${includes.join(', ')}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES'; // Spanish
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to select a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.includes('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (mini) {
    return (
      <button
        onClick={handleToggleSpeech}
        className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-pink-500 hover:border-pink-500 transition-all duration-300 flex items-center justify-center shadow-lg ${isSpeaking ? 'animate-pulse bg-pink-600 border-pink-500' : ''} ${className}`}
        title={isSpeaking ? "Detener lectura" : "Escuchar descripción del plan"}
      >
        {isSpeaking ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0117 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleSpeech}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-md ${
        isSpeaking 
          ? 'bg-pink-600 text-white animate-pulse' 
          : 'bg-purple-600/80 hover:bg-purple-700 text-white backdrop-blur-sm'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
          <span>Detener Audio</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0117 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>Escuchar Plan</span>
        </>
      )}
    </button>
  );
};

export default TextToSpeechButton;
