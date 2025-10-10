import { ArrowLeft, Save, Play, GitBranch, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

interface FlowToolbarProps {
  flowName: string;
  isActive: boolean;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onActiveToggle: (active: boolean) => void;
  onSave: () => void;
  onAutoLayout: () => void;
  agentId: string;
  lastSaved?: Date | null;
}

export const FlowToolbar = ({
  flowName,
  isActive,
  isSaving,
  onNameChange,
  onActiveToggle,
  onSave,
  onAutoLayout,
  agentId,
  lastSaved,
}: FlowToolbarProps) => {
  const navigate = useNavigate();
  
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Salvo agora';
    if (diff < 3600) return `Salvo há ${Math.floor(diff / 60)}min`;
    return `Salvo há ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div className="border-b bg-card px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/agents`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex flex-col gap-1">
          <Input
            value={flowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-64 font-semibold"
            placeholder="Digite o nome do flow..."
            maxLength={100}
          />
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-muted-foreground">
              {flowName.length}/100 caracteres
            </span>
            {lastSaved && (
              <span className="text-[10px] text-muted-foreground">
                {formatLastSaved()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="flow-active"
            checked={isActive}
            onCheckedChange={onActiveToggle}
          />
          <Label htmlFor="flow-active" className="text-sm">
            {isActive ? 'Ativo' : 'Inativo'}
          </Label>
        </div>

        <div className="h-8 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          onClick={onAutoLayout}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Auto Layout
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled
        >
          <Play className="h-4 w-4 mr-2" />
          Testar
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar
        </Button>
      </div>
    </div>
  );
};
