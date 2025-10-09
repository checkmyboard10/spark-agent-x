import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const MessageNode = ({ data, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState((data.message as string) || '');
  const [nodeLabel, setNodeLabel] = useState((data.label as string) || 'Mensagem');

  const handleSave = () => {
    data.message = message;
    data.label = nodeLabel;
    setIsEditing(false);
  };

  return (
    <>
      <div className="px-6 py-4 shadow-lg rounded-lg bg-card border-2 border-primary min-w-[200px] max-w-[300px] hover:shadow-xl transition-shadow">
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-primary border-2 border-background"
        />
        
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Mensagem
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="text-sm font-semibold text-foreground mb-1">{String(nodeLabel)}</div>
        {message && (
          <div className="text-xs text-muted-foreground line-clamp-2 mt-2 p-2 bg-muted/50 rounded">
            {String(message)}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-primary border-2 border-background"
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
