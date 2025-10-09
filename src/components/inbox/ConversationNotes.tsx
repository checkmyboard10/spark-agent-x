import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationNotesProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConversationNotes({
  conversationId,
  open,
  onOpenChange,
}: ConversationNotesProps) {
  const [noteContent, setNoteContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes } = useQuery({
    queryKey: ["conversation-notes", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_notes")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Get user details for each note
      const notesWithUsers = await Promise.all(
        data.map(async (note) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", note.user_id)
            .single();
          return { ...note, user: profile };
        })
      );
      
      return notesWithUsers;
    },
    enabled: open,
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("conversation_notes").insert({
        conversation_id: conversationId,
        user_id: user.id,
        content: noteContent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteContent("");
      queryClient.invalidateQueries({ queryKey: ["conversation-notes", conversationId] });
      toast({ title: "Nota adicionada" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar nota", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("conversation_notes")
        .delete()
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-notes", conversationId] });
      toast({ title: "Nota removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover nota", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notas Internas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Adicionar uma nota interna..."
              className="min-h-[100px]"
            />
            <Button
              onClick={() => addNoteMutation.mutate()}
              disabled={!noteContent.trim() || addNoteMutation.isPending}
              className="mt-2"
            >
              Adicionar Nota
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {notes?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma nota ainda
                </p>
              )}
              {notes?.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {note.user?.full_name || note.user?.email || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
