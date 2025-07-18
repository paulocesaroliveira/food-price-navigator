
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserX, UserCheck } from "lucide-react";
import { UserActionsDropdown } from "./UserActionsDropdown";

interface UserWithDetails {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  store_name?: string;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
  is_blocked: boolean;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

interface UserTableRowProps {
  user: UserWithDetails;
  isUpdating: boolean;
  onViewDetails: (user: UserWithDetails) => void;
  onBlockUnblock: (user: UserWithDetails) => void;
  onPermanentDelete: (user: UserWithDetails) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isUpdating,
  onViewDetails,
  onBlockUnblock,
  onPermanentDelete
}) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">
        {user.store_name || 'N/A'}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {new Date(user.created_at).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{user.salesCount}</Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{user.productsCount}</Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{user.ordersCount}</Badge>
      </TableCell>
      <TableCell className="text-center">
        {user.is_blocked ? (
          <Badge className="bg-red-600 text-white">
            <UserX className="w-3 h-3 mr-1" />
            Sim
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Não
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <UserActionsDropdown
          user={user}
          isUpdating={isUpdating}
          onViewDetails={onViewDetails}
          onBlockUnblock={onBlockUnblock}
          onPermanentDelete={onPermanentDelete}
        />
      </TableCell>
    </TableRow>
  );
};
