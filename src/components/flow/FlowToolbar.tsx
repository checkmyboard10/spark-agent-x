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
}: FlowToolbarProps) => {
  const navigate = useNavigate();

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
        
        <div className="flex items-center gap-2">
          <Input
            value={flowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-64 font-semibold"
            placeholder="Nome do fluxo"
          />
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
