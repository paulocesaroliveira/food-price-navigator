
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  userName?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  size = 'md', 
  editable = false,
  userName = 'User'
}) => {
  const { avatarUrl, isLoading, uploadAvatar } = useUserAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-20 w-20'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    const result = await uploadAvatar(file);
    if (result) {
      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do avatar",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} ${editable ? 'cursor-pointer' : ''}`}>
        <AvatarImage src={avatarUrl || undefined} alt={userName} />
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 bg-white shadow-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Camera className="h-3 w-3" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default AvatarUpload;
