
import React, { useState } from 'react';
import { WebsiteSettings } from '@/types/website';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ContactProps {
  settings: WebsiteSettings;
}

const Contact = ({ settings }: ContactProps) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos do formulário",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensagem enviada",
        description: "Agradecemos seu contato, responderemos em breve!",
      });
      setContactForm({
        name: '',
        email: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-8 text-center">Entre em Contato</h2>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h3 className="text-xl font-poppins font-semibold mb-6">Informações de Contato</h3>
          
          <div className="space-y-6">
            {settings.store_address && (
              <div className="flex items-start">
                <MapPin size={22} className="text-[#E76F51] mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Endereço</h4>
                  <p className="text-gray-600 font-quicksand">{settings.store_address}</p>
                </div>
              </div>
            )}
            
            {settings.contact_whatsapp && (
              <div className="flex items-start">
                <Phone size={22} className="text-[#E76F51] mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Telefone / WhatsApp</h4>
                  <a 
                    href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, '')}`}
                    className="text-gray-600 font-quicksand hover:text-[#E76F51] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {settings.contact_whatsapp}
                  </a>
                </div>
              </div>
            )}
            
            {/* Placeholder for Email */}
            <div className="flex items-start">
              <Mail size={22} className="text-[#E76F51] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">E-mail</h4>
                <p className="text-gray-600 font-quicksand">contato@loja.com</p>
              </div>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="mt-10">
            <h3 className="text-xl font-poppins font-semibold mb-4">Redes Sociais</h3>
            
            <div className="flex space-x-4">
              {settings.contact_instagram && (
                <a 
                  href={`https://instagram.com/${settings.contact_instagram.replace('@', '')}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </a>
              )}
              
              {settings.contact_facebook && (
                <a 
                  href={`https://facebook.com/${settings.contact_facebook}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1877F2] text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                </a>
              )}
              
              {settings.contact_whatsapp && (
                <a 
                  href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, '')}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h3 className="text-xl font-poppins font-semibold mb-6">Envie uma Mensagem</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={contactForm.name}
                onChange={handleInputChange}
                placeholder="Seu nome"
                className="mt-1 font-quicksand"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={contactForm.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="mt-1 font-quicksand"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                placeholder="Como podemos ajudar?"
                className="mt-1 font-quicksand"
                rows={5}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#E76F51] hover:bg-[#E76F51]/90 font-quicksand"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
