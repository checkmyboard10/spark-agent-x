import { useState } from 'react';
import { Settings, Palette, Grid3x3, Save, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { nodeColorSchemes } from '@/lib/flowColorSchemes';
import { toast } from 'sonner';

interface FlowSettingsProps {
  showGrid: boolean;
  snapToGrid: boolean;
  onToggleGrid: (value: boolean) => void;
  onToggleSnap: (value: boolean) => void;
  onExportFlow?: () => void;
  onImportFlow?: () => void;
}

export const FlowSettings = ({
  showGrid,
  snapToGrid,
  onToggleGrid,
  onToggleSnap,
  onExportFlow,
  onImportFlow,
}: FlowSettingsProps) => {
  const [defaultColor, setDefaultColor] = useState('default');
  const [gridSpacing, setGridSpacing] = useState([15]);
  const [autoSave, setAutoSave] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState('30');

  const handleExport = () => {
    if (onExportFlow) {
      onExportFlow();
    } else {
      toast.info('Exportação será implementada em breve');
    }
  };

  const handleImport = () => {
    if (onImportFlow) {
      onImportFlow();
    } else {
      toast.info('Importação será implementada em breve');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Configurações do Editor</CardTitle>
        </div>
        <CardDescription>
          Personalize a aparência e comportamento do editor de flows
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cores Padrão */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Cores Padrão dos Nós</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-color" className="text-xs">
              Cor padrão para novos nós
            </Label>
            <Select value={defaultColor} onValueChange={setDefaultColor}>
              <SelectTrigger id="default-color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nodeColorSchemes.map((scheme) => (
                  <SelectItem key={scheme.value} value={scheme.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${scheme.gradient}`} />
                      {scheme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Grade e Alinhamento */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Grade e Alinhamento</Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-grid" className="text-sm">
                Mostrar grade
              </Label>
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={onToggleGrid}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="snap-grid" className="text-sm">
                Encaixar na grade
              </Label>
              <Switch
                id="snap-grid"
                checked={snapToGrid}
                onCheckedChange={onToggleSnap}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grid-spacing" className="text-xs">
                Espaçamento da grade: {gridSpacing}px
              </Label>
              <Slider
                id="grid-spacing"
                value={gridSpacing}
                onValueChange={setGridSpacing}
                min={10}
                max={30}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Auto-save */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Salvamento Automático</Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="text-sm">
                Ativar auto-save
              </Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            {autoSave && (
              <div className="space-y-2">
                <Label htmlFor="auto-save-interval" className="text-xs">
                  Intervalo de salvamento
                </Label>
                <Select value={autoSaveInterval} onValueChange={setAutoSaveInterval}>
                  <SelectTrigger id="auto-save-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 segundos</SelectItem>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="120">2 minutos</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Exportar/Importar */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Exportar / Importar</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Importe ou exporte o flow no formato JSON
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
