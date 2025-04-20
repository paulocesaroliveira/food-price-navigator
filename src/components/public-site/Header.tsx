
import React from 'react';
import { WebsiteSettings } from '@/types/website';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface HeaderProps {
  settings: WebsiteSettings;
  activeSection: string;
  setActiveSection: (section: string) => void;
  cartItemCount: number;
}

const Header = ({ settings, activeSection, setActiveSection, cartItemCount }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Store Name */}
          <div className="flex items-center gap-3" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={`${settings.name} logo`} 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="h-10 w-10 bg-[#E76F51] rounded-full flex items-center justify-center text-white font-bold">
                {settings.name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-poppins font-bold text-gray-800 hidden sm:block">{settings.name}</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              className={`font-quicksand font-medium px-1 py-1 border-b-2 transition-colors ${activeSection === 'home' ? 'border-[#E76F51] text-[#E76F51]' : 'border-transparent hover:text-[#E76F51]'}`}
              onClick={() => handleNavClick('home')}
            >
              Início
            </button>
            <button 
              className={`font-quicksand font-medium px-1 py-1 border-b-2 transition-colors ${activeSection === 'products' ? 'border-[#E76F51] text-[#E76F51]' : 'border-transparent hover:text-[#E76F51]'}`}
              onClick={() => handleNavClick('products')}
            >
              Produtos
            </button>
            <button 
              className={`font-quicksand font-medium px-1 py-1 border-b-2 transition-colors ${activeSection === 'about' ? 'border-[#E76F51] text-[#E76F51]' : 'border-transparent hover:text-[#E76F51]'}`}
              onClick={() => handleNavClick('about')}
            >
              Sobre
            </button>
            <button 
              className={`font-quicksand font-medium px-1 py-1 border-b-2 transition-colors ${activeSection === 'contact' ? 'border-[#E76F51] text-[#E76F51]' : 'border-transparent hover:text-[#E76F51]'}`}
              onClick={() => handleNavClick('contact')}
            >
              Contato
            </button>
          </nav>

          {/* Cart Icon and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button 
              className="relative p-2 text-gray-700 hover:text-[#E76F51] transition-colors"
              onClick={() => handleNavClick('cart')}
              aria-label="Ver carrinho"
            >
              <ShoppingBag size={24} className={activeSection === 'cart' ? 'text-[#E76F51]' : ''} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E76F51] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <button 
              className="md:hidden p-2 text-gray-700 hover:text-[#E76F51] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-3 border-t pt-3">
            <div className="flex flex-col space-y-3">
              <button 
                className={`font-quicksand font-medium px-3 py-2 rounded-md transition-colors text-left ${activeSection === 'home' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'hover:bg-gray-100'}`}
                onClick={() => handleNavClick('home')}
              >
                Início
              </button>
              <button 
                className={`font-quicksand font-medium px-3 py-2 rounded-md transition-colors text-left ${activeSection === 'products' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'hover:bg-gray-100'}`}
                onClick={() => handleNavClick('products')}
              >
                Produtos
              </button>
              <button 
                className={`font-quicksand font-medium px-3 py-2 rounded-md transition-colors text-left ${activeSection === 'about' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'hover:bg-gray-100'}`}
                onClick={() => handleNavClick('about')}
              >
                Sobre
              </button>
              <button 
                className={`font-quicksand font-medium px-3 py-2 rounded-md transition-colors text-left ${activeSection === 'contact' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'hover:bg-gray-100'}`}
                onClick={() => handleNavClick('contact')}
              >
                Contato
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
