
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { UserTableRow } from "./UserTableRow";

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

interface UserTableProps {
  users: UserData[];
  isUpdating: string | null;
  onViewDetails: (user: UserData) => void;
  onBlockUnblock: (user: UserData, block: boolean) => void;
  onPermanentDelete: (user: UserData) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isUpdating,
  onViewDetails,
  onBlockUnblock,
  onPermanentDelete
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loja</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-center">Vendas</TableHead>
            <TableHead className="text-center">Produtos</TableHead>
            <TableHead className="text-center">Pedidos</TableHead>
            <TableHead className="text-center">Bloqueado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              isUpdating={isUpdating}
              onViewDetails={onViewDetails}
              onBlockUnblock={onBlockUnblock}
              onPermanentDelete={onPermanentDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
