import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DailyStats } from "@/hooks/useAgencyAnalytics";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface MessagesChartProps {
  data: DailyStats[];
  isLoading: boolean;
}

export function MessagesChart({ data, isLoading }: MessagesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((stat) => ({
    date: format(parseISO(stat.date), "dd/MM", { locale: ptBR }),
    enviadas: stat.total_messages_sent,
    recebidas: stat.total_messages_received,
  }));

  const chartConfig = {
    enviadas: {
      label: "Mensagens Enviadas",
      color: "hsl(var(--primary))",
    },
    recebidas: {
      label: "Mensagens Recebidas",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Mensagens ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="enviadas"
                  stroke="var(--color-enviadas)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-enviadas)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="recebidas"
                  stroke="var(--color-recebidas)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-recebidas)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
