
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Settings, Palette, ShoppingBag } from "lucide-react";

const Website = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-poppins font-semibold">Site Público</h1>
        <p className="text-muted-foreground">
          Configure seu site público para exibir e vender seus produtos online.
        </p>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Visualizar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Site</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu site público.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Aqui você poderá configurar:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Nome da loja</li>
                  <li>Domínio (próprio ou subdomínio)</li>
                  <li>Informações de contato</li>
                  <li>Métodos de entrega</li>
                  <li>Política de privacidade</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize o visual do seu site.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Aqui você poderá configurar:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Logo e imagem de capa</li>
                  <li>Cores e tema</li>
                  <li>Layout das páginas</li>
                  <li>Banners e destaques</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>Gerencie os produtos que serão exibidos no site.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Aqui você poderá:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Selecionar produtos para exibir no site</li>
                  <li>Definir produtos em destaque</li>
                  <li>Organizar categorias</li>
                  <li>Adicionar descrições e imagens específicas para o site</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Visualizar Site</CardTitle>
                <CardDescription>Veja como seu site está ficando.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-gray-100 p-10 rounded-lg border border-gray-200 w-full flex items-center justify-center">
                  <p className="text-center text-muted-foreground">Visualização do site indisponível. <br/>Em breve você poderá ver uma prévia do seu site aqui.</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Esta visualização é apenas uma representação de como seu site público ficará.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Website;
