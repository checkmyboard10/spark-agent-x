import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log('Aggregating stats for date:', dateStr);

    // Get all agencies
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id');

    if (!agencies) {
      throw new Error('No agencies found');
    }

    for (const agency of agencies) {
      // Get clients for this agency
      const { data: agencyClients } = await supabase
        .from('clients')
        .select('id')
        .eq('agency_id', agency.id);

      const clientIds = agencyClients?.map(c => c.id) || [];

      if (clientIds.length === 0) {
        console.log(`No clients found for agency ${agency.id}, skipping...`);
        continue;
      }

      // Get conversations for these clients
      const { data: agencyConversations } = await supabase
        .from('conversations')
        .select('id')
        .in('client_id', clientIds);

      const conversationIds = agencyConversations?.map(c => c.id) || [];

      // Get campaigns for these clients
      const { data: agencyCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .in('client_id', clientIds);

      const campaignIds = agencyCampaigns?.map(c => c.id) || [];

      // Get webhooks for these clients
      const { data: agencyWebhooks } = await supabase
        .from('webhooks')
        .select('id')
        .in('client_id', clientIds);

      const webhookIds = agencyWebhooks?.map(w => w.id) || [];

      // Count messages sent
      const { count: messagesSent } = conversationIds.length > 0 
        ? await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('direction', 'outbound')
            .gte('created_at', `${dateStr}T00:00:00Z`)
            .lt('created_at', `${dateStr}T23:59:59Z`)
            .in('conversation_id', conversationIds)
        : { count: 0 };

      // Count messages received
      const { count: messagesReceived } = conversationIds.length > 0
        ? await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('direction', 'inbound')
            .gte('created_at', `${dateStr}T00:00:00Z`)
            .lt('created_at', `${dateStr}T23:59:59Z`)
            .in('conversation_id', conversationIds)
        : { count: 0 };

      // Count active conversations
      const { count: activeConversations } = clientIds.length > 0
        ? await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .in('client_id', clientIds)
        : { count: 0 };

      // Count campaigns sent
      const { count: campaignsSent } = campaignIds.length > 0
        ? await supabase
            .from('campaign_messages')
            .select('*', { count: 'exact', head: true })
            .not('sent_at', 'is', null)
            .gte('sent_at', `${dateStr}T00:00:00Z`)
            .lt('sent_at', `${dateStr}T23:59:59Z`)
            .in('campaign_id', campaignIds)
        : { count: 0 };

      // Count webhook calls
      const { count: webhookCalls } = webhookIds.length > 0
        ? await supabase
            .from('webhook_logs')
            .select('*', { count: 'exact', head: true })
            .gte('triggered_at', `${dateStr}T00:00:00Z`)
            .lt('triggered_at', `${dateStr}T23:59:59Z`)
            .in('webhook_id', webhookIds)
        : { count: 0 };

      // Insert stats
      const { error: insertError } = await supabase
        .from('agency_stats')
        .upsert({
          agency_id: agency.id,
          date: dateStr,
          total_messages_sent: messagesSent || 0,
          total_messages_received: messagesReceived || 0,
          active_conversations: activeConversations || 0,
          campaigns_sent: campaignsSent || 0,
          webhook_calls: webhookCalls || 0,
        }, {
          onConflict: 'agency_id,date'
        });

      if (insertError) {
        console.error(`Error inserting stats for agency ${agency.id}:`, insertError);
      } else {
        console.log(`Stats aggregated for agency ${agency.id}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, date: dateStr, agencies_processed: agencies.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error aggregating stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
