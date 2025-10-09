import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useAgencyTheme = () => {
  const { data: theme, isLoading } = useQuery({
    queryKey: ['agency-theme'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (!profile?.agency_id) return null;

      const { data: agency } = await supabase
        .from('agencies')
        .select('logo_url, primary_color, secondary_color, settings')
        .eq('id', profile.agency_id)
        .single();

      return agency;
    },
  });

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      
      if (theme.primary_color) {
        root.style.setProperty('--primary', theme.primary_color);
        root.style.setProperty('--agency-primary', theme.primary_color);
      }
      
      if (theme.secondary_color) {
        root.style.setProperty('--secondary', theme.secondary_color);
        root.style.setProperty('--agency-secondary', theme.secondary_color);
      }
    }
  }, [theme]);

  return {
    theme,
    isLoading,
    logoUrl: theme?.logo_url,
    primaryColor: theme?.primary_color,
    secondaryColor: theme?.secondary_color,
    settings: theme?.settings as any,
  };
};
