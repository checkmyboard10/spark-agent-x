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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationTagsProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TAG_COLORS = [
  { name: "Vermelho", value: "red" },
  { name: "Laranja", value: "orange" },
  { name: "Amarelo", value: "yellow" },
  { name: "Verde", value: "green" },
  { name: "Azul", value: "blue" },
  { name: "Roxo", value: "purple" },
  { name: "Rosa", value: "pink" },
];

export default function ConversationTags({
  conversationId,
  open,
  onOpenChange,
}: ConversationTagsProps) {
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags } = useQuery({
    queryKey: ["conversation-tags", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_tags")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const addTagMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("conversation_tags").insert({
        conversation_id: conversationId,
        tag: tagName,
        color: selectedColor,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTagName("");
      queryClient.invalidateQueries({ queryKey: ["conversation-tags", conversationId] });
      toast({ title: "Tag adicionada" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar tag", variant: "destructive" });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("conversation_tags")
        .delete()
        .eq("id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-tags", conversationId] });
      toast({ title: "Tag removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover tag", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tags da Conversa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Nome da tag..."
              className="flex-1"
            />
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="border rounded-md px-3"
            >
              {TAG_COLORS.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
            </select>
            <Button
              onClick={() => addTagMutation.mutate()}
              disabled={!tagName.trim() || addTagMutation.isPending}
            >
              Adicionar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[100px]">
            {tags?.length === 0 && (
              <p className="text-center text-muted-foreground w-full py-8">
                Nenhuma tag ainda
              </p>
            )}
            {tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="gap-2"
                style={{
                  borderColor: `hsl(var(--${tag.color}))`,
                  backgroundColor: `hsl(var(--${tag.color}) / 0.1)`,
                }}
              >
                {tag.tag}
                <button
                  onClick={() => deleteTagMutation.mutate(tag.id)}
                  className="hover:bg-background/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
