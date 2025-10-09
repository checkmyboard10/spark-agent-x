import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface WebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: any;
  clientId: string;
}

const AVAILABLE_EVENTS = [
  { value: 'message.received', label: 'Mensagem Recebida' },
  { value: 'message.sent', label: 'Mensagem Enviada' },
  { value: 'campaign.started', label: 'Campanha Iniciada' },
  { value: 'campaign.completed', label: 'Campanha Concluída' },
  { value: 'contact.created', label: 'Contato Criado' },
  { value: 'agent.response', label: 'Resposta do Agente' },
];

export default function WebhookDialog({ open, onOpenChange, webhook, clientId }: WebhookDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
  });

  useEffect(() => {
    if (webhook) {
      setFormData({
        name: webhook.name,
        url: webhook.url,
        secret: webhook.secret,
        events: webhook.events || [],
      });
    } else {
      // Generate new secret for new webhooks
      setFormData({
        name: '',
        url: '',
        secret: crypto.randomUUID(),
        events: [],
      });
    }
  }, [webhook, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name || !formData.url || formData.events.length === 0) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      const webhookData = {
        ...formData,
        client_id: clientId,
      };

      if (webhook) {
        // Update existing webhook
        const { error } = await supabase
          .from('webhooks')
          .update(webhookData)
          .eq('id', webhook.id);

        if (error) throw error;

        toast({
          title: "Webhook atualizado",
          description: "O webhook foi atualizado com sucesso",
        });
      } else {
        // Create new webhook
        const { error } = await supabase
          .from('webhooks')
          .insert(webhookData);

        if (error) throw error;

        toast({
          title: "Webhook criado",
          description: "O webhook foi criado com sucesso",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar webhook",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(formData.secret);
    toast({
      title: "Copiado!",
      description: "Secret copiado para a área de transferência",
    });
  };

  const toggleEvent = (eventValue: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{webhook ? 'Editar' : 'Novo'} Webhook</DialogTitle>
          <DialogDescription>
            Configure um webhook para receber notificações em tempo real
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Sistema CRM"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL de Destino</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://seu-dominio.com/webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Secret (HMAC)</Label>
            <div className="flex gap-2">
              <Input
                id="secret"
                value={formData.secret}
                readOnly
                className="font-mono text-xs"
              />
              <Button type="button" variant="outline" size="icon" onClick={copySecret}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use este secret para validar a assinatura HMAC-SHA256 dos payloads
            </p>
          </div>

          <div className="space-y-2">
            <Label>Eventos</Label>
            <div className="space-y-2 border rounded-md p-3 max-h-[200px] overflow-y-auto">
              {AVAILABLE_EVENTS.map((event) => (
                <div key={event.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={event.value}
                    checked={formData.events.includes(event.value)}
                    onCheckedChange={() => toggleEvent(event.value)}
                  />
                  <label
                    htmlFor={event.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {event.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {webhook ? 'Atualizar' : 'Criar'} Webhook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
