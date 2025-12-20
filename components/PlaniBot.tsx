import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Plan, FAQItem } from '../types';
import { sendMessageToBot, startChat, resetBotContext } from '../services/geminiService';
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from '../constants';

const PlaniBotAvatar: React.FC<{ className?: string, planibotAvatarUrl: string }> = ({ className, planibotAvatarUrl }) => (
    <div className={`relative ${className}`}>
        <img
            src={planibotAvatarUrl}
            alt="PlaniBot Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-green-400 shadow-sm"
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
);

const PlanMiniCard: React.FC<{ plan: Plan; onClick: () => void }> = ({ plan, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 w-44 sm:w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg group snap-center">
        <div className="h-24 sm:h-28 w-full overflow-hidden relative">
            <img src={plan.images[0]} alt={plan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <span className="absolute bottom-1.5 left-2 text-[9px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">{plan.category}</span>
        </div>
        <div className="p-2.5">
            <h4 className="text-white font-bold text-xs sm:text-sm truncate">{plan.title}</h4>
            <p className="text-white/70 text-[10px] truncate">{plan.city}</p>
            <p className="text-pink-300 font-black text-[10px] sm:text-xs mt-1">{plan.price}</p>
        </div>
    </div>
);

const StarRating: React.FC<{ onRate: (stars: number) => void }> = ({ onRate }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-2 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onRate(star)}
                    className="transition-transform active:scale-125 focus:outline-none"
                >
                    <svg 
                        className={`w-8 h-8 ${star <= (hovered || 0) ? 'text-yellow-300' : 'text-white/30'} drop-shadow-md transition-colors`} 
                        fill="currentColor" viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const WhatsappSummaryButton: React.FC<{ link: string }> = ({ link }) => (
    <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 transform active:scale-95 animate-fade-in-up border border-green-400"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338-11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.45L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.166l-1.138 4.155 4.274-1.11z" /></svg>
        <span>Solicitar vía WhatsApp</span>
    </a>
);

const ChatDatePicker: React.FC<{ onDateSelect: (date: string) => void }> = ({ onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const handleConfirm = () => { if (selectedDate) onDateSelect(selectedDate); };
    return (
        <div className="mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 w-full max-w-xs shadow-lg animate-fade-in-up">
            <label className="block text-white text-[10px] font-bold mb-2 uppercase tracking-widest">Selecciona tu fecha</label>
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/80 text-gray-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-3 text-sm font-medium"
            />
            <button onClick={handleConfirm} disabled={!selectedDate} className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-md">Confirmar</button>
        </div>
    );
};

interface PlaniBotProps {
    planibotAvatarUrl: string;
    contactInfo: typeof DEFAULT_CONTACT_INFO;
    socialLinks: typeof DEFAULT_SOCIAL_LINKS;
    travelPlans: Plan[];
    faqs: FAQItem[];
    onOpenPlan: (plan: Plan) => void;
}

const PlaniBot: React.FC<PlaniBotProps> = ({ planibotAvatarUrl, contactInfo, socialLinks, travelPlans, faqs, onOpenPlan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState(""); 
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isRated, setIsRated] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  const stopTypingEffect = () => {
    if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
  };

  const cleanTextForSpeech = (text: string) => {
    let cleaned = text.replace(/[*_~`#]/g, '');
    cleaned = cleaned.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  };

  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) {
        if (onEndCallback) onEndCallback();
        return;
    }
    window.speechSynthesis.cancel();
    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
        if (onEndCallback) onEndCallback();
        return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;
    utterance.onend = () => { if (onEndCallback) onEndCallback(); };
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e: React.FormEvent | null, forcedInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    stopTypingEffect();
    window.speechSynthesis.cancel();

    const isControlCmd = ["CONTINUAR_FLUJO_POST_VIDEO", "VER_CATALOGO", "REINICIAR_CHAT"].includes(textToSend);

    if (!isControlCmd) {
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInput('');
    }
    
    setIsLoading(true);

    try {
        const response = await sendMessageToBot(textToSend);
        setIsLoading(false);
        
        const { text, videoId, whatsappLink, recommendedPlans, showDatePicker } = response;

        setMessages(prev => [...prev, { 
            role: 'model', 
            text: '', 
            recommendedPlans,
            whatsappSummaryLink: whatsappLink,
            showDatePicker
        }]);

        if (videoId) {
            setCurrentVideoId(videoId);
            speakText(text, () => {
                setIsRated(false);
                setIsVideoVisible(true);
            });
        } else {
            speakText(text);
        }

        let i = 0;
        typingIntervalRef.current = window.setInterval(() => {
            if (i < text.length) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0) newMessages[newMessages.length - 1].text += text[i];
                    return newMessages;
                });
                i++;
                scrollToBottom();
            } else {
                stopTypingEffect();
            }
        }, 15);

    } catch (error) {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, tuve un error técnico. 😵 ¿Podemos intentar de nuevo?' }]);
    }
  };

  const handleRestart = () => {
      stopTypingEffect();
      window.speechSynthesis.cancel();
      resetBotContext();
      setIsVideoVisible(false);
      const welcome = '¡Hola! 👋 Soy PlaniBot de nuevo. He reiniciado nuestra sesión. \n\nCuéntame: **¿con quién tengo el gusto?**';
      setMessages([{ role: 'model', text: welcome }]);
      speakText(welcome);
  };

  const handleRate = (stars: number) => {
      setIsRated(true);
      if (stars === 5) {
          // URL de reseñas proporcionada por el usuario
          window.open('https://g.page/r/CZJETIPfoLYKEBM/review', '_blank');
      }
      
      setTimeout(() => {
          setIsVideoVisible(false);
          handleSendMessage(null, "CONTINUAR_FLUJO_POST_VIDEO");
      }, 1500);
  };

  useEffect(() => {
    if (isOpen) {
        startChat({ plans: travelPlans, faqs, contact: contactInfo, social: socialLinks });
        if (messages.length === 0) {
            const welcomeMsg = '¡Hola! 👋 Soy PlaniBot, tu asistente de viajes inteligente. Para poder asesorarte mejor, cuéntame: **¿con quién tengo el gusto?**';
            setMessages([{ role: 'model', text: welcomeMsg }]);
            speakText(welcomeMsg);
        }
    } else {
        window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 w-16 h-16 bg-gradient-to-tr from-green-400 to-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 border border-white/30 backdrop-blur-md"
        aria-label="Chatbot"
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338-11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.45L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.166l-1.138 4.155 4.274-1.11z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-40px)] sm:w-96 h-[75vh] max-h-[650px] flex flex-col rounded-3xl shadow-2xl overflow-hidden glass-container border border-white/20 animate-fade-in-up">
          
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border-b border-white/10">
            <div className="flex items-center gap-3">
                <PlaniBotAvatar className="w-10 h-10" planibotAvatarUrl={planibotAvatarUrl} />
                <div>
                    <h3 className="font-bold text-white text-base leading-tight">PlaniBot 🤖</h3>
                    <p className="text-xs text-green-300 font-medium">Asesor Virtual</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={handleRestart} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors" title="Reiniciar chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative whatsapp-bg">
             
             {isVideoVisible && (
                 <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in text-center overflow-y-auto">
                    {!isRated ? (
                        <>
                            {/* Proporción ajustada para Shorts (vertical) */}
                            <div className="relative w-[70%] max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-4 bg-black">
                                <iframe 
                                    width="100%" height="100%" 
                                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&controls=0&showinfo=0&modestbranding=1&mute=0`} 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    className="w-full h-full"
                                    title="PLANIFICA TU SUEÑO"
                                ></iframe>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 w-full animate-fade-in-up">
                                <p className="text-white text-xs font-bold mb-2">¿Cómo calificarías este destino?</p>
                                <StarRating onRate={handleRate} />
                                <p className="text-[10px] text-white/50 mt-1 italic">¡Tu opinión nos importa mucho!</p>
                            </div>
                            <button 
                                onClick={() => { setIsVideoVisible(false); handleSendMessage(null, "CONTINUAR_FLUJO_POST_VIDEO"); }}
                                className="mt-4 text-white/50 text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors"
                            >
                                Omitir video
                            </button>
                        </>
                    ) : (
                        <div className="animate-bounce text-white">
                            <span className="text-5xl">💖</span>
                            <h4 className="text-xl font-bold mt-4">¡Muchas gracias!</h4>
                            <p className="text-sm text-white/60">Finalizando tu consulta...</p>
                        </div>
                    )}
                 </div>
             )}

             <div className="h-full p-4 overflow-y-auto relative z-10 custom-scrollbar">
                <div className="space-y-4">
                 
                 {messages.length === 1 && messages[0].role === 'model' && (
                     <div className="flex flex-col gap-2 mt-2 animate-fade-in-up">
                         <button 
                            onClick={() => handleSendMessage(null, "VER_CATALOGO")}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl py-3 px-4 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
                         >
                            <span className="group-hover:rotate-12 transition-transform">📂</span>
                            Ver Catálogo de Planes
                         </button>
                     </div>
                 )}

                 {messages.map((msg, index) => (
                   <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                     {msg.text && (
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md relative group ${msg.role === 'user' ? 'bg-green-600/80 text-white rounded-br-none' : 'bg-black/40 text-white rounded-bl-none border border-white/10'}`}>
                            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}></div>
                        </div>
                     )}
                     
                     {msg.whatsappSummaryLink && <div className="w-full"><WhatsappSummaryButton link={msg.whatsappSummaryLink} /></div>}
                     
                     {msg.showDatePicker && index === messages.length - 1 && <ChatDatePicker onDateSelect={(date) => handleSendMessage(null, date)} />}
                     
                     {msg.recommendedPlans && msg.recommendedPlans.length > 0 && (
                         <div className="mt-3 w-[calc(100%+16px)] -ml-2 flex gap-3 overflow-x-auto pb-4 snap-x no-scrollbar px-2">
                             {msg.recommendedPlans.map(plan => <PlanMiniCard key={plan.id} plan={plan} onClick={() => onOpenPlan(plan)} />)}
                         </div>
                     )}
                   </div>
                 ))}
                 {isLoading && <div className="bg-black/40 text-white rounded-2xl p-3 w-16 h-10 flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-200"></span></div>}
                 <div ref={chatEndRef} />
                </div>
             </div>
          </div>
          
          <div className="flex-shrink-0 p-3 bg-white/10 backdrop-blur-lg border-t border-white/10">
            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe algo aquí..."
                    className="flex-1 bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-full focus:ring-2 focus:ring-green-400 py-2.5 px-4 text-sm"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg disabled:bg-gray-500 transition-all transform active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .glass-container { background: rgba(20, 20, 20, 0.65); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); }
        .whatsapp-bg { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default PlaniBot;