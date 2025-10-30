
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini, startChat } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

const PlaniBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
        startChat();
        setMessages([
            { role: 'model', text: '¡Hola! 👋 Soy PlaniBot, tu asistente de viajes virtual. ¿Cómo puedo ayudarte a planificar tu sueño hoy?' }
        ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const stream = await sendMessageToGemini(input);
        
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', text: '...' }]);

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            modelResponse += chunkText;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde o contacta a nuestro equipo por WhatsApp.' }]);
    } finally {
        setIsLoading(false);
    }
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-40px)] sm:w-96 h-[60vh] flex flex-col bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-white/20">
            <img src="https://picsum.photos/seed/robot/40/40" alt="PlaniBot Avatar" className="w-10 h-10 rounded-full border-2 border-pink-400" />
            <div className="ml-3">
              <h3 className="font-bold text-white">PlaniBot</h3>
              <p className="text-xs text-green-300">En línea</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && <img src="https://picsum.photos/seed/robot/40/40" alt="PlaniBot Avatar" className="w-6 h-6 rounded-full self-start" />}
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-white/20 text-white rounded-bl-none'}`}>
                     <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                  </div>
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                      <img src="https://picsum.photos/seed/robot/40/40" alt="PlaniBot Avatar" className="w-6 h-6 rounded-full self-start" />
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
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
            <div className="flex items-center bg-white/20 rounded-full px-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent border-none text-white placeholder-white/60 focus:ring-0 py-2 px-3"
                disabled={isLoading}
              />
              <button type="submit" className="p-2 text-white/80 hover:text-white disabled:opacity-50" disabled={isLoading || !input.trim()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
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
