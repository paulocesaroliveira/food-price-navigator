
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, User, UserX, UserCheck } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  store_name: string;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
  is_blocked?: boolean;
}

interface UserActionsDropdownProps {
  user: UserData;
  isUpdating: boolean;
  onViewDetails: (user: UserData) => void;
  onBlockUnblock: (user: UserData, block: boolean) => void;
  onPermanentDelete: (user: UserData) => void;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  isUpdating,
  onViewDetails,
  onBlockUnblock,
  onPermanentDelete
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(user)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalhes
        </DropdownMenuItem>
        {user.is_blocked ? (
          <DropdownMenuItem
            onClick={() => onBlockUnblock(user, false)}
            className="text-green-600"
            disabled={isUpdating}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Desbloquear Usuário
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onBlockUnblock(user, true)}
            className="text-red-600"
            disabled={isUpdating}
          >
            <UserX className="mr-2 h-4 w-4" />
            Bloquear Usuário
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onPermanentDelete(user)}
          className="text-red-600 focus:bg-red-100"
          disabled={isUpdating}
        >
          <User className="mr-2 h-4 w-4" />
          Remover Permanentemente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
