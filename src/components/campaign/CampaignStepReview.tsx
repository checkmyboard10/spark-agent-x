import { useState } from "react";
import { CheckCircle2, Calendar, Users, MessageSquare, Clock, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignFormData } from "../CampaignDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StepProps {
  formData: CampaignFormData;
  onSuccess: () => void;
}

const CampaignStepReview = ({ formData, onSuccess }: StepProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          name: formData.name,
          client_id: formData.clientId,
          agent_id: formData.agentId,
          template: formData.template,
          scheduled_at: formData.scheduledAt?.toISOString(),
          status: "draft",
          followups: formData.followups,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Process CSV
      const { data, error: csvError } = await supabase.functions.invoke("process-csv", {
        body: {
          campaignId: campaign.id,
          csvContent: formData.csvContent,
        },
      });

      if (csvError) throw csvError;

      // Update campaign status to scheduled
      await supabase
        .from("campaigns")
        .update({ status: "scheduled" })
        .eq("id", campaign.id);

      toast.success("Campanha criada e agendada com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error("Erro ao criar campanha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Revisão Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Nome da Campanha</p>
                <p className="text-sm text-muted-foreground">{formData.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data Agendada</p>
                <p className="text-sm text-muted-foreground">
                  {formData.scheduledAt
                    ? format(formData.scheduledAt, "PPP 'às' HH:mm", { locale: ptBR })
                    : "Não definida"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Total de Contatos</p>
                <p className="text-sm text-muted-foreground">
                  {formData.csvPreview.length} contatos serão contatados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Template da Mensagem</p>
                <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                  {formData.template}
                </div>
              </div>
            </div>

            {formData.followups.length > 0 && (
              <div className="flex items-start gap-3">
                <Send className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Follow-ups Configurados</p>
                  <div className="space-y-2">
                    {formData.followups.map((followup, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-medium mb-1">
                          Follow-up {index + 1} - Após {followup.delayHours}h
                        </p>
                        <p className="text-xs text-muted-foreground">{followup.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>Criando campanha...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Confirmar e Agendar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignStepReview;
