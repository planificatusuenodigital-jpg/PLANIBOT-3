import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini, startChat } from '../services/geminiService';
import { PLANIBOT_AVATAR_URL, CONTACT_INFO } from '../constants';

const PlaniBotAvatar: React.FC<{ className?: string }> = ({ className }) => (
    <img
        src={PLANIBOT_AVATAR_URL}
        alt="PlaniBot Avatar"
        className={`rounded-full object-cover ${className}`}
    />
);

const ContactForm: React.FC<{ onFormSent: () => void }> = ({ onFormSent }) => {
    const [formData, setFormData] = useState({ name: '', topic: '', time: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const phone = CONTACT_INFO.phone.replace(/\D/g, '');
        const message = `¡Hola, Planifica Tu Sueño! ✨\n\nMi nombre es *${formData.name}*.\n\nEstoy interesado/a en: *${formData.topic}*.\n\nMe gustaría que me contactaran alrededor de las *${formData.time}*.\n\n¡Gracias!`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        onFormSent();
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-3 text-white">
            <p className="text-sm text-center font-bold">Completa tus datos para contactarte</p>
            <div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tu Nombre Completo" required className="w-full bg-white/20 border-none placeholder-white/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>
            <div>
                <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="Plan o tema de interés" required className="w-full bg-white/20 border-none placeholder-white/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>
            <div>
                <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="Mejor hora para llamarte" required className="w-full bg-white/20 border-none placeholder-white/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>
            <button type="submit" className="w-full bg-green-500 font-bold py-2 rounded-lg hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.45L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.166l-1.138 4.155 4.274-1.11z" /></svg>
                Enviar por WhatsApp
            </button>
        </form>
    );
};


const PlaniBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  const stopTypingEffect = () => {
    if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        startChat();
        setMessages([
            { role: 'model', text: '¡Hola! 👋 Soy PlaniBot, tu asistente de viajes de Planifica Tu Sueño. ¿En qué destino estás pensando para tu próxima aventura? ✈️' }
        ]);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, showContactForm]);
  
  useEffect(() => {
    return () => stopTypingEffect();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    stopTypingEffect();

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const response = await sendMessageToGemini(currentInput);
        setIsLoading(false);
        const modelResponseText = response.text;
        const functionCalls = response.functionCalls;

        if (modelResponseText) {
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            let i = 0;
            typingIntervalRef.current = window.setInterval(() => {
                if (i < modelResponseText.length) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0) {
                            newMessages[newMessages.length - 1].text += modelResponseText[i];
                        }
                        return newMessages;
                    });
                    scrollToBottom();
                    i++;
                } else {
                    stopTypingEffect();
                    if (functionCalls && functionCalls.some(fc => fc.name === 'displayContactForm')) {
                        setShowContactForm(true);
                    }
                }
            }, 25); // Typing speed in ms
        } else if (functionCalls && functionCalls.some(fc => fc.name === 'displayContactForm')) {
            setShowContactForm(true);
        }

    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.' }]);
    }
  };

  const handleFormSent = () => {
    setShowContactForm(false);
    setMessages(prev => [...prev, { role: 'model', text: '¡Genial! Preparé un mensaje para ti en WhatsApp. Solo tienes que darle a enviar y un asesor se pondrá en contacto contigo pronto. 🚀' }]);
    scrollToBottom();
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300"
        aria-label="Abrir chatbot PlaniBot"
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-40px)] sm:w-96 h-[70vh] max-h-[600px] flex flex-col bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center p-4 border-b border-white/20">
            <PlaniBotAvatar className="w-12 h-12" />
            <div className="ml-3">
              <h3 className="font-bold text-white text-lg">Hola, soy PlaniBot</h3>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto chat-bg">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-pink-500/60 backdrop-blur-sm text-white rounded-br-none' : 'bg-white/20 text-white rounded-bl-none'}`}>
                     <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') + (typingIntervalRef.current && index === messages.length - 1 ? '▋' : '') }}></p>
                  </div>
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                      <div className="max-w-[80%] p-3 rounded-2xl bg-white/20 text-white rounded-bl-none">
                          <div className="flex gap-1.5 items-center">
                              <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-75"></span>
                              <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-150"></span>
                              <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-300"></span>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
          
          {/* Input */}
          <div className="flex-shrink-0 border-t border-white/20">
            {showContactForm ? (
                <ContactForm onFormSent={handleFormSent} />
            ) : (
                <form onSubmit={handleSendMessage} className="p-3">
                    <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-white/20 border-none text-white placeholder-white/60 rounded-full focus:ring-2 focus:ring-pink-400 focus:outline-none py-2 px-4"
                        disabled={isLoading}
                    />
                    <button type="submit" className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-pink-500 text-white/90 hover:bg-pink-600 disabled:opacity-50 disabled:bg-pink-500/50 transition-colors" disabled={isLoading || !input.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                    </div>
                </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .chat-bg {
            background-color: rgba(0,0,0,0.05);
            background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default PlaniBot;