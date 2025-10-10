import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateFlowDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateFlowDialogProps) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    agentId: "",
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) return [];

      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .eq("agency_id", profile.agency_id)
        .order("name");

      return data || [];
    },
    enabled: open,
  });

  // Fetch agents for selected client
  const { data: agents = [] } = useQuery({
    queryKey: ["agents", formData.clientId],
    queryFn: async () => {
      if (!formData.clientId) return [];

      const { data } = await supabase
        .from("agents")
        .select("id, name")
        .eq("client_id", formData.clientId)
        .order("name");

      return data || [];
    },
    enabled: !!formData.clientId && open,
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do flow é obrigatório");
      return;
    }

    if (!formData.agentId) {
      toast.error("Selecione um agente para o flow");
      return;
    }

    setCreating(true);
    try {
      // Create flow with initial start node
      const { data: newFlow, error } = await supabase
        .from("agent_flows")
        .insert({
          agent_id: formData.agentId,
          name: formData.name,
          description: formData.description || null,
          nodes: [
            {
              id: "start",
              type: "start",
              position: { x: 250, y: 50 },
              data: { label: "Início" },
            },
          ],
          edges: [],
          variables: {},
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Flow criado com sucesso!");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        clientId: "",
        agentId: "",
      });

      // Navigate to editor
      navigate(`/flows/editor/${formData.agentId}/${newFlow.id}`);
    } catch (error) {
      console.error("Error creating flow:", error);
      toast.error("Erro ao criar flow");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Flow</DialogTitle>
          <DialogDescription>
            Configure as informações básicas do seu flow de automação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Nome do Flow *</Label>
            <Input
              id="name"
              placeholder="Ex: Flow de Boas-vindas"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito deste flow..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="client">Cliente *</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) =>
                setFormData({ ...formData, clientId: value, agentId: "" })
              }
            >
              <SelectTrigger id="client">
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

          <div>
            <Label htmlFor="agent">Agente *</Label>
            <Select
              value={formData.agentId}
              onValueChange={(value) =>
                setFormData({ ...formData, agentId: value })
              }
              disabled={!formData.clientId}
            >
              <SelectTrigger id="agent">
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
            {!formData.clientId && (
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um cliente primeiro
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Criando..." : "Criar Flow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
