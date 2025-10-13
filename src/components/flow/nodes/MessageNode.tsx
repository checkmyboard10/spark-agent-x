import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, Settings, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageNodeData } from '@/types/flow';
import { getColorScheme } from '@/lib/flowColorSchemes';

const MessageNode = ({ data, id, selected }: NodeProps) => {
  const nodeData = data as unknown as MessageNodeData;
  const colorScheme = getColorScheme(nodeData.color);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState((data.message as string) || '');
  const [nodeLabel, setNodeLabel] = useState((data.label as string) || 'Mensagem');
  
  // Detect if message contains variables
  const hasVariables = /\{\{[^}]+\}\}/.test(message);

  const handleSave = () => {
    data.message = message;
    data.label = nodeLabel;
    setIsEditing(false);
  };

  return (
    <>
      <div className={`px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br ${colorScheme.gradient} border-2 ${colorScheme.border} min-w-[200px] max-w-[300px] hover:shadow-xl transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`}>
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-blue-300 border-2 border-white"
        />
        
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs font-medium text-white/80 uppercase tracking-wide">
              Mensagem
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-white/80" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-white">{String(nodeLabel)}</div>
          {hasVariables && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/20 text-white border-white/30">
              <Code className="h-2.5 w-2.5 mr-0.5" />
              Var
            </Badge>
          )}
        </div>
        {message && (
          <div className="text-xs text-white/90 line-clamp-2 mt-2 p-2 bg-black/20 rounded">
            {String(message)}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-blue-300 border-2 border-white"
        />
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Mensagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Nome do Nó</Label>
              <Input
                id="node-label"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="Ex: Saudação inicial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-content">Mensagem</Label>
              <Textarea
                id="message-content"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Use variáveis como {'{{'} contact.name {'}}'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(MessageNode);
