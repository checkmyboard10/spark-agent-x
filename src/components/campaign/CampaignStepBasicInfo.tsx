import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "../CampaignDialog";

interface StepProps {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

const CampaignStepBasicInfo = ({ formData, updateFormData }: StepProps) => {
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      fetchAgents(formData.clientId);
    }
  }, [formData.clientId]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .eq("active", true)
      .order("name");
    setClients(data || []);
  };

  const fetchAgents = async (clientId: string) => {
    const { data } = await supabase
      .from("agents")
      .select("id, name")
      .eq("client_id", clientId)
      .eq("active", true)
      .order("name");
    setAgents(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Campanha</Label>
        <Input
          id="name"
          placeholder="Ex: Campanha de Boas-vindas"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Cliente</Label>
        <Select
          value={formData.clientId}
          onValueChange={(value) => {
            updateFormData({ clientId: value, agentId: "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent">Agente Responsável</Label>
        <Select
          value={formData.agentId}
          onValueChange={(value) => updateFormData({ agentId: value })}
          disabled={!formData.clientId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o agente" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Data e Hora Agendada</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.scheduledAt && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.scheduledAt ? (
                format(formData.scheduledAt, "PPP 'às' HH:mm", { locale: ptBR })
              ) : (
                <span>Selecione a data e hora</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.scheduledAt}
              onSelect={(date) => updateFormData({ scheduledAt: date })}
              initialFocus
              className="pointer-events-auto"
            />
            <div className="p-3 border-t">
              <Input
                type="time"
                value={formData.scheduledAt ? format(formData.scheduledAt, "HH:mm") : ""}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newDate = formData.scheduledAt ? new Date(formData.scheduledAt) : new Date();
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  updateFormData({ scheduledAt: newDate });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default CampaignStepBasicInfo;
