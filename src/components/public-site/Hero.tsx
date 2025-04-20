
import React from 'react';
import { WebsiteSettings } from '@/types/website';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  settings: WebsiteSettings;
  setActiveSection: (section: string) => void;
}

const Hero = ({ settings, setActiveSection }: HeroProps) => {
  return (
    <section className="relative">
      {/* Hero Banner */}
      <div className="w-full h-[50vh] min-h-[350px] max-h-[500px] relative overflow-hidden">
        {settings.cover_image_url ? (
          <img 
            src={settings.cover_image_url} 
            alt={`${settings.name} banner`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#E76F51] to-[#2A9D8F]"></div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold text-white mb-4 drop-shadow-lg">
            {settings.name}
          </h1>
          <p className="text-lg md:text-xl font-quicksand text-white max-w-2xl mb-8 drop-shadow-md">
            {settings.description || "Bem-vindo à nossa loja online!"}
          </p>
          <button 
            onClick={() => setActiveSection('products')}
            className="bg-[#E76F51] hover:bg-[#E76F51]/90 text-white font-quicksand font-medium px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            Ver Produtos
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      
      {/* Brief Introduction (optional) */}
      {settings.description && (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 -mt-16 relative z-10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-poppins font-semibold text-gray-800 mb-4">
              Sobre Nós
            </h2>
            <p className="text-gray-600 font-quicksand leading-relaxed">
              {settings.description}
            </p>
            <button 
              onClick={() => setActiveSection('about')}
              className="mt-6 text-[#E76F51] font-quicksand font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Saiba mais
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
