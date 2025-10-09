import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    direction: string;
    status: string;
    created_at: string;
    delivered_at?: string;
    read_at?: string;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";

  const getStatusIcon = () => {
    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-primary" />;
    }
    if (message.delivered_at) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%]",
        isOutgoing ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2",
          isOutgoing
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs",
            isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span>
            {format(new Date(message.created_at), "HH:mm", { locale: ptBR })}
          </span>
          {isOutgoing && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
