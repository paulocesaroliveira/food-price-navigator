
import React from "react";
import { PricingConfiguration } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Edit, 
  Copy, 
  Trash, 
  MoreVertical,
  FileText,
  HelpCircle
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PricingConfigsListProps {
  configs: PricingConfiguration[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const PricingConfigsList: React.FC<PricingConfigsListProps> = ({
  configs,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <Card className="border shadow-soft bg-food-white rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-food-vanilla to-food-cream">
        <CardTitle className="flex items-center gap-2 font-poppins text-food-dark">
          <FileText className="h-5 w-5 text-food-coral" />
          Precificações Salvas
        </CardTitle>
        <CardDescription>
          Histórico de precificações calculadas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-8">Carregando precificações...</div>
        ) : configs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma precificação salva ainda
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-food-vanilla/30">
              <TableRow>
                <TableHead className="font-poppins">Nome</TableHead>
                <TableHead className="font-poppins">Data</TableHead>
                <TableHead className="font-poppins">Preço final</TableHead>
                <TableHead className="font-poppins">
                  <div className="flex items-center">
                    Margem
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="ml-1 cursor-help">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[150px] text-xs">
                            Margem real calculada após todos os custos e impostos.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="text-right font-poppins">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id} className="hover:bg-food-vanilla/10">
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(config.created_at)}
                  </TableCell>
                  <TableCell className="font-semibold text-food-dark">
                    {formatCurrency(config.final_price)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                      config.actual_margin > 30 
                        ? 'bg-food-green/20 text-green-800' 
                        : config.actual_margin < 15
                          ? 'bg-food-red/20 text-red-800'
                          : 'bg-food-vanilla text-amber-800'
                    }`}>
                      {config.actual_margin.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-food-dark hover:bg-food-vanilla hover:text-food-coral">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-food-white border-food-vanilla">
                        <DropdownMenuItem onClick={() => onView(config.id)} className="cursor-pointer text-food-dark hover:text-food-coral">
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(config.id)} className="cursor-pointer text-food-dark hover:text-food-coral">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(config.id)} className="cursor-pointer text-food-dark hover:text-food-coral">
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <Separator className="my-1 bg-food-vanilla" />
                        <DropdownMenuItem 
                          onClick={() => onDelete(config.id)}
                          className="text-food-red focus:text-food-red cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingConfigsList;
