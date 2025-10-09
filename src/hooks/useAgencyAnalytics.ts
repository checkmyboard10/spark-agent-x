import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface DailyStats {
  date: string;
  total_messages_sent: number;
  total_messages_received: number;
  active_conversations: number;
  campaigns_sent: number;
  webhook_calls: number;
}

export interface TopAgent {
  id: string;
  name: string;
  conversations_count: number;
  percentage: number;
}

export interface ResponseTimeMetrics {
  average_seconds: number;
  trend: "up" | "down" | "stable";
  change_percentage: number;
}

export interface ConversionFunnel {
  total_conversations: number;
  with_response: number;
  resolved: number;
  response_rate: number;
  resolution_rate: number;
}

interface UseAgencyAnalyticsParams {
  period?: number;
  startDate?: Date;
  endDate?: Date;
}

export const useAgencyAnalytics = ({ period = 30, startDate, endDate }: UseAgencyAnalyticsParams = {}) => {
  const start = startDate || subDays(new Date(), period);
  const end = endDate || new Date();

  const { data: dailyStats, isLoading: loadingDailyStats } = useQuery({
    queryKey: ["agency-daily-stats", start, end],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile?.agency_id) return [];

      const { data } = await supabase
        .from("agency_stats")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"))
        .order("date", { ascending: true });

      return (data || []) as DailyStats[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const { data: topAgents, isLoading: loadingTopAgents } = useQuery({
    queryKey: ["top-agents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile?.agency_id) return [];

      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("agency_id", profile.agency_id);

      const clientIds = clients?.map(c => c.id) || [];
      if (clientIds.length === 0) return [];

      const { data: agents } = await supabase
        .from("agents")
        .select("id, name, client_id")
        .in("client_id", clientIds);

      if (!agents) return [];

      // Count conversations per agent
      const agentStats = await Promise.all(
        agents.map(async (agent) => {
          const { count } = await supabase
            .from("conversations")
            .select("*", { count: "exact", head: true })
            .eq("agent_id", agent.id)
            .eq("status", "active");

          return {
            id: agent.id,
            name: agent.name,
            conversations_count: count || 0,
          };
        })
      );

      // Calculate percentages and sort
      const totalConversations = agentStats.reduce((sum, a) => sum + a.conversations_count, 0);
      const topFive = agentStats
        .map(agent => ({
          ...agent,
          percentage: totalConversations > 0 ? (agent.conversations_count / totalConversations) * 100 : 0,
        }))
        .sort((a, b) => b.conversations_count - a.conversations_count)
        .slice(0, 5);

      return topFive as TopAgent[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: responseTime, isLoading: loadingResponseTime } = useQuery({
    queryKey: ["response-time", start, end],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile?.agency_id) return null;

      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("agency_id", profile.agency_id);

      const clientIds = clients?.map(c => c.id) || [];
      if (clientIds.length === 0) return null;

      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .in("client_id", clientIds);

      const conversationIds = conversations?.map(c => c.id) || [];
      if (conversationIds.length === 0) return null;

      // Get response times (time between incoming message and first outgoing response)
      const { data: messages } = await supabase
        .from("messages")
        .select("conversation_id, direction, created_at")
        .in("conversation_id", conversationIds)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (!messages || messages.length === 0) return null;

      // Calculate average response time
      const responseTimes: number[] = [];
      const conversationMap = new Map<string, { lastIncoming?: Date }>();

      messages.forEach(msg => {
        const convData = conversationMap.get(msg.conversation_id) || {};
        
        if (msg.direction === "incoming") {
          convData.lastIncoming = new Date(msg.created_at);
          conversationMap.set(msg.conversation_id, convData);
        } else if (msg.direction === "outgoing" && convData.lastIncoming) {
          const responseTime = new Date(msg.created_at).getTime() - convData.lastIncoming.getTime();
          responseTimes.push(responseTime / 1000); // Convert to seconds
          delete convData.lastIncoming; // Reset for next interaction
          conversationMap.set(msg.conversation_id, convData);
        }
      });

      if (responseTimes.length === 0) return null;

      const averageSeconds = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;

      // Compare with previous period
      const previousStart = subDays(start, period);
      const { data: previousMessages } = await supabase
        .from("messages")
        .select("conversation_id, direction, created_at")
        .in("conversation_id", conversationIds)
        .gte("created_at", previousStart.toISOString())
        .lt("created_at", start.toISOString())
        .order("created_at", { ascending: true });

      let previousAverage = 0;
      if (previousMessages && previousMessages.length > 0) {
        const previousResponseTimes: number[] = [];
        const previousConvMap = new Map<string, { lastIncoming?: Date }>();

        previousMessages.forEach(msg => {
          const convData = previousConvMap.get(msg.conversation_id) || {};
          
          if (msg.direction === "incoming") {
            convData.lastIncoming = new Date(msg.created_at);
            previousConvMap.set(msg.conversation_id, convData);
          } else if (msg.direction === "outgoing" && convData.lastIncoming) {
            const responseTime = new Date(msg.created_at).getTime() - convData.lastIncoming.getTime();
            previousResponseTimes.push(responseTime / 1000);
            delete convData.lastIncoming;
            previousConvMap.set(msg.conversation_id, convData);
          }
        });

        if (previousResponseTimes.length > 0) {
          previousAverage = previousResponseTimes.reduce((sum, t) => sum + t, 0) / previousResponseTimes.length;
        }
      }

      const changePercentage = previousAverage > 0 
        ? ((averageSeconds - previousAverage) / previousAverage) * 100 
        : 0;

      const trend: "up" | "down" | "stable" = 
        Math.abs(changePercentage) < 5 ? "stable" : changePercentage > 0 ? "up" : "down";

      return {
        average_seconds: averageSeconds,
        trend,
        change_percentage: Math.abs(changePercentage),
      } as ResponseTimeMetrics;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: conversionFunnel, isLoading: loadingConversionFunnel } = useQuery({
    queryKey: ["conversion-funnel", start, end],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile?.agency_id) return null;

      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("agency_id", profile.agency_id);

      const clientIds = clients?.map(c => c.id) || [];
      if (clientIds.length === 0) return null;

      // Total conversations in period
      const { count: totalConversations } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .in("client_id", clientIds)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      // Conversations with at least one outgoing message
      const { data: conversationsWithResponse } = await supabase
        .from("conversations")
        .select("id")
        .in("client_id", clientIds)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      let withResponse = 0;
      if (conversationsWithResponse) {
        const conversationIds = conversationsWithResponse.map(c => c.id);
        
        const checks = await Promise.all(
          conversationIds.map(async (id) => {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", id)
              .eq("direction", "outgoing")
              .limit(1);
            return count! > 0;
          })
        );

        withResponse = checks.filter(Boolean).length;
      }

      // Resolved conversations (archived)
      const { count: resolved } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .in("client_id", clientIds)
        .eq("archived", true)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      const total = totalConversations || 0;
      const responseRate = total > 0 ? (withResponse / total) * 100 : 0;
      const resolutionRate = total > 0 ? ((resolved || 0) / total) * 100 : 0;

      return {
        total_conversations: total,
        with_response: withResponse,
        resolved: resolved || 0,
        response_rate: responseRate,
        resolution_rate: resolutionRate,
      } as ConversionFunnel;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    dailyStats,
    topAgents,
    responseTime,
    conversionFunnel,
    isLoading: loadingDailyStats || loadingTopAgents || loadingResponseTime || loadingConversionFunnel,
  };
};
