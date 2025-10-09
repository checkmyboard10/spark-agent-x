import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Grid3x3, 
  Magnet, 
  Image, 
  Undo, 
  Redo, 
  Save,
  Download,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FlowQuickActionsProps {
  showGrid: boolean;
  snapToGrid: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onExport: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const FlowQuickActions = ({
  showGrid,
  snapToGrid,
  onToggleGrid,
  onToggleSnap,
  onExport,
  onSave,
  isSaving,
}: FlowQuickActionsProps) => {
  return (
    <Card className="absolute top-4 right-4 z-10 p-2 shadow-lg">
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="grid"
              checked={showGrid}
              onCheckedChange={onToggleGrid}
            />
            <Label htmlFor="grid" className="text-sm cursor-pointer">
              Grid
            </Label>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2 px-2">
            <Magnet className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="snap"
              checked={snapToGrid}
              onCheckedChange={onToggleSnap}
            />
            <Label htmlFor="snap" className="text-sm cursor-pointer">
              Snap
            </Label>
          </div>

          <div className="h-6 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exportar PNG</TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Salvar (Ctrl+S)</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Card>
  );
};
