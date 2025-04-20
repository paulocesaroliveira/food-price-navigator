
import React from 'react';
import { WebsiteSettings } from '@/types/website';
import { MapPin, Clock } from 'lucide-react';

interface AboutProps {
  settings: WebsiteSettings;
}

const About = ({ settings }: AboutProps) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-8 text-center">Sobre Nós</h2>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Description */}
          <div className="mb-10">
            <h3 className="text-xl font-poppins font-semibold mb-4">Nossa História</h3>
            <div className="prose prose-stone max-w-none font-quicksand">
              {settings.description ? (
                <p className="text-gray-700 leading-relaxed">{settings.description}</p>
              ) : (
                <p className="text-gray-500 italic">Informações sobre a loja ainda não disponíveis.</p>
              )}
            </div>
          </div>
          
          {/* Store Address */}
          {settings.store_address && (
            <div className="mb-10">
              <h3 className="text-xl font-poppins font-semibold mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-[#E76F51]" />
                Onde Nos Encontrar
              </h3>
              <p className="text-gray-700 font-quicksand mb-6">{settings.store_address}</p>
              
              {/* Optional: Google Maps Embed */}
              <div className="w-full h-[300px] bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  title="Store Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(settings.store_address)}`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Placeholder for Business Hours */}
          <div>
            <h3 className="text-xl font-poppins font-semibold mb-4 flex items-center">
              <Clock size={20} className="mr-2 text-[#E76F51]" />
              Horário de Funcionamento
            </h3>
            <div className="bg-[#FAF3E0] rounded-lg p-5 font-quicksand">
              <div className="flex justify-between py-1 border-b border-[#E76F51]/10">
                <span className="font-medium">Segunda-feira</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E76F51]/10">
                <span className="font-medium">Terça-feira</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E76F51]/10">
                <span className="font-medium">Quarta-feira</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E76F51]/10">
                <span className="font-medium">Quinta-feira</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E76F51]/10">
                <span className="font-medium">Sexta-feira</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E76F51]/10">
                <span className="font-medium">Sábado</span>
                <span>10:00 - 15:00</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium">Domingo</span>
                <span>Fechado</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 italic text-center">
              * Horários podem variar em feriados e ocasiões especiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
