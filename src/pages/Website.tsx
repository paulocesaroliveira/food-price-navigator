import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Settings, Palette, ShoppingBag, Image, ExternalLink, Loader2, Save, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { WebsiteSettings, getWebsiteSettings, saveWebsiteSettings } from "@/services/websiteService";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import PublishProductsTable from "@/components/public-site/products/PublishProductsTable";

const Website = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  
  const form = useForm<Omit<WebsiteSettings, "id" | "created_at" | "updated_at">>({
    defaultValues: {
      name: "",
      domain: "",
      subdomain: "",
      logo_url: "",
      cover_image_url: "",
      description: "",
      is_active: false,
      contact_whatsapp: "",
      contact_instagram: "",
      contact_facebook: "",
      store_address: ""
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const data = await getWebsiteSettings();
      if (data) {
        setSettings(data);
        form.reset({
          name: data.name,
          domain: data.domain || "",
          subdomain: data.subdomain || "",
          logo_url: data.logo_url || "",
          cover_image_url: data.cover_image_url || "",
          description: data.description || "",
          is_active: data.is_active,
          contact_whatsapp: data.contact_whatsapp || "",
          contact_instagram: data.contact_instagram || "",
          contact_facebook: data.contact_facebook || "",
          store_address: data.store_address || ""
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [form]);

  const onSubmit = async (data: Omit<WebsiteSettings, "id" | "created_at" | "updated_at">) => {
    setSaving(true);
    const saved = await saveWebsiteSettings(data);
    if (saved) {
      setSettings(saved);
      toast({
        title: "Sucesso",
        description: "Configurações do site salvas com sucesso",
      });
    }
    setSaving(false);
  };

  const getPublicSiteUrl = () => {
    if (!settings) return null;
    
    if (settings.domain) {
      return `https://${settings.domain}`;
    } else if (settings.subdomain) {
      return `https://${settings.subdomain}.tastyhub.com`;
    } else {
      return `/loja`;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-poppins font-semibold">Site Público</h1>
        <p className="text-muted-foreground">
          Configure seu site público para exibir e vender seus produtos online.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-food-coral" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        ) : (
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

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="config">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Site</CardTitle>
                    <CardDescription>
                      Configure as informações básicas do seu site público.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Loja*</Label>
                      <Input 
                        id="name" 
                        placeholder="Ex: Doces da Maria"
                        {...form.register("name", { required: true })}
                        required
                      />
                      <p className="text-sm text-muted-foreground">Este nome será exibido no cabeçalho do site.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domínio Próprio</Label>
                        <Input 
                          id="domain" 
                          placeholder="Ex: www.docesdamaria.com.br"
                          {...form.register("domain")}
                        />
                        <p className="text-sm text-muted-foreground">
                          Deixe em branco se não possuir um domínio próprio.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subdomain">Subdomínio</Label>
                        <div className="flex items-center">
                          <Input 
                            id="subdomain" 
                            placeholder="Ex: docesdamaria"
                            className="rounded-r-none"
                            {...form.register("subdomain")}
                          />
                          <div className="px-3 py-2 border border-l-0 rounded-r-md bg-muted">
                            .tastyhub.com
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Escolha um subdomínio gratuito para seu site.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição da Loja</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Descreva sua loja em poucas palavras..."
                        rows={3}
                        {...form.register("description")}
                      />
                      <p className="text-sm text-muted-foreground">
                        Esta descrição será exibida na página inicial do site.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store_address">Endereço da Loja</Label>
                      <Input 
                        id="store_address" 
                        placeholder="Ex: Rua das Flores, 123 - Bairro Jardim - Cidade/UF"
                        {...form.register("store_address")}
                      />
                      <p className="text-sm text-muted-foreground">
                        Será exibido na página de contato.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Redes Sociais e Contato</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                        <Input 
                          id="contact_whatsapp" 
                          placeholder="Ex: 5511987654321 (com código do país)"
                          {...form.register("contact_whatsapp")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact_instagram">Instagram</Label>
                        <Input 
                          id="contact_instagram" 
                          placeholder="Ex: @docesdamaria (apenas o nome de usuário)"
                          {...form.register("contact_instagram")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact_facebook">Facebook</Label>
                        <Input 
                          id="contact_facebook" 
                          placeholder="Ex: docesdamaria (apenas o nome da página)"
                          {...form.register("contact_facebook")}
                        />
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_active">Ativar Site Público</Label>
                        <p className="text-sm text-muted-foreground">
                          Quando ativado, seu site estará disponível para acesso público.
                        </p>
                      </div>
                      <Switch 
                        id="is_active"
                        checked={form.watch("is_active")}
                        onCheckedChange={(checked) => form.setValue("is_active", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize o visual do seu site.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">URL da Logo</Label>
                      <Input 
                        id="logo_url" 
                        placeholder="https://exemplo.com/logo.png"
                        {...form.register("logo_url")}
                      />
                      <p className="text-sm text-muted-foreground">
                        Recomendado: imagem com fundo transparente (PNG), tamanho 200x200px.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cover_image_url">URL da Imagem de Capa</Label>
                      <Input 
                        id="cover_image_url" 
                        placeholder="https://exemplo.com/capa.jpg"
                        {...form.register("cover_image_url")}
                      />
                      <p className="text-sm text-muted-foreground">
                        Recomendado: imagem de alta qualidade, tamanho 1200x400px.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Prévia da Logo</h3>
                        {form.watch("logo_url") ? (
                          <div className="border rounded-md p-4 flex items-center justify-center h-[150px]">
                            <img 
                              src={form.watch("logo_url")} 
                              alt="Prévia da logo" 
                              className="max-h-[120px] max-w-[200px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=Logo+Inválida";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 flex items-center justify-center h-[150px] bg-muted/50">
                            <Image className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Prévia da Capa</h3>
                        {form.watch("cover_image_url") ? (
                          <div className="border rounded-md p-4 flex items-center justify-center h-[150px]">
                            <img 
                              src={form.watch("cover_image_url")} 
                              alt="Prévia da capa" 
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x400?text=Capa+Inválida";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 flex items-center justify-center h-[150px] bg-muted/50">
                            <Image className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
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
                    <PublishProductsTable />
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
                    {getPublicSiteUrl() ? (
                      <>
                        <div className="p-6 border rounded-md w-full mb-4">
                          <h3 className="text-lg font-medium mb-2">Seu site está disponível em:</h3>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                              {getPublicSiteUrl()}
                            </code>
                            <Button variant="ghost" size="icon" onClick={() => window.open(getPublicSiteUrl()!, "_blank")}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {settings?.is_active 
                              ? "Seu site está ativo e pode ser acessado pelo link acima."
                              : "Seu site está configurado, mas não está ativo. Ative-o na aba Configurações."}
                          </p>
                        </div>
                        <div className="bg-gray-100 p-8 rounded-lg border border-gray-200 w-full flex items-center justify-center">
                          <p className="text-center text-muted-foreground">Prévia do site em desenvolvimento. <br/>Em breve você poderá ver uma prévia completa do seu site aqui.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-yellow-50 p-6 border border-yellow-200 rounded-md text-yellow-800 w-full mb-6">
                          <h3 className="text-lg font-medium mb-2">Site não configurado</h3>
                          <p>Para visualizar seu site, você precisa configurar pelo menos um domínio próprio ou um subdomínio na aba Configurações.</p>
                        </div>
                        <div className="bg-gray-100 p-10 rounded-lg border border-gray-200 w-full flex items-center justify-center">
                          <p className="text-center text-muted-foreground">Visualização do site indisponível. <br/>Configure seu site na aba Configurações.</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  className="bg-food-coral hover:bg-food-amber" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Website;
