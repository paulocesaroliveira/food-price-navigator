
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { UserManagementHeader } from "./user-management/UserManagementHeader";
import { UserTable } from "./user-management/UserTable";
import { useUserManagement } from "./user-management/useUserManagement";
import UserDetailsModal from "./UserDetailsModal";

const UserManagement: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedUser,
    userStats,
    userProfile,
    isModalOpen,
    setIsModalOpen,
    isUpdating,
    users,
    isLoading,
    handleViewDetails,
    handleBlockUnblock,
    handlePermanentDelete
  } = useUserManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            userCount={users.length}
          />

          <UserTable
            users={users}
            isUpdating={isUpdating}
            onViewDetails={handleViewDetails}
            onBlockUnblock={handleBlockUnblock}
            onPermanentDelete={handlePermanentDelete}
          />
        </CardContent>
      </Card>

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        userStats={userStats}
        userProfile={userProfile}
      />
    </div>
  );
};

export default UserManagement;
