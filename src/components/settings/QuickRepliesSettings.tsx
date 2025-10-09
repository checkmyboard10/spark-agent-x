import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function QuickRepliesSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "geral",
    shortcuts: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("agency_id")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: quickReplies, isLoading } = useQuery({
    queryKey: ["quick-replies-settings"],
    queryFn: async () => {
      if (!profile?.agency_id) return [];
      const { data, error } = await supabase
        .from("quick_replies")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.agency_id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.agency_id) throw new Error("No agency");

      const shortcuts = formData.shortcuts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingReply) {
        const { error } = await supabase
          .from("quick_replies")
          .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            shortcuts,
          })
          .eq("id", editingReply.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quick_replies").insert({
          agency_id: profile.agency_id,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          shortcuts,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-replies-settings"] });
      queryClient.invalidateQueries({ queryKey: ["quick-replies"] });
      setIsDialogOpen(false);
      setEditingReply(null);
      setFormData({ title: "", content: "", category: "geral", shortcuts: "" });
      toast({ title: editingReply ? "Resposta atualizada" : "Resposta criada" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar resposta", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quick_replies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-replies-settings"] });
      queryClient.invalidateQueries({ queryKey: ["quick-replies"] });
      toast({ title: "Resposta removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover resposta", variant: "destructive" });
    },
  });

  const handleEdit = (reply: any) => {
    setEditingReply(reply);
    setFormData({
      title: reply.title,
      content: reply.content,
      category: reply.category,
      shortcuts: reply.shortcuts?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingReply(null);
    setFormData({ title: "", content: "", category: "geral", shortcuts: "" });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respostas Rápidas</CardTitle>
        <CardDescription>
          Crie templates de mensagens para responder rapidamente no Inbox. Use variáveis como{" "}
          <code className="bg-muted px-1 rounded">{"{nome}"}</code>,{" "}
          <code className="bg-muted px-1 rounded">{"{empresa}"}</code>,{" "}
          <code className="bg-muted px-1 rounded">{"{data}"}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            {quickReplies?.length || 0} respostas cadastradas
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Resposta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingReply ? "Editar Resposta Rápida" : "Nova Resposta Rápida"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Boas-vindas"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="suporte">Suporte</SelectItem>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Mensagem</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Olá {nome}! Bem-vindo à {empresa}."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variáveis disponíveis: {"{nome}"}, {"{empresa}"}, {"{data}"}, {"{agente}"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="shortcuts">Atalhos (separados por vírgula)</Label>
                  <Input
                    id="shortcuts"
                    value={formData.shortcuts}
                    onChange={(e) => setFormData({ ...formData, shortcuts: e.target.value })}
                    placeholder="Ex: /ola, /bemvindo"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={!formData.title || !formData.content || saveMutation.isPending}
                  >
                    {editingReply ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : quickReplies?.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma resposta rápida</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie templates para responder mais rapidamente no Inbox
            </p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Resposta
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Atalhos</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quickReplies?.map((reply) => (
                  <TableRow key={reply.id}>
                    <TableCell className="font-medium">{reply.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reply.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {reply.shortcuts?.slice(0, 2).map((shortcut: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {shortcut}
                          </Badge>
                        ))}
                        {reply.shortcuts && reply.shortcuts.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{reply.shortcuts.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{reply.content}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(reply)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(reply.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
