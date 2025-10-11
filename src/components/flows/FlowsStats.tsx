import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, CheckCircle, Link2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FlowsStatsProps {
  stats?: {
    total: number;
    active: number;
    linked: number;
    lastCreated: Date | null;
  };
  isLoading: boolean;
}

export const FlowsStats = ({ stats, isLoading }: FlowsStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-12 rounded-lg mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Network,
      label: "Total de Flows",
      value: stats?.total || 0,
      color: "text-[hsl(155,85%,45%)]",
      bgColor: "bg-[hsl(155,85%,45%)]/10",
    },
    {
      icon: CheckCircle,
      label: "Flows Ativos",
      value: stats?.active || 0,
      color: "text-[hsl(155,85%,45%)]",
      bgColor: "bg-[hsl(155,85%,45%)]/10",
    },
    {
      icon: Link2,
      label: "Flows Vinculados",
      value: stats?.linked || 0,
      color: "text-[hsl(208,95%,52%)]",
      bgColor: "bg-[hsl(208,95%,52%)]/10",
    },
    {
      icon: Calendar,
      label: "Último Flow",
      value: stats?.lastCreated
        ? formatDistanceToNow(stats.lastCreated, { addSuffix: true, locale: ptBR })
        : "Nenhum",
      color: "text-[hsl(208,95%,52%)]",
      bgColor: "bg-[hsl(208,95%,52%)]/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
            <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        );
      })}
    </div>
  );
};
