import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebsiteSettings, saveWebsiteSettings } from "@/services/websiteService";
import { WebsiteSettings } from "@/types/website";
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
    is_active: false
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // Get website settings
  const { data: websiteData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['website-settings'],
    queryFn: getWebsiteSettings
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
        is_active: websiteData.is_active || false
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
  
  const handleSaveSettings = async () => {
    try {
      let updatedSettings = { ...settings };
      
      // Upload logo if selected
      if (logoFile) {
        const logoResult = await uploadFile(logoFile, "website");
        if (logoResult?.url) {
          updatedSettings.logo_url = logoResult.url;
        }
      }
      
      // Upload cover if selected
      if (coverFile) {
        const coverResult = await uploadFile(coverFile, "website");
        if (coverResult?.url) {
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
        <h1 className="text-3xl font-bold">Configurações do Site</h1>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Configure as informações básicas do seu site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                name="name"
                value={settings.name}
                onChange={handleInputChange}
                placeholder="Nome da sua empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={settings.description}
                onChange={handleInputChange}
                placeholder="Descrição da sua empresa"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store_address">Endereço</Label>
              <Textarea
                id="store_address"
                name="store_address"
                value={settings.store_address}
                onChange={handleInputChange}
                placeholder="Endereço da empresa"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={settings.is_active}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="is_active">Site ativo</Label>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>Configure os meios de contato da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_whatsapp">WhatsApp</Label>
              <Input
                id="contact_whatsapp"
                name="contact_whatsapp"
                value={settings.contact_whatsapp}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
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
                placeholder="seufacebook"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
            <CardDescription>Faça upload das imagens da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              {settings.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt="Logo atual" 
                  className="w-20 h-20 object-contain border rounded"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cover">Imagem de Capa</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
              />
              {settings.cover_image_url && (
                <img 
                  src={settings.cover_image_url} 
                  alt="Capa atual" 
                  className="w-full h-32 object-cover border rounded"
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Domain Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Domínio</CardTitle>
            <CardDescription>Configure o domínio do seu site (futuro)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio Personalizado</Label>
              <Input
                id="domain"
                name="domain"
                value={settings.domain}
                onChange={handleInputChange}
                placeholder="www.seusite.com"
                disabled
              />
              <p className="text-sm text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomínio</Label>
              <Input
                id="subdomain"
                name="subdomain"
                value={settings.subdomain}
                onChange={handleInputChange}
                placeholder="seusite"
                disabled
              />
              <p className="text-sm text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Website;
