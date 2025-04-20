
import React, { useState } from "react";
import { WebsiteSettings, CartItem, CustomerData, PublicSiteProps } from "@/types/website";
import { PublishedProduct } from "@/services/websiteService";
import Header from "./Header";
import Hero from "./Hero";
import ProductCatalog from "./ProductCatalog";
import Cart from "./Cart";
import About from "./About";
import Contact from "./Contact";
import Footer from "./Footer";
import { submitOrder } from "@/services/websiteService";
import { toast } from "@/hooks/use-toast";

const PublicSite = ({ settings, products }: PublicSiteProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    deliveryType: "Retirada"
  });

  const addToCart = (product: PublishedProduct, quantity: number = 1, notes: string = "") => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(
        cart.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes } 
            : item
        )
      );
    } else {
      setCart([
        ...cart, 
        { 
          id: `cart-${Date.now()}`, 
          product_id: product.id, 
          name: product.name, 
          price: product.price,
          quantity, 
          notes 
        }
      ]);
    }
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} adicionado ao pedido`,
    });
  };

  const updateCartItem = (id: string, quantity: number, notes?: string) => {
    setCart(
      cart.map(item => 
        item.id === id 
          ? { ...item, quantity, notes: notes !== undefined ? notes : item.notes } 
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSubmitOrder = async () => {
    if (!customerData.name || !customerData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha seu nome e telefone para continuar",
        variant: "destructive",
      });
      return;
    }

    if (customerData.deliveryType === "Entrega" && !customerData.address) {
      toast({
        title: "Erro",
        description: "Por favor, informe o endereço de entrega",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Erro",
        description: "Seu pedido está vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price,
        total_price: item.price * item.quantity,
        notes: item.notes || null
      }));

      const orderData = {
        customer: {
          name: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null,
          address: customerData.address || null,
          origin: "site"
        },
        order: {
          delivery_type: customerData.deliveryType,
          delivery_address: customerData.address || null,
          scheduled_date: customerData.scheduledDate || null,
          scheduled_time: customerData.scheduledTime || null,
          total_amount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
          notes: customerData.notes || null,
          origin: "site",
          status: "Novo"
        },
        items: orderItems
      };

      const result = await submitOrder(orderData);
      
      if (result) {
        toast({
          title: "Pedido enviado com sucesso!",
          description: "Entraremos em contato em breve para confirmar os detalhes.",
        });
        clearCart();
        setCustomerData({
          name: "",
          email: "",
          phone: "",
          deliveryType: "Retirada"
        });
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Não foi possível completar seu pedido. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleSendWhatsappOrder = () => {
    if (!settings.contact_whatsapp) {
      toast({
        title: "Erro",
        description: "Esta loja não possui WhatsApp configurado",
        variant: "destructive",
      });
      return;
    }

    if (!customerData.name || !customerData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha seu nome e telefone para continuar",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Erro",
        description: "Seu pedido está vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemsText = cart.map(item => 
        `*${item.quantity}x ${item.name}* - R$ ${(item.price * item.quantity).toFixed(2)}${item.notes ? `\n_Obs: ${item.notes}_` : ''}`
      ).join('\n\n');

      const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      const message = `
*NOVO PEDIDO*
        
*Cliente:* ${customerData.name}
*Telefone:* ${customerData.phone}
${customerData.email ? `*Email:* ${customerData.email}` : ''}
*Tipo:* ${customerData.deliveryType}
${customerData.deliveryType === 'Entrega' ? `*Endereço:* ${customerData.address}` : ''}
${customerData.scheduledDate ? `*Data desejada:* ${customerData.scheduledDate}` : ''}
${customerData.scheduledTime ? `*Horário desejado:* ${customerData.scheduledTime}` : ''}
${customerData.notes ? `*Observações:* ${customerData.notes}` : ''}

*ITENS DO PEDIDO:*
${itemsText}

*TOTAL: R$ ${totalAmount.toFixed(2)}*
      `;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = settings.contact_whatsapp?.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Erro ao enviar pedido via WhatsApp:", error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Não foi possível redirecionar para o WhatsApp. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF3E0]">
      <Header 
        settings={settings} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        cartItemCount={cart.reduce((total, item) => total + item.quantity, 0)}
      />
      
      <main className="flex-grow">
        <section id="home" className={activeSection === "home" ? "block" : "hidden"}>
          <Hero settings={settings} setActiveSection={setActiveSection} />
        </section>
        
        <section id="products" className={activeSection === "products" ? "block" : "hidden"}>
          <ProductCatalog products={products} addToCart={addToCart} />
        </section>
        
        <section id="cart" className={activeSection === "cart" ? "block" : "hidden"}>
          <Cart 
            cart={cart} 
            updateCartItem={updateCartItem}
            removeFromCart={removeFromCart}
            customerData={customerData}
            setCustomerData={setCustomerData}
            onSubmitOrder={handleSubmitOrder}
            onSendWhatsappOrder={handleSendWhatsappOrder}
          />
        </section>
        
        <section id="about" className={activeSection === "about" ? "block" : "hidden"}>
          <About settings={settings} />
        </section>
        
        <section id="contact" className={activeSection === "contact" ? "block" : "hidden"}>
          <Contact settings={settings} />
        </section>
      </main>
      
      <Footer settings={settings} setActiveSection={setActiveSection} />
    </div>
  );
};

export default PublicSite;
