import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function WhatsAppIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string>("");

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

  // Fetch WhatsApp connection
  const { data: connection, isLoading } = useQuery({
    queryKey: ['whatsapp-connection', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('client_id', selectedClient)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClient,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if status is 'connecting'
      return query.state.data?.status === 'connecting' ? 2000 : false;
    },
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('connect-whatsapp', {
        body: { clientId: selectedClient },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast({
        title: "Conectando...",
        description: "Aguarde enquanto geramos seu QR Code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao conectar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('disconnect-whatsapp', {
        body: { clientId: selectedClient },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao desconectar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = () => {
    if (!connection) {
      return <Badge variant="secondary">Desconectado</Badge>;
    }

    switch (connection.status) {
      case 'connected':
        return <Badge className="bg-[#25D366] text-white hover:bg-[#25D366]/90">Conectado</Badge>;
      case 'connecting':
        return <Badge variant="secondary">Conectando...</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!connection || connection.status === 'disconnected') {
      return <XCircle className="h-12 w-12 text-muted-foreground" />;
    }

    if (connection.status === 'connecting') {
      return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    }

    return <CheckCircle2 className="h-12 w-12 text-[#25D366]" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business</CardTitle>
          <CardDescription>
            Conecte sua conta do WhatsApp Business para receber e enviar mensagens automaticamente
          </CardDescription>
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

          {/* Status Section */}
          <div className="flex items-center justify-between p-6 border rounded-lg">
            <div className="flex items-center gap-4">
              {getStatusIcon()}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Status da Conexão</p>
                  {getStatusBadge()}
                </div>
                {connection?.phone_number && (
                  <p className="text-sm text-muted-foreground">{connection.phone_number}</p>
                )}
                {connection?.connected_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Conectado desde {new Date(connection.connected_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <div>
              {!connection || connection.status === 'disconnected' ? (
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending || !selectedClient}
                >
                  {connectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Conectar WhatsApp
                </Button>
              ) : connection.status === 'connected' ? (
                <Button
                  variant="destructive"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Desconectar
                </Button>
              ) : null}
            </div>
          </div>

          {/* QR Code Section */}
          {connection?.status === 'connecting' && connection.qr_code && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code para Conexão
                </CardTitle>
                <CardDescription>
                  Escaneie este código com o WhatsApp no seu celular
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-6 rounded-lg">
                  <div className="font-mono text-xs break-all max-w-md">
                    {connection.qr_code}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  1. Abra o WhatsApp no seu celular<br />
                  2. Vá em Configurações → Aparelhos conectados<br />
                  3. Toque em "Conectar um aparelho"<br />
                  4. Aponte para este código
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Nota:</strong> Esta é uma simulação de conexão WhatsApp. Em produção, você precisará
                integrar com a API oficial do WhatsApp Business ou usar um provedor como Twilio, MessageBird, etc.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
