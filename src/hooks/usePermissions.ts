import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePermissions = () => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const userRoles = roles?.map(r => r.role as string) || [];

      const hasAdmin = userRoles.includes('admin');
      const hasModerator = userRoles.some(r => r === 'moderator' || r === 'admin');
      
      return {
        isAdmin: hasAdmin,
        isModerator: userRoles.some(r => r === 'moderator'),
        isUser: userRoles.includes('user'),
        canCreate: hasModerator,
        canEdit: hasModerator,
        canDelete: hasAdmin,
        canManageTeam: hasAdmin,
        canManageSettings: hasAdmin,
      };
    },
  });

  return {
    permissions,
    isLoading,
    isAdmin: permissions?.isAdmin || false,
    isModerator: permissions?.isModerator || false,
    canCreate: permissions?.canCreate || false,
    canEdit: permissions?.canEdit || false,
    canDelete: permissions?.canDelete || false,
    canManageTeam: permissions?.canManageTeam || false,
    canManageSettings: permissions?.canManageSettings || false,
  };
};
