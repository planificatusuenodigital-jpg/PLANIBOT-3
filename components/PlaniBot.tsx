
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Plan, FAQItem } from '../types';
import { sendMessageToBot, startChat, resetBotContext, getInitialGreeting } from '../services/chatbotService'; // Changed service
import { DEFAULT_CONTACT_INFO, DEFAULT_SOCIAL_LINKS } from '../constants';

const PlaniBotAvatar: React.FC<{ className?: string, planibotAvatarUrl: string }> = ({ className, planibotAvatarUrl }) => (
    <div className={`relative ${className}`}>
        <img
            src={planibotAvatarUrl}
            alt="Asistente Virtual"
            className="w-full h-full rounded-full object-cover border-2 border-green-400 shadow-sm"
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
);

const PlanMiniCard: React.FC<{ plan: Plan; onClick: () => void }> = ({ plan, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg group">
        <div className="h-28 w-full overflow-hidden relative">
            <img src={plan.images[0]} alt={plan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <span className="absolute bottom-2 left-2 text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">{plan.category}</span>
        </div>
        <div className="p-3">
            <h4 className="text-white font-bold text-sm truncate">{plan.title}</h4>
            <p className="text-white/70 text-xs truncate">{plan.city}</p>
            <p className="text-pink-300 font-bold text-xs mt-1">{plan.price}</p>
        </div>
    </div>
);

const WhatsappSummaryButton: React.FC<{ link: string }> = ({ link }) => (
    <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 animate-fade-in-up border border-green-400"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.45L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.166l-1.138 4.155 4.274-1.11z" /></svg>
        Confirmar en WhatsApp
    </a>
);

const ChatDatePicker: React.FC<{ onDateSelect: (date: string) => void }> = ({ onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState('');

    const handleConfirm = () => {
        if (selectedDate) {
            onDateSelect(selectedDate);
        }
    };

    return (
        <div className="mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 w-full max-w-xs shadow-lg animate-fade-in-up">
            <label className="block text-white text-xs font-bold mb-2 uppercase tracking-wide">Selecciona tu fecha de viaje</label>
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/80 text-gray-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-3 text-sm font-medium"
            />
            <button 
                onClick={handleConfirm}
                disabled={!selectedDate}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-md"
            >
                Confirmar Fecha
            </button>
        </div>
    );
};

// Component for Quick Reply Buttons
const QuickOptions: React.FC<{ options: string[]; onSelect: (option: string) => void }> = ({ options, onSelect }) => (
    <div className="flex flex-wrap gap-2 mt-3 animate-fade-in-up">
        {options.map((option, index) => (
            <button
                key={index}
                onClick={() => onSelect(option)}
                className="bg-white/20 hover:bg-pink-500 text-white text-xs md:text-sm py-2 px-4 rounded-full border border-white/30 transition-all shadow-sm hover:shadow-md"
            >
                {option}
            </button>
        ))}
    </div>
);

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
  const [currentVideoId, setCurrentVideoId] = useState("i9E_Blai8vk"); // Default video
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = async (e: React.FormEvent | null, forcedInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = forcedInput || input;
    
    if (!textToSend.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await sendMessageToBot(textToSend);
        
        setIsLoading(false);
        const { text, recommendedPlans, whatsappLink, image, showDatePicker, videoId, options } = response;

        if (videoId) {
            setCurrentVideoId(videoId);
        }

        if (text) {
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: text, 
                recommendedPlans: recommendedPlans,
                whatsappSummaryLink: whatsappLink,
                image: image,
                showDatePicker: showDatePicker,
                videoId: videoId,
                options: options
            }]);
        }

    } catch (error) {
        console.error("Error Bot:", error);
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'model', text: 'Ups, algo salió mal. Por favor intenta de nuevo.' }]);
    }
  };

  const handleOptionClick = (option: string) => {
      handleSendMessage(null, option);
  };

  const handleResetChat = () => {
      resetBotContext(); 
      setCurrentVideoId("i9E_Blai8vk");
      const initialResponse = getInitialGreeting();
      setMessages([{ 
          role: 'model', 
          text: initialResponse.text, 
          options: initialResponse.options 
      }]);
  };

  // Inicialización
  useEffect(() => {
    if (isOpen) {
        startChat({ plans: travelPlans, faqs, contact: contactInfo, social: socialLinks });
        
        const savedHistory = localStorage.getItem('planiBotHistory_v2'); // New key for new bot version
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                if (parsedHistory.length > 0) {
                    setMessages(parsedHistory);
                    return; 
                }
            } catch (e) {
                console.error("Error parsing history", e);
            }
        }

        // Si no hay historial, iniciar saludo
        const initial = getInitialGreeting();
        setMessages([{ role: 'model', text: initial.text, options: initial.options }]);
    }
  }, [isOpen, travelPlans, faqs, contactInfo, socialLinks]);

  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('planiBotHistory_v2', JSON.stringify(messages));
      }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  const getCurrentTime = () => {
      const now = new Date();
      return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-green-400 to-green-600 text-white rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] flex items-center justify-center transform hover:scale-110 transition-all duration-300 border border-white/30 backdrop-blur-md"
        aria-label="Abrir Asistente"
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-9 md:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-40px)] sm:w-96 h-[75vh] max-h-[650px] flex flex-col rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden glass-container border border-white/20">
          
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border-b border-white/10">
            <div className="flex items-center gap-3">
                <PlaniBotAvatar className="w-10 h-10" planibotAvatarUrl={planibotAvatarUrl} />
                <div>
                    <h3 className="font-bold text-white text-base leading-tight">Asistente Virtual</h3>
                    <p className="text-xs text-green-300 font-medium">En línea</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                 <button onClick={handleResetChat} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors" title="Reiniciar Conversación">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                 </button>
            </div>
          </div>
          
          {/* Dynamic Video Player Area */}
           <div className="w-full h-48 bg-black/50 relative flex-shrink-0">
               <iframe 
                   width="100%" 
                   height="100%" 
                   src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentVideoId}`} 
                   title="Destino Video" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                   className="pointer-events-none" 
               ></iframe>
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
           </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto whatsapp-bg relative">
             <div className="space-y-4 relative z-10">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md relative group
                        ${msg.role === 'user' 
                            ? 'bg-green-600/80 text-white rounded-br-none backdrop-blur-sm border border-green-500/30' 
                            : 'bg-black/40 text-white rounded-bl-none backdrop-blur-md border border-white/10'
                        }`}
                  >
                     <div className="markdown-body" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}></div>
                     <span className="text-[10px] text-white/50 block text-right mt-1">{getCurrentTime()}</span>
                  </div>
                  
                  {/* Whatsapp Summary Link Button */}
                  {msg.whatsappSummaryLink && (
                       <div className="max-w-[85%] mt-1">
                          <WhatsappSummaryButton link={msg.whatsappSummaryLink} />
                       </div>
                  )}
                  
                  {/* Bot sent image */}
                  {msg.image && (
                      <div className="max-w-[85%] mt-2">
                          <img 
                              src={msg.image} 
                              alt="Mensaje del Bot" 
                              className="rounded-xl w-full h-auto shadow-lg border border-white/20 animate-fade-in-up"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                      </div>
                  )}

                  {/* Render Date Picker if requested by bot */}
                  {msg.showDatePicker && index === messages.length - 1 && (
                      <ChatDatePicker onDateSelect={(date) => handleSendMessage(null, date)} />
                  )}

                  {/* Render Recommended Plans Miniatures */}
                  {msg.recommendedPlans && msg.recommendedPlans.length > 0 && (
                      <div className="mt-3 w-full flex gap-3 overflow-x-auto pb-2 pl-1 snap-x no-scrollbar">
                          {msg.recommendedPlans.map(plan => (
                              <PlanMiniCard key={plan.id} plan={plan} onClick={() => onOpenPlan(plan)} />
                          ))}
                      </div>
                  )}

                  {/* Render Quick Options */}
                  {msg.options && index === messages.length - 1 && (
                      <QuickOptions options={msg.options} onSelect={handleOptionClick} />
                  )}
                </div>
              ))}
              
              {isLoading && (
                  <div className="flex items-start">
                       <div className="bg-black/40 text-white rounded-2xl rounded-bl-none backdrop-blur-md border border-white/10 p-3 shadow-md">
                          <div className="flex gap-1.5 items-center h-5">
                              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-100"></span>
                              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-200"></span>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="flex-shrink-0 p-3 bg-white/10 backdrop-blur-lg border-t border-white/10">
            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe aquí..."
                    className="flex-1 bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-full focus:ring-2 focus:ring-green-400 focus:outline-none py-2.5 px-4 text-sm transition-all"
                    disabled={isLoading}
                    autoFocus
                />
                
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-500 transition-all transform active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .glass-container {
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .whatsapp-bg {
            background-color: transparent;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .markdown-body ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .markdown-body b, .markdown-body strong {
            font-weight: 700;
            color: #d1fae5;
        }
        .markdown-body a {
            color: #fce7f3; /* Pink-100 */
            font-weight: 600;
            text-decoration: underline;
            text-decoration-color: #f472b6; /* Pink-400 */
            transition: color 0.2s;
        }
        .markdown-body a:hover {
            color: #fbcfe8; /* Pink-200 */
            text-decoration-thickness: 2px;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translate3d(0, 20px, 0);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </>
  );
};

export default PlaniBot;
