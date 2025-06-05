
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = "TastyHub - Sistema Completo para Confeitarias e Docerias",
  description = "Sistema completo de gestão para confeitarias e docerias. Controle ingredientes, receitas, produtos, vendas, estoque e muito mais. Teste grátis por 30 dias.",
  keywords = "confeitaria, doceria, sistema gestão, controle estoque, precificação, receitas, vendas, ERP confeitaria",
  image = "/favicon.ico",
  url = "https://tastyhub.com.br",
  type = "website"
}: SEOHeadProps) => {
  const fullTitle = title.includes("TastyHub") ? title : `${title} | TastyHub`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="TastyHub" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TastyHub" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#E76F51" />
      <meta name="msapplication-TileColor" content="#E76F51" />
      <meta name="application-name" content="TastyHub" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "TastyHub",
          "description": description,
          "url": url,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL",
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock"
          },
          "creator": {
            "@type": "Organization",
            "name": "TastyHub",
            "url": url
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
