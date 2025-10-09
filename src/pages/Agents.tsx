import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Bot, MoreVertical, Pencil, Trash2, GitBranch } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Agent {
  id: string;
  client_id: string;
  name: string;
  type: string;
  prompt: string;
  humanization_enabled: boolean;
  active: boolean;
  clients?: { name: string };
}

interface Client {
  id: string;
  name: string;
}

export default function Agents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    type: "general",
    prompt: "",
    humanization_enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile?.agency_id) return;

      const [agentsResult, clientsResult] = await Promise.all([
        supabase
          .from("agents")
          .select("*, clients(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, name")
          .eq("agency_id", profile.agency_id)
          .eq("active", true)
          .order("name"),
      ]);

      if (agentsResult.error) throw agentsResult.error;
      if (clientsResult.error) throw clientsResult.error;

      setAgents(agentsResult.data || []);
      setClients(clientsResult.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAgent) {
        const { error } = await supabase
          .from("agents")
          .update({
            name: formData.name,
            client_id: formData.client_id,
            type: formData.type,
            prompt: formData.prompt,
            humanization_enabled: formData.humanization_enabled,
          })
          .eq("id", editingAgent.id);

        if (error) throw error;
        toast.success("Agente atualizado!");
      } else {
        const { error } = await supabase.from("agents").insert({
          name: formData.name,
          client_id: formData.client_id,
          type: formData.type,
          prompt: formData.prompt,
          humanization_enabled: formData.humanization_enabled,
        });

        if (error) throw error;
        toast.success("Agente criado!");
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agente?")) return;

    try {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (error) throw error;
      toast.success("Agente excluído!");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      client_id: agent.client_id,
      type: agent.type,
      prompt: agent.prompt,
      humanization_enabled: agent.humanization_enabled,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAgent(null);
    setFormData({
      name: "",
      client_id: "",
      type: "general",
      prompt: "",
      humanization_enabled: true,
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      support: "Suporte",
      sales: "Vendas",
      general: "Geral",
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      support: "bg-primary/10 text-primary",
      sales: "bg-secondary/10 text-secondary",
      general: "bg-accent/10 text-accent",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agentes de IA</h1>
          <p className="text-muted-foreground">Configure seus assistentes inteligentes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => closeDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Editar Agente" : "Novo Agente"}
              </DialogTitle>
              <DialogDescription>
                Configure o comportamento do agente de IA
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Agente *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Assistente de Vendas"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, client_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="support">Suporte</SelectItem>
                    <SelectItem value="sales">Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prompt">Prompt do Sistema *</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  placeholder="Você é um assistente prestativo que..."
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Define como o agente deve se comportar e responder
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="humanization">Humanização</Label>
                  <p className="text-xs text-muted-foreground">
                    Adiciona delays e naturalidade às respostas
                  </p>
                </div>
                <Switch
                  id="humanization"
                  checked={formData.humanization_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, humanization_enabled: checked })
                  }
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingAgent ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && agents.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar clientes antes de criar agentes
            </p>
            <Button onClick={() => window.location.href = "/clients"}>
              Ir para Clientes
            </Button>
          </CardContent>
        </Card>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum agente configurado</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Agente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-glow transition-all">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                        agent.type
                      )}`}
                    >
                      {getTypeLabel(agent.type)}
                    </span>
                    {agent.active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/flows/${agent.id}`)}>
                      <GitBranch className="mr-2 h-4 w-4" />
                      Editar Fluxo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(agent)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Agente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(agent.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente:</p>
                  <p className="text-sm font-medium">{agent.clients?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prompt:</p>
                  <p className="text-sm line-clamp-3">{agent.prompt}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {agent.humanization_enabled && (
                    <span className="flex items-center gap-1">
                      ✓ Humanizado
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
