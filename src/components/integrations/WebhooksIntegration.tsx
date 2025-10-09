import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WebhookDialog from "./WebhookDialog";
import WebhookCard from "./WebhookCard";
import WebhookLogsDialog from "./WebhookLogsDialog";

export default function WebhooksIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const [logsDialogWebhookId, setLogsDialogWebhookId] = useState<string | null>(null);

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Set first client as selected by default
  useEffect(() => {
    if (clients && clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0].id);
    }
  }, [clients, selectedClient]);

  // Fetch webhooks
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('client_id', selectedClient)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClient,
  });

  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook);
    setIsDialogOpen(true);
  };

  const handleDelete = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: "Webhook removido",
        description: "O webhook foi removido com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover webhook",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (webhookId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ active: !active })
        .eq('id', webhookId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: active ? "Webhook desativado" : "Webhook ativado",
        description: `O webhook foi ${active ? 'desativado' : 'ativado'} com sucesso`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks para receber notificações em tempo real sobre eventos importantes
              </CardDescription>
            </div>
            <Button onClick={() => {
              setEditingWebhook(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              disabled={isLoading}
            >
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Webhooks List */}
          {webhooks && webhooks.length > 0 ? (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onViewLogs={(id) => setLogsDialogWebhookId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                Nenhum webhook configurado ainda
              </p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Webhook
              </Button>
            </div>
          )}

          {/* Available Events Info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Eventos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">message.received</Badge>
                <Badge variant="outline">message.sent</Badge>
                <Badge variant="outline">campaign.started</Badge>
                <Badge variant="outline">campaign.completed</Badge>
                <Badge variant="outline">contact.created</Badge>
                <Badge variant="outline">agent.response</Badge>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Webhook Dialog */}
      <WebhookDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        webhook={editingWebhook}
        clientId={selectedClient}
      />

      {/* Logs Dialog */}
      {logsDialogWebhookId && (
        <WebhookLogsDialog
          open={!!logsDialogWebhookId}
          onOpenChange={(open) => !open && setLogsDialogWebhookId(null)}
          webhookId={logsDialogWebhookId}
        />
      )}
    </div>
  );
}
