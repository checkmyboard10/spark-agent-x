import { useState, useEffect } from "react";
import { Plus, Calendar, Users, Send, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import CampaignDialog from "@/components/CampaignDialog";

interface Campaign {
  id: string;
  name: string;
  status: string;
  scheduled_at: string | null;
  total_contacts: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  created_at: string;
  clients: { name: string };
  agents: { name: string };
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          clients!inner(name),
          agents!inner(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar campanhas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      draft: { variant: "secondary", icon: Clock, label: "Rascunho" },
      scheduled: { variant: "default", icon: Calendar, label: "Agendada" },
      sending: { variant: "default", icon: Send, label: "Enviando" },
      completed: { variant: "default", icon: CheckCircle2, label: "Concluída" },
      failed: { variant: "destructive", icon: XCircle, label: "Falhou" },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleCampaignCreated = () => {
    setIsDialogOpen(false);
    fetchCampaigns();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Campanhas WhatsApp
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas campanhas de mensagens em massa
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Send className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma campanha criada</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Crie sua primeira campanha para começar a enviar mensagens em massa via WhatsApp
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-all hover-scale">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Users className="h-3 w-3" />
                      {campaign.clients.name} • {campaign.agents.name}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(campaign.scheduled_at), "dd/MM/yyyy 'às' HH:mm")}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">
                      {campaign.sent_count}/{campaign.total_contacts}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${campaign.total_contacts > 0 
                          ? (campaign.sent_count / campaign.total_contacts) * 100 
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Enviados</div>
                    <div className="text-sm font-semibold text-success">{campaign.sent_count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Entregues</div>
                    <div className="text-sm font-semibold text-blue-500">{campaign.delivered_count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Falharam</div>
                    <div className="text-sm font-semibold text-destructive">{campaign.failed_count}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CampaignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCampaignCreated}
      />
    </div>
  );
};

export default Campaigns;
