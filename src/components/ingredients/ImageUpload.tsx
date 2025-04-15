
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImage: string | null;
  onUpload: (file: File) => Promise<string | null>;
  isUploading: boolean;
  label: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  isUploading,
  label,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await onUpload(file);
    }
  };

  const removeImage = () => {
    // Quando implementar a remoção da imagem, esta função setará currentImage para null
    // e também atualizará o banco de dados se necessário
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      
      {currentImage ? (
        <div className="relative w-full h-56 rounded-md overflow-hidden bg-muted">
          <img
            src={currentImage}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">
            Arraste uma imagem ou
          </p>
          <label htmlFor="file-upload" className="mt-2 cursor-pointer">
            <span className="text-primary font-medium">clique para selecionar</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, GIF até 10MB
          </p>
          {isUploading && (
            <div className="mt-2 text-sm text-muted-foreground">
              Enviando imagem...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
