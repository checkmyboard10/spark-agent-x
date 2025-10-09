import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AgentData {
  label: string;
  agentId?: string;
  agentName?: string;
  maxTurns?: number;
  handoffCondition?: string;
  contextVariables?: string[];
}

const AgentNode = ({ data, selected }: NodeProps) => {
  const agentData = data as unknown as AgentData;
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<AgentData>(agentData);

  const handleSave = () => {
    Object.assign(data, editedData);
    setIsEditing(false);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card
        className={`min-w-[280px] cursor-pointer transition-all ${
          selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={() => setIsEditing(true)}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-sm">{agentData.label}</span>
            <Settings className="h-4 w-4 ml-auto text-muted-foreground" />
          </div>
          
          {agentData.agentName ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {agentData.agentName}
                </Badge>
              </div>
              
              {agentData.maxTurns && (
                <div className="text-muted-foreground">
                  Máx: {agentData.maxTurns} mensagens
                </div>
              )}
              
              {agentData.contextVariables && agentData.contextVariables.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Contexto: {agentData.contextVariables.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              Clique para configurar agente
            </div>
          )}
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Delegação de Agente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Nome do Nó</Label>
              <Input
                id="label"
                value={editedData.label}
                onChange={(e) => setEditedData({ ...editedData, label: e.target.value })}
                placeholder="Ex: Suporte Técnico"
              />
            </div>

            <div>
              <Label htmlFor="agent">Agente</Label>
              <Select
                value={editedData.agentId}
                onValueChange={(value) => {
                  setEditedData({ 
                    ...editedData, 
                    agentId: value,
                    agentName: value // Simplificado - em produção buscar nome real
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar agente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent-1">Agente de Vendas</SelectItem>
                  <SelectItem value="agent-2">Agente de Suporte</SelectItem>
                  <SelectItem value="agent-3">Agente de Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxTurns">Máximo de Mensagens (opcional)</Label>
              <Input
                id="maxTurns"
                type="number"
                value={editedData.maxTurns || ''}
                onChange={(e) => setEditedData({ 
                  ...editedData, 
                  maxTurns: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Ex: 10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número máximo de interações antes de retornar ao fluxo
              </p>
            </div>

            <div>
              <Label htmlFor="handoff">Condição de Retorno (opcional)</Label>
              <Textarea
                id="handoff"
                value={editedData.handoffCondition || ''}
                onChange={(e) => setEditedData({ 
                  ...editedData, 
                  handoffCondition: e.target.value 
                })}
                placeholder="Ex: problema resolvido, escalar para humano"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="context">Variáveis de Contexto (opcional)</Label>
              <Input
                id="context"
                value={editedData.contextVariables?.join(', ') || ''}
                onChange={(e) => setEditedData({ 
                  ...editedData, 
                  contextVariables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                })}
                placeholder="Ex: cliente.nome, ticket.id"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variáveis a serem passadas para o agente (separadas por vírgula)
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(AgentNode);
