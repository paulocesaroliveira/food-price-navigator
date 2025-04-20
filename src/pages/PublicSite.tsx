
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWebsiteSettings, getPublishedProducts } from "@/services/websiteService";
import PublicSite from "@/components/public-site/PublicSite";
import { WebsiteSettings } from "@/types/website";
import { PublishedProduct } from "@/services/websiteService";

const PublicSitePage = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [products, setProducts] = useState<PublishedProduct[]>([]);
  const { storeId } = useParams();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        // Fetch website settings
        const websiteSettings = await getWebsiteSettings();
        if (websiteSettings) {
          setSettings(websiteSettings);
          
          // Fetch published products
          const publishedProducts = await getPublishedProducts();
          setProducts(publishedProducts);
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E76F51] mx-auto mb-4"></div>
          <h2 className="text-xl font-poppins text-gray-700">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0]">
        <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Loja não encontrada</h2>
          <p className="text-gray-600 mb-6">
            A loja que você está procurando não existe ou não está disponível no momento.
          </p>
          <a 
            href="/"
            className="inline-block bg-[#E76F51] text-white px-6 py-2 rounded-lg font-quicksand font-medium hover:bg-[#E76F51]/90 transition-colors"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    );
  }

  if (!settings.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0]">
        <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Loja em manutenção</h2>
          <p className="text-gray-600 mb-6">
            Esta loja está temporariamente indisponível. Por favor, volte mais tarde.
          </p>
          <div className="text-sm text-gray-500 mt-8">
            {settings.name} - Em breve
          </div>
        </div>
      </div>
    );
  }

  return <PublicSite settings={settings} products={products} />;
};

export default PublicSitePage;
