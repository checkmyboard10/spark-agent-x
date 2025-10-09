export const usePermissions = () => {
  // Simplified permissions - all users have full access
  return {
    permissions: {
      isAdmin: true,
      isModerator: true,
      isUser: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManageTeam: true,
      canManageSettings: true,
    },
    isLoading: false,
    isAdmin: true,
    isModerator: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageTeam: true,
    canManageSettings: true,
  };
};
