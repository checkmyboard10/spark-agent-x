import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAgencyTheme } from "@/hooks/useAgencyTheme";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Upload } from "lucide-react";
import { AgencyLogo } from "@/components/AgencyLogo";

export const AppearanceSettings = () => {
  const { theme, logoUrl } = useAgencyTheme();
  const { canManageSettings } = usePermissions();
  const [primaryColor, setPrimaryColor] = useState(theme?.primary_color || "160 84% 39%");
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondary_color || "186 100% 46%");
  const [uploading, setUploading] = useState(false);

  if (!canManageSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Você não tem permissão para editar estas configurações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-agency-logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Logo enviado com sucesso!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar logo');
    } finally {
      setUploading(false);
    }
  };

  const handleThemeUpdate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-agency-theme`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            primary_color: primaryColor,
            secondary_color: secondaryColor,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Tema atualizado com sucesso!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar tema');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo da Agência</CardTitle>
          <CardDescription>
            Faça upload do logo da sua agência (PNG, JPG ou SVG, máx 2MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <AgencyLogo size="lg" />
            <div>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
                id="logo-upload"
              />
              <Label htmlFor="logo-upload">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Enviando...' : 'Escolher Arquivo'}
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores do Tema</CardTitle>
          <CardDescription>
            Personalize as cores da sua agência (formato HSL)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex gap-2">
              <div 
                className="w-12 h-10 rounded border"
                style={{ backgroundColor: `hsl(${primaryColor})` }}
              />
              <Input
                id="primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="160 84% 39%"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Formato: "H S% L%" (ex: "160 84% 39%")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Cor Secundária</Label>
            <div className="flex gap-2">
              <div 
                className="w-12 h-10 rounded border"
                style={{ backgroundColor: `hsl(${secondaryColor})` }}
              />
              <Input
                id="secondary-color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="186 100% 46%"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Formato: "H S% L%" (ex: "186 100% 46%")
            </p>
          </div>

          <Button onClick={handleThemeUpdate}>
            Salvar Tema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
