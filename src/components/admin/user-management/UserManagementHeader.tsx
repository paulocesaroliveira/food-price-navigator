
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UserManagementHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userCount: number;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  searchTerm,
  onSearchChange,
  userCount
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Badge variant="secondary">
        {userCount} usuários
      </Badge>
    </div>
  );
};
