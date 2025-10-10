import { useState } from 'react';
import { Variable, Plus, Search, Trash2, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlowVariables } from '@/hooks/useFlowVariables';
import { Node } from '@xyflow/react';
import { FlowVariable, VariableType } from '@/types/flow';
import { toast } from 'sonner';

interface FlowVariablesPanelProps {
  nodes: Node[];
}

export const FlowVariablesPanel = ({ nodes }: FlowVariablesPanelProps) => {
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVar, setNewVar] = useState<Partial<FlowVariable>>({
    name: '',
    type: 'string',
    description: '',
    defaultValue: '',
  });
  
  const {
    systemVariables,
    capturedVariables,
    customVariables,
    undefinedVariables,
    addCustomVariable,
    removeCustomVariable,
  } = useFlowVariables(nodes);

  const filterVariables = (vars: FlowVariable[]) => {
    if (!search) return vars;
    return vars.filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const copyVariableName = (name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    toast.success(`Copiado: {{${name}}}`);
  };

  const handleAddVariable = () => {
    if (!newVar.name) {
      toast.error('Nome da variável é obrigatório');
      return;
    }
    
    addCustomVariable({
      name: newVar.name,
      type: newVar.type as VariableType,
      description: newVar.description,
      defaultValue: newVar.defaultValue,
    });
    
    setIsAddDialogOpen(false);
    setNewVar({ name: '', type: 'string', description: '', defaultValue: '' });
    toast.success('Variável criada com sucesso');
  };

  const categoryColors = {
    system: 'bg-blue-500',
    captured: 'bg-green-500',
    custom: 'bg-purple-500',
  };

  const categoryLabels = {
    system: 'Sistema',
    captured: 'Capturada',
    custom: 'Customizada',
  };

  const VariableItem = ({ variable }: { variable: FlowVariable }) => (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <code className="text-sm font-mono font-semibold">{`{{${variable.name}}}`}</code>
          <Badge variant="secondary" className={`${categoryColors[variable.category]} text-white text-[10px] px-1.5 py-0`}>
            {categoryLabels[variable.category]}
          </Badge>
        </div>
        {variable.description && (
          <p className="text-xs text-muted-foreground">{variable.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => copyVariableName(variable.name)}
        >
          <Copy className="h-3 w-3" />
        </Button>
        {variable.category === 'custom' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => removeCustomVariable(variable.name)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Variable className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Variáveis</CardTitle>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Variável Customizada</DialogTitle>
                <DialogDescription>
                  Adicione uma nova variável personalizada ao flow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Variável</Label>
                  <Input
                    placeholder="ex: usuario_nome"
                    value={newVar.name}
                    onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newVar.type}
                    onValueChange={(value) => setNewVar({ ...newVar, type: value as VariableType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="boolean">Verdadeiro/Falso</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="object">Objeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    placeholder="Descreva o propósito da variável"
                    value={newVar.description}
                    onChange={(e) => setNewVar({ ...newVar, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Padrão (opcional)</Label>
                  <Input
                    placeholder="Valor inicial"
                    value={newVar.defaultValue}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddVariable}>Criar Variável</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Gerencie as variáveis do flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar variáveis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {undefinedVariables.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-destructive">⚠️ Não Definidas</h4>
                <div className="space-y-2">
                  {undefinedVariables.map(varName => (
                    <div key={varName} className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
                      <code className="text-destructive font-mono">{`{{${varName}}}`}</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Variável usada mas não definida
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-2">Sistema</h4>
              <div className="space-y-2">
                {filterVariables(systemVariables).map(variable => (
                  <VariableItem key={variable.name} variable={variable} />
                ))}
              </div>
            </div>

            {capturedVariables.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Capturadas</h4>
                <div className="space-y-2">
                  {filterVariables(capturedVariables).map(variable => (
                    <VariableItem key={variable.name} variable={variable} />
                  ))}
                </div>
              </div>
            )}

            {customVariables.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Customizadas</h4>
                <div className="space-y-2">
                  {filterVariables(customVariables).map(variable => (
                    <VariableItem key={variable.name} variable={variable} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
