import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  AiNodeData, 
  MessageNodeData, 
  ConditionNodeData, 
  WaitNodeData, 
  HttpNodeData, 
  VariableNodeData 
} from '@/types/flow';

interface NodeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node | null;
  onSave: (nodeId: string, data: any) => void;
}

export const NodeEditDialog = ({ open, onOpenChange, node, onSave }: NodeEditDialogProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node) {
      setFormData({ ...node.data });
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    // Validation
    if (node.type === 'ai') {
      if (!formData.model || !formData.prompt?.trim()) {
        toast.error('Modelo e prompt são obrigatórios');
        return;
      }
    }

    onSave(node.id, formData);
    toast.success('Nó atualizado com sucesso!');
    onOpenChange(false);
  };

  const renderAiNodeForm = (data: AiNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Nome do Nó</Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Ex: Gerar Resposta"
        />
      </div>

      <div>
        <Label htmlFor="model">Modelo de IA</Label>
        <Select
          value={formData.model || 'google/gemini-2.5-flash'}
          onValueChange={(value) => setFormData({ ...formData, model: value })}
        >
          <SelectTrigger id="model">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google/gemini-2.5-flash">
              Gemini 2.5 Flash (Recomendado - Gratuito)
            </SelectItem>
            <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
            <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
            <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
            <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="prompt">
          Prompt {formData.prompt && <span className="text-muted-foreground">({formData.prompt.length} caracteres)</span>}
        </Label>
        <Textarea
          id="prompt"
          value={formData.prompt || ''}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          rows={8}
          placeholder="Ex: Você é um assistente útil que responde perguntas sobre..."
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="temperature">
          Temperatura (Criatividade): {formData.temperature ?? 0.7}
        </Label>
        <Slider
          id="temperature"
          value={[formData.temperature ?? 0.7]}
          onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
          min={0}
          max={2}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Preciso (0)</span>
          <span>Balanceado (1)</span>
          <span>Criativo (2)</span>
        </div>
      </div>

      <div>
        <Label htmlFor="maxTokens">Tokens Máximos</Label>
        <Input
          id="maxTokens"
          type="number"
          value={formData.maxTokens ?? 1000}
          onChange={(e) => setFormData({ ...formData, maxTokens: Number(e.target.value) })}
          min={1}
          max={4000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Define o tamanho máximo da resposta (1 token ≈ 4 caracteres)
        </p>
      </div>

      <div>
        <Label htmlFor="saveResponseTo">Salvar resposta em (variável)</Label>
        <Input
          id="saveResponseTo"
          value={formData.saveResponseTo || ''}
          onChange={(e) => setFormData({ ...formData, saveResponseTo: e.target.value })}
          placeholder="Ex: resposta_ia"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {"{{nome_da_variavel}}"} para acessar a resposta depois
        </p>
      </div>
    </div>
  );

  const renderMessageNodeForm = (data: MessageNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Nome do Nó</Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          value={formData.message || ''}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          placeholder="Digite a mensagem..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {"{{variavel}}"} para inserir variáveis
        </p>
      </div>

      <div>
        <Label htmlFor="type">Tipo de Mensagem</Label>
        <Select
          value={formData.type || 'text'}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="media">Mídia</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderConditionNodeForm = (data: ConditionNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Nome do Nó</Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="variable">Variável</Label>
        <Input
          id="variable"
          value={formData.variable || ''}
          onChange={(e) => setFormData({ ...formData, variable: e.target.value })}
          placeholder="Ex: user_name"
        />
      </div>

      <div>
        <Label htmlFor="operator">Operador</Label>
        <Select
          value={formData.operator || '=='}
          onValueChange={(value) => setFormData({ ...formData, operator: value })}
        >
          <SelectTrigger id="operator">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="==">Igual (==)</SelectItem>
            <SelectItem value="!=">Diferente (!=)</SelectItem>
            <SelectItem value=">">Maior que (&gt;)</SelectItem>
            <SelectItem value="<">Menor que (&lt;)</SelectItem>
            <SelectItem value=">=">Maior ou igual (&gt;=)</SelectItem>
            <SelectItem value="<=">Menor ou igual (&lt;=)</SelectItem>
            <SelectItem value="contains">Contém</SelectItem>
            <SelectItem value="startsWith">Começa com</SelectItem>
            <SelectItem value="endsWith">Termina com</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Valor</Label>
        <Input
          id="value"
          value={formData.value || ''}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="Ex: sim"
        />
      </div>
    </div>
  );

  const renderWaitNodeForm = (data: WaitNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Nome do Nó</Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="duration">Duração</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration ?? 1}
          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          min={1}
        />
      </div>

      <div>
        <Label htmlFor="unit">Unidade</Label>
        <Select
          value={formData.unit || 'seconds'}
          onValueChange={(value) => setFormData({ ...formData, unit: value })}
        >
          <SelectTrigger id="unit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Segundos</SelectItem>
            <SelectItem value="minutes">Minutos</SelectItem>
            <SelectItem value="hours">Horas</SelectItem>
            <SelectItem value="days">Dias</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderHttpNodeForm = (data: HttpNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Nome do Nó</Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://api.exemplo.com/endpoint"
        />
      </div>

      <div>
        <Label htmlFor="method">Método</Label>
        <Select
          value={formData.method || 'GET'}
          onValueChange={(value) => setFormData({ ...formData, method: value })}
        >
          <SelectTrigger id="method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="saveResponseTo">Salvar resposta em</Label>
        <Input
          id="saveResponseTo"
          value={formData.saveResponseTo || ''}
          onChange={(e) => setFormData({ ...formData, saveResponseTo: e.target.value })}
          placeholder="Ex: api_response"
        />
      </div>
    </div>
  );

  const renderVariableNodeForm = (data: VariableNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Nome do Nó</Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="variableName">Nome da Variável</Label>
        <Input
          id="variableName"
          value={formData.variableName || ''}
          onChange={(e) => setFormData({ ...formData, variableName: e.target.value })}
          placeholder="Ex: contador"
        />
      </div>

      <div>
        <Label htmlFor="operation">Operação</Label>
        <Select
          value={formData.operation || 'set'}
          onValueChange={(value) => setFormData({ ...formData, operation: value })}
        >
          <SelectTrigger id="operation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="set">Definir</SelectItem>
            <SelectItem value="increment">Incrementar</SelectItem>
            <SelectItem value="append">Adicionar</SelectItem>
            <SelectItem value="clear">Limpar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Valor</Label>
        <Input
          id="value"
          value={formData.value || ''}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="Ex: 0"
        />
      </div>
    </div>
  );

  const getNodeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ai: 'IA Response',
      message: 'Mensagem',
      condition: 'Condição',
      wait: 'Aguardar',
      http: 'Requisição HTTP',
      variable: 'Variável',
      agent: 'Agente',
      start: 'Início',
      end: 'Fim',
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Nó: {getNodeTypeLabel(node.type || '')}</DialogTitle>
          <DialogDescription>
            Configure as propriedades do nó. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {node.type === 'ai' && renderAiNodeForm(formData as AiNodeData)}
          {node.type === 'message' && renderMessageNodeForm(formData as MessageNodeData)}
          {node.type === 'condition' && renderConditionNodeForm(formData as ConditionNodeData)}
          {node.type === 'wait' && renderWaitNodeForm(formData as WaitNodeData)}
          {node.type === 'http' && renderHttpNodeForm(formData as HttpNodeData)}
          {node.type === 'variable' && renderVariableNodeForm(formData as VariableNodeData)}
          
          {!['ai', 'message', 'condition', 'wait', 'http', 'variable'].includes(node.type || '') && (
            <div className="text-center text-muted-foreground py-8">
              Este tipo de nó não pode ser editado.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
