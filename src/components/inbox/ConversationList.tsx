import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Conversation } from "@/pages/Inbox";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full p-4 text-left hover:bg-accent transition-colors",
              selectedId === conversation.id && "bg-accent"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{conversation.contact_name}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.contact_phone}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <Badge variant="default" className="h-5 px-2">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={conversation.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {conversation.status === "active" ? "Ativa" : "Resolvida"}
              </Badge>
              {conversation.archived && (
                <Badge variant="outline" className="text-xs">
                  Arquivada
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
