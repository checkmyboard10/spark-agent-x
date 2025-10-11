import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversionFunnel } from "@/hooks/useAgencyAnalytics";
import { Filter } from "lucide-react";

interface ConversionFunnelCardProps {
  data: ConversionFunnel | null;
  isLoading: boolean;
}

export function ConversionFunnelCard({ data, isLoading }: ConversionFunnelCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-[hsl(155,85%,45%)]" />
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.total_conversations === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma conversa no período selecionado
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stage 1: Total Conversations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Conversas Iniciadas</span>
                <span className="text-muted-foreground">{data.total_conversations}</span>
              </div>
              <Progress value={100} className="h-3 bg-[hsl(222,20%,25%)]" />
              <p className="text-xs text-muted-foreground">
                100% das conversas do período
              </p>
            </div>

            {/* Stage 2: With Response */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Com Resposta do Agente</span>
                <span className="text-muted-foreground">{data.with_response}</span>
              </div>
              <Progress 
                value={data.response_rate} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                {data.response_rate.toFixed(1)}% receberam resposta
              </p>
            </div>

            {/* Stage 3: Resolved */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Resolvidas/Arquivadas</span>
                <span className="text-muted-foreground">{data.resolved}</span>
              </div>
              <Progress 
                value={data.resolution_rate} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                {data.resolution_rate.toFixed(1)}% foram concluídas
              </p>
            </div>

            {/* Insights */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {data.response_rate >= 90 && (
                  <span className="text-[hsl(155,85%,45%)] font-medium">✓ Excelente taxa de resposta! Continue assim.</span>
                )}
                {data.response_rate >= 70 && data.response_rate < 90 && (
                  <span className="text-[hsl(208,95%,52%)]">→ Boa taxa de resposta. Há espaço para melhorias.</span>
                )}
                {data.response_rate < 70 && (
                  <span className="text-destructive">⚠ Taxa de resposta baixa. Configure mais agentes ou otimize os existentes.</span>
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
