
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface ItemCardProps {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  imageUrl?: string;
  stats: Array<{
    label: string;
    value: string | number;
    type?: 'text' | 'currency' | 'number';
    color?: string;
  }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  extraInfo?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  subtitle,
  category,
  imageUrl,
  stats,
  onEdit,
  onDelete,
  isDeleting = false,
  extraInfo
}) => {
  const formatValue = (value: string | number, type: string = 'text') => {
    if (type === 'currency') {
      return formatCurrency(Number(value));
    }
    if (type === 'number') {
      return Number(value).toLocaleString('pt-BR');
    }
    return String(value);
  };

  return (
    <Card className="custom-card card-hover h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          {imageUrl && (
            <div className="w-12 h-12 ml-3 flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{stat.label}:</span>
              <span 
                className={`font-medium ${stat.color || 'text-foreground'}`}
              >
                {formatValue(stat.value, stat.type)}
              </span>
            </div>
          ))}
          {extraInfo && (
            <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {extraInfo}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(id)}
            className="rounded-full flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(id)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 rounded-full flex-1 sm:flex-none"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
