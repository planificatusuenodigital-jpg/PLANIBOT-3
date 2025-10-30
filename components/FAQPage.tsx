
import React, { useState, useMemo } from 'react';
import GlassCard from './GlassCard';
import { FAQItem } from '../types';


const FAQAccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <GlassCard className="overflow-hidden">
            <button
                className="w-full text-left p-4 flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-bold text-white text-lg">{item.question}</h3>
                <span className={`transform transition-transform duration-300 text-pink-300 text-2xl ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-4 pb-4 text-white/80">
                    <p>{item.answer}</p>
                </div>
            </div>
        </GlassCard>
    );
};

// FIX: Added props to display dynamic FAQ data.
interface FAQPageProps {
  faqs: FAQItem[];
}

const FAQPage: React.FC<FAQPageProps> = ({ faqs }) => {
    const categories = useMemo(() => {
        const cats = faqs.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<string, FAQItem[]>);
        return Object.entries(cats);
    }, [faqs]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
            <div className="text-center">
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Preguntas Frecuentes</h1>
                <p className="text-white/80 mt-4 text-lg">
                    Encuentra respuestas rápidas a las consultas más comunes sobre nuestros servicios y políticas.
                </p>
            </div>

            <div className="space-y-8">
                {categories.map(([category, items]) => (
                    <section key={category}>
                        <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-md">{category}</h2>
                        <div className="space-y-4">
                            {items.map(item => (
                                <FAQAccordionItem key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default FAQPage;
