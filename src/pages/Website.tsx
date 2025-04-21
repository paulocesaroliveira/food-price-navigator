
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Upload, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebsiteSettings, saveWebsiteSettings, getPublishedProducts } from "@/services/websiteService";
import { WebsiteSettings } from "@/types/website";
import PublishProductsTable from "@/components/public-site/products/PublishProductsTable";
import { useFileUpload } from "@/hooks/useFileUpload";

const Website = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useFileUpload();
  
  const [settings, setSettings] = useState<Partial<WebsiteSettings>>({
    name: "",
    domain: "",
    subdomain: "",
    description: "",
    contact_whatsapp: "",
    contact_instagram: "",
    contact_facebook: "",
    store_address: "",
    is_active: false,
    accepted_payment_methods: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"]
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  
  // Get website settings
  const { data: websiteData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['website-settings'],
    queryFn: getWebsiteSettings
  });
  
  // Get published products
  const { data: publishedProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['published-products'],
    queryFn: getPublishedProducts
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: saveWebsiteSettings,
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['website-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível salvar as configurações: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Set initial settings when data loads
  useEffect(() => {
    if (websiteData) {
      setSettings({
        name: websiteData.name || "",
        domain: websiteData.domain || "",
        subdomain: websiteData.subdomain || "",
        description: websiteData.description || "",
        contact_whatsapp: websiteData.contact_whatsapp || "",
        contact_instagram: websiteData.contact_instagram || "",
        contact_facebook: websiteData.contact_facebook || "",
        store_address: websiteData.store_address || "",
        logo_url: websiteData.logo_url || "",
        cover_image_url: websiteData.cover_image_url || "",
        is_active: websiteData.is_active || false,
        accepted_payment_methods: websiteData.accepted_payment_methods || ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"]
      });
    }
  }, [websiteData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, is_active: checked }));
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };
  
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };
  
  const handleAddPaymentMethod = () => {
    if (!paymentMethod.trim()) return;
    
    const updatedMethods = [...(settings.accepted_payment_methods || []), paymentMethod.trim()];
    setSettings(prev => ({
      ...prev,
      accepted_payment_methods: updatedMethods
    }));
    setPaymentMethod("");
  };
  
  const handleRemovePaymentMethod = (method: string) => {
    const updatedMethods = (settings.accepted_payment_methods || []).filter(m => m !== method);
    setSettings(prev => ({
      ...prev,
      accepted_payment_methods: updatedMethods
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      let updatedSettings = { ...settings };
      
      // Upload logo if selected
      if (logoFile) {
        const logoResult = await uploadFile(logoFile, "website");
        if (logoResult.url) {
          updatedSettings.logo_url = logoResult.url;
        }
      }
      
      // Upload cover if selected
      if (coverFile) {
        const coverResult = await uploadFile(coverFile, "website");
        if (coverResult.url) {
          updatedSettings.cover_image_url = coverResult.url;
        }
      }
      
      // Save settings
      updateSettingsMutation.mutate(updatedSettings as WebsiteSettings);
      
      // Reset file selections
      setLogoFile(null);
      setCoverFile(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível salvar as configurações: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Site Público</h1>
        <Button
          className="bg-food-coral hover:bg-food-coral/90 text-white dark:bg-food-coralDark dark:hover:bg-food-coralDark/90"
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending || isUploading}
        >
          {(updateSettingsMutation.isPending || isUploading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configure as informações básicas do seu site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Loja</Label>
                  <Input
                    id="name"
                    name="name"
                    value={settings.name}
                    onChange={handleInputChange}
                    placeholder="Nome da sua loja"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomínio</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="subdomain"
                      name="subdomain"
                      value={settings.subdomain}
                      onChange={handleInputChange}
                      placeholder="sua-loja"
                    />
                    <span className="text-muted-foreground">.foodshop.com</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Domínio Personalizado (opcional)</Label>
                  <Input
                    id="domain"
                    name="domain"
                    value={settings.domain}
                    onChange={handleInputChange}
                    placeholder="www.seudominio.com.br"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição da Loja</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={settings.description}
                    onChange={handleInputChange}
                    placeholder="Descreva sua loja em poucas palavras"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={settings.is_active}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="is_active">Site ativo e visível ao público</Label>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Configure os canais de contato da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                  <Input
                    id="contact_whatsapp"
                    name="contact_whatsapp"
                    value={settings.contact_whatsapp}
                    onChange={handleInputChange}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_instagram">Instagram</Label>
                  <Input
                    id="contact_instagram"
                    name="contact_instagram"
                    value={settings.contact_instagram}
                    onChange={handleInputChange}
                    placeholder="@seuinstagram"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_facebook">Facebook</Label>
                  <Input
                    id="contact_facebook"
                    name="contact_facebook"
                    value={settings.contact_facebook}
                    onChange={handleInputChange}
                    placeholder="facebook.com/suapagina"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store_address">Endereço da Loja</Label>
                  <Textarea
                    id="store_address"
                    name="store_address"
                    value={settings.store_address}
                    onChange={handleInputChange}
                    placeholder="Endereço completo da sua loja"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Images Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Carregue as imagens da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo da Loja</Label>
                  <div className="flex flex-col space-y-2">
                    {settings.logo_url && (
                      <div className="relative w-32 h-32">
                        <img
                          src={settings.logo_url}
                          alt="Logo da Loja"
                          className="w-full h-full object-contain border rounded"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo"
                        type="file"
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="max-w-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        disabled={!settings.logo_url}
                        onClick={() => setSettings(prev => ({ ...prev, logo_url: "" }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cover">Imagem de Capa</Label>
                  <div className="flex flex-col space-y-2">
                    {settings.cover_image_url && (
                      <div className="relative w-full h-40">
                        <img
                          src={settings.cover_image_url}
                          alt="Imagem de Capa"
                          className="w-full h-full object-cover border rounded"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="cover"
                        type="file"
                        onChange={handleCoverUpload}
                        accept="image/*"
                        className="max-w-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        disabled={!settings.cover_image_url}
                        onClick={() => setSettings(prev => ({ ...prev, cover_image_url: "" }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
                <CardDescription>Configure as formas de pagamento aceitas pela sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(settings.accepted_payment_methods || []).map(method => (
                    <div key={method} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                      <span>{method}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full"
                        onClick={() => handleRemovePaymentMethod(method)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Adicionar forma de pagamento"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddPaymentMethod}
                    disabled={!paymentMethod.trim()}
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis na Loja</CardTitle>
              <CardDescription>Gerencie os produtos que serão exibidos no seu site</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <PublishProductsTable products={publishedProducts || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Website;
