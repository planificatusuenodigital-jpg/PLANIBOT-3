import React from 'react';
import { LOGO_URL } from '../constants';

const WelcomeSplash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 animate-fade-out">
        <style>{`
            @keyframes fade-out {
                0% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; }
            }
            .animate-fade-out {
                animation: fade-out 2.5s ease-in-out forwards;
            }
            @keyframes logo-fade-in {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .animate-logo-fade-in {
                animation: logo-fade-in 1.5s ease-out forwards;
            }
        `}</style>
        <div className="text-white text-center">
            <img 
                src={LOGO_URL} 
                alt="Planifica Tu Sueño Logo"
                className="w-64 h-auto animate-logo-fade-in"
            />
        </div>
    </div>
  );
};

export default WelcomeSplash;