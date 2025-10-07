import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, MessageSquare, TrendingUp } from "lucide-react";

interface Stats {
  totalClients: number;
  totalAgents: number;
  activeConversations: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalAgents: 0,
    activeConversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [clientsResult, agentsResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("agents").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalClients: clientsResult.count || 0,
        totalAgents: agentsResult.count || 0,
        activeConversations: 0, // Will be implemented with conversations table
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats.totalClients,
      icon: Users,
      gradient: "from-primary to-primary-glow",
    },
    {
      title: "Agentes IA Ativos",
      value: stats.totalAgents,
      icon: Bot,
      gradient: "from-secondary to-accent",
    },
    {
      title: "Conversas Ativas",
      value: stats.activeConversations,
      icon: MessageSquare,
      gradient: "from-success to-primary",
    },
    {
      title: "Taxa de Resposta",
      value: "98%",
      icon: TrendingUp,
      gradient: "from-accent to-secondary",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus agentes de IA para WhatsApp
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted rounded-t-lg" />
              <CardContent className="h-20 bg-card" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="relative overflow-hidden group hover:shadow-glow transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Bem-vindo ao AI WhatsApp SaaS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Gerencie múltiplos clientes e agentes de IA de forma isolada e segura.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-semibold mb-2 text-primary">Multi-Tenant</h3>
              <p className="text-sm text-muted-foreground">
                Dados isolados por agência com segurança RLS
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-semibold mb-2 text-secondary">IA Configurável</h3>
              <p className="text-sm text-muted-foreground">
                Personalize prompts e comportamento dos agentes
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-semibold mb-2 text-success">Automação</h3>
              <p className="text-sm text-muted-foreground">
                Campanhas e follow-ups automáticos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
