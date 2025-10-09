import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponseTimeMetrics } from "@/hooks/useAgencyAnalytics";
import { Clock, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseTimeCardProps {
  data: ResponseTimeMetrics | null;
  isLoading: boolean;
}

export function ResponseTimeCard({ data, isLoading }: ResponseTimeCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-32 mt-4" />
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const getTrendIcon = () => {
    if (!data) return null;
    switch (data.trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-destructive" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-success" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!data) return "text-muted-foreground";
    switch (data.trend) {
      case "up":
        return "text-destructive";
      case "down":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getTrendLabel = () => {
    if (!data) return "";
    switch (data.trend) {
      case "up":
        return "mais lento";
      case "down":
        return "mais rápido";
      default:
        return "estável";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Tempo Médio de Resposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data ? (
          <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
            Dados insuficientes para calcular
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {formatTime(data.average_seconds)}
              </span>
              <span className="text-muted-foreground">em média</span>
            </div>
            
            <div className={cn("flex items-center gap-2", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {data.change_percentage.toFixed(1)}% {getTrendLabel()}
              </span>
              <span className="text-xs text-muted-foreground">
                vs. período anterior
              </span>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {data.average_seconds < 300 && (
                  <span className="text-success">✓ Excelente! Seu tempo de resposta está ótimo.</span>
                )}
                {data.average_seconds >= 300 && data.average_seconds < 900 && (
                  <span className="text-accent">→ Bom. Considere melhorar para respostas mais rápidas.</span>
                )}
                {data.average_seconds >= 900 && (
                  <span className="text-destructive">⚠ Atenção! Tempo de resposta pode ser melhorado.</span>
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
