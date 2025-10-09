import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "moderator" | "user";

export const usePermissions = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["user-role", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data?.role as AppRole | null;
    },
    enabled: !!session?.user?.id,
  });

  const role: AppRole = (userRole as AppRole) || "user";
  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  const isUser = role === "user";

  return {
    permissions: {
      isAdmin,
      isModerator,
      isUser,
      canCreate: isAdmin || isModerator || isUser,
      canEdit: isAdmin || isModerator,
      canDelete: isAdmin || isModerator,
      canManageTeam: isAdmin,
      canManageSettings: isAdmin || isModerator,
    },
    isLoading,
    isAdmin,
    isModerator,
    canCreate: isAdmin || isModerator || isUser,
    canEdit: isAdmin || isModerator,
    canDelete: isAdmin || isModerator,
    canManageTeam: isAdmin,
    canManageSettings: isAdmin || isModerator,
  };
};
