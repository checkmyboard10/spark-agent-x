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
import { ColorPicker } from "@/components/ui/color-picker";

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

  const validateHSL = (color: string): boolean => {
    // Format: "H S% L%" where H is 0-360, S and L are 0-100
    const hslRegex = /^(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%$/;
    const match = color.match(hslRegex);
    
    if (!match) return false;
    
    const [, h, s, l] = match.map(Number);
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
  };

  const handleThemeUpdate = async () => {
    // Validate colors before sending
    if (!validateHSL(primaryColor)) {
      toast.error('Cor primária inválida. Use o formato: "H S% L%" (ex: "160 84% 39%")');
      return;
    }

    if (!validateHSL(secondaryColor)) {
      toast.error('Cor secundária inválida. Use o formato: "H S% L%" (ex: "186 100% 46%")');
      return;
    }

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
          <ColorPicker
            label="Cor Primária"
            value={primaryColor}
            onChange={setPrimaryColor}
            showInput={true}
          />

          <ColorPicker
            label="Cor Secundária"
            value={secondaryColor}
            onChange={setSecondaryColor}
            showInput={true}
          />

          <Button onClick={handleThemeUpdate}>
            Salvar Tema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
