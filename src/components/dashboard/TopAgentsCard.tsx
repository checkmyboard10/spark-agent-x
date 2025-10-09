import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TopAgent } from "@/hooks/useAgencyAnalytics";
import { Bot } from "lucide-react";

interface TopAgentsCardProps {
  data: TopAgent[];
  isLoading: boolean;
}

export function TopAgentsCard({ data, isLoading }: TopAgentsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Top 5 Agentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum agente com conversas ativas
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((agent, index) => (
              <div key={agent.id} className="space-y-2 group">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {agent.conversations_count} conversas
                  </span>
                </div>
                <Progress 
                  value={agent.percentage} 
                  className="h-2 transition-all group-hover:h-3"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
