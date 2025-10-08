import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to replace placeholders in template
function replacePlaceholders(template: string, contact: any): string {
  let message = template;
  
  // Replace common placeholders
  message = message.replace(/\{nome\}/gi, contact.name);
  message = message.replace(/\{name\}/gi, contact.name);
  message = message.replace(/\{telefone\}/gi, contact.phone);
  message = message.replace(/\{phone\}/gi, contact.phone);
  
  if (contact.email) {
    message = message.replace(/\{email\}/gi, contact.email);
  }
  
  // Replace custom fields
  if (contact.custom_fields) {
    Object.keys(contact.custom_fields).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      message = message.replace(regex, contact.custom_fields[key]);
    });
  }
  
  return message;
}

// Simulate WhatsApp send with humanization
async function simulateWhatsAppSend(message: string, phone: string, agentId: string) {
  // Random delay between 1-3 seconds to simulate human behavior
  const delay = Math.floor(Math.random() * 2000) + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  console.log(`[WhatsApp Simulator] Sending to ${phone}:`);
  console.log(`[Agent: ${agentId}] ${message}`);
  
  // Simulate success (95% success rate)
  const success = Math.random() > 0.05;
  
  return {
    success,
    error: success ? null : 'Failed to deliver message'
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Campaign Worker] Starting campaign processing...');

    // Find scheduled campaigns that are ready to send
    const now = new Date().toISOString();
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*, clients!inner(agency_id), agents!inner(name)')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .limit(10);

    if (campaignsError) {
      throw campaignsError;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('[Campaign Worker] No campaigns ready to process');
      return new Response(
        JSON.stringify({ message: 'No campaigns to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Campaign Worker] Processing ${campaigns.length} campaigns`);

    for (const campaign of campaigns) {
      console.log(`[Campaign Worker] Processing campaign: ${campaign.name} (${campaign.id})`);

      // Update campaign status to sending
      await supabase
        .from('campaigns')
        .update({ status: 'sending' })
        .eq('id', campaign.id);

      // Get pending contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('campaign_contacts')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending')
        .limit(50); // Process 50 contacts at a time

      if (contactsError || !contacts || contacts.length === 0) {
        console.log(`[Campaign Worker] No pending contacts for campaign ${campaign.id}`);
        
        // Update campaign status to completed if no more pending contacts
        await supabase
          .from('campaigns')
          .update({ status: 'completed' })
          .eq('id', campaign.id);
        
        continue;
      }

      console.log(`[Campaign Worker] Sending to ${contacts.length} contacts`);

      // Process each contact
      for (const contact of contacts) {
        try {
          // Generate personalized message
          const message = replacePlaceholders(campaign.template, contact);

          // Simulate WhatsApp send
          const result = await simulateWhatsAppSend(
            message,
            contact.phone,
            campaign.agent_id
          );

          const status = result.success ? 'sent' : 'failed';

          // Update contact status
          await supabase
            .from('campaign_contacts')
            .update({
              status,
              sent_at: new Date().toISOString(),
              error_message: result.error
            })
            .eq('id', contact.id);

          // Save message record
          await supabase
            .from('campaign_messages')
            .insert({
              campaign_id: campaign.id,
              contact_id: contact.id,
              message_text: message,
              followup_level: 0,
              status,
              sent_at: new Date().toISOString(),
              error_message: result.error
            });

          // Update campaign counters
          if (result.success) {
            await supabase
              .from('campaigns')
              .update({ sent_count: campaign.sent_count + 1 })
              .eq('id', campaign.id);
          } else {
            await supabase
              .from('campaigns')
              .update({ failed_count: campaign.failed_count + 1 })
              .eq('id', campaign.id);
          }

        } catch (error) {
          console.error(`[Campaign Worker] Error processing contact ${contact.id}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await supabase
            .from('campaign_contacts')
            .update({
              status: 'failed',
              error_message: errorMessage
            })
            .eq('id', contact.id);
        }
      }

      // Check if campaign is completed
      const { data: remainingContacts } = await supabase
        .from('campaign_contacts')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending')
        .limit(1);

      if (!remainingContacts || remainingContacts.length === 0) {
        await supabase
          .from('campaigns')
          .update({ status: 'completed' })
          .eq('id', campaign.id);
        
        console.log(`[Campaign Worker] Campaign ${campaign.id} completed`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: campaigns.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Campaign Worker] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
