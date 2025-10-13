import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Bot, FileText, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { AgentsTable } from "@/components/agents/AgentsTable";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Agent {
  id: string;
  client_id: string;
  name: string;
  type: string;
  prompt: string;
  humanization_enabled: boolean;
  active: boolean;
  flow_enabled?: boolean;
  active_flow_id?: string | null;
  clients?: { name: string };
  has_knowledge?: boolean;
}

interface KnowledgeFile {
  id: string;
  agent_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  content_preview: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
}

export default function Agents() {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [knowledgeFile, setKnowledgeFile] = useState<KnowledgeFile | null>(null);
  const [uploadingKnowledge, setUploadingKnowledge] = useState(false);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
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
          .select(`
            *, 
            clients(name),
            agent_knowledge_base!agent_knowledge_base_agent_id_fkey(id)
          `)
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

      // Adicionar flag has_knowledge
      const agentsWithKnowledge = (agentsResult.data || []).map((agent: any) => ({
        ...agent,
        has_knowledge: agent.agent_knowledge_base && agent.agent_knowledge_base.length > 0
      }));

      setAgents(agentsWithKnowledge);
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

    if (!formData.prompt.trim()) {
      toast.error('Você deve definir um prompt para o agente IA!');
      return;
    }

    setLoading(true);

    try {
      const agentData = {
        name: formData.name,
        client_id: formData.client_id,
        type: formData.type,
        prompt: formData.prompt,
        humanization_enabled: formData.humanization_enabled,
      };

      if (editingAgent) {
        const { error } = await supabase
          .from("agents")
          .update(agentData)
          .eq("id", editingAgent.id);

        if (error) throw error;
        toast.success("Agente atualizado!");
      } else {
        const { error } = await supabase.from("agents").insert(agentData);

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

  const openEditDialog = async (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      client_id: agent.client_id,
      type: agent.type,
      prompt: agent.prompt,
      humanization_enabled: agent.humanization_enabled,
    });
    await loadKnowledgeFile(agent.id);
    setDialogOpen(true);
  };

  const loadKnowledgeFile = async (agentId: string) => {
    setLoadingKnowledge(true);
    const { data, error } = await supabase
      .from('agent_knowledge_base')
      .select('*')
      .eq('agent_id', agentId)
      .maybeSingle();
    
    if (!error && data) {
      setKnowledgeFile(data);
    } else {
      setKnowledgeFile(null);
    }
    setLoadingKnowledge(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAgent) return;
    
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande! Máximo 10MB.');
      return;
    }
    
    // Validar tipo
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      toast.error('Tipo de arquivo não suportado!');
      return;
    }
    
    setUploadingKnowledge(true);
    
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Chamar edge function
        const { data, error } = await supabase.functions.invoke('process-knowledge-document', {
          body: {
            agentId: editingAgent.id,
            file: base64,
            fileName: file.name,
            fileType: ext.replace('.', ''),
            fileSize: file.size
          }
        });
        
        if (error) throw error;
        
        toast.success('Documento adicionado com sucesso!');
        await loadKnowledgeFile(editingAgent.id);
        // Limpar input
        e.target.value = '';
      };
    } catch (error: any) {
      console.error('Error uploading knowledge:', error);
      toast.error('Erro ao processar documento');
    } finally {
      setUploadingKnowledge(false);
    }
  };

  const handleDeleteKnowledge = async () => {
    if (!knowledgeFile) return;
    
    if (!confirm('Tem certeza que deseja remover este documento?')) return;
    
    try {
      // Deletar do Storage
      await supabase.storage
        .from('agent-knowledge')
        .remove([knowledgeFile.file_path]);
      
      // Deletar do banco
      const { error } = await supabase
        .from('agent_knowledge_base')
        .delete()
        .eq('id', knowledgeFile.id);
      
      if (error) throw error;
      
      setKnowledgeFile(null);
      toast.success('Documento removido!');
    } catch (error: any) {
      console.error('Error deleting knowledge:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const resetForm = () => {
    setEditingAgent(null);
    setKnowledgeFile(null);
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

              {/* Base de Conhecimento Section */}
              <div className="space-y-4 border-t pt-4 mt-4">
                <div>
                  <Label className="text-base font-semibold">📚 Base de Conhecimento</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    {editingAgent 
                      ? "Adicione um documento (PDF, Word, TXT) para enriquecer o conhecimento deste agente (máx. 10MB)"
                      : "⚠️ Salve o agente primeiro para poder adicionar documentos à base de conhecimento"
                    }
                  </p>
                  
                  {editingAgent ? (
                    <>
                      {!knowledgeFile ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            disabled={uploadingKnowledge || !permissions.canEdit}
                            className="hidden"
                            id="knowledge-upload"
                          />
                          <Label 
                            htmlFor="knowledge-upload" 
                            className={`cursor-pointer ${!permissions.canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">
                              {permissions.canEdit ? 'Clique para adicionar documento' : 'Sem permissão para adicionar'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {permissions.canEdit ? 'PDF, Word ou TXT (máx. 10MB)' : 'Apenas admins e moderators'}
                            </p>
                          </Label>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{knowledgeFile.file_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {knowledgeFile.file_type.toUpperCase()} • {(knowledgeFile.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                
                                {knowledgeFile.content_preview && (
                                  <div className="mt-3 p-3 bg-muted rounded-md">
                                    <p className="text-xs text-muted-foreground mb-1">Preview do conteúdo:</p>
                                    <p className="text-xs line-clamp-3">{knowledgeFile.content_preview}</p>
                                  </div>
                                )}
                              </div>
                              
                              {permissions.canEdit && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={handleDeleteKnowledge}
                                  disabled={uploadingKnowledge}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {uploadingKnowledge && (
                        <div className="flex items-center gap-2 mt-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs text-muted-foreground">Processando documento...</span>
                        </div>
                      )}

                      {!permissions.canEdit && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Apenas admins e moderators podem modificar a base de conhecimento
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/50">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Crie o agente primeiro para habilitar o upload de documentos
                      </p>
                    </div>
                  )}
                </div>
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

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar clientes antes de criar agentes
            </p>
            <Button onClick={() => navigate("/clients")}>
              Ir para Clientes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AgentsTable 
          agents={agents} 
          isLoading={loading}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
