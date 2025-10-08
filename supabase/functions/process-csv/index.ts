import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  name: string;
  phone: string;
  email?: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { campaignId, csvContent } = await req.json();

    if (!campaignId || !csvContent) {
      throw new Error('Missing campaignId or csvContent');
    }

    console.log('[Process CSV] Starting CSV processing for campaign:', campaignId);

    // Parse CSV
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least header and one data row');
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    
    // Validate required columns
    if (!headers.includes('name') && !headers.includes('nome')) {
      throw new Error('CSV must have a "name" or "nome" column');
    }
    if (!headers.includes('phone') && !headers.includes('telefone')) {
      throw new Error('CSV must have a "phone" or "telefone" column');
    }

    const nameIndex = headers.indexOf('name') !== -1 ? headers.indexOf('name') : headers.indexOf('nome');
    const phoneIndex = headers.indexOf('phone') !== -1 ? headers.indexOf('phone') : headers.indexOf('telefone');
    const emailIndex = headers.indexOf('email') !== -1 ? headers.indexOf('email') : -1;

    const contacts: CSVRow[] = [];
    const preview: CSVRow[] = [];

    // Process rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim());
      
      if (values.length < 2) continue; // Skip empty lines

      const name = values[nameIndex];
      const phone = values[phoneIndex];
      const email = emailIndex !== -1 ? values[emailIndex] : undefined;

      if (!name || !phone) continue; // Skip invalid rows

      const customFields: { [key: string]: any } = {};
      headers.forEach((header: string, index: number) => {
        if (index !== nameIndex && index !== phoneIndex && index !== emailIndex) {
          customFields[header] = values[index];
        }
      });

      const contact: CSVRow = {
        name,
        phone,
        email,
        ...customFields
      };

      contacts.push(contact);
      
      // Add to preview (first 3 rows)
      if (preview.length < 3) {
        preview.push(contact);
      }
    }

    console.log(`[Process CSV] Parsed ${contacts.length} valid contacts`);

    // Insert contacts into database
    const contactsToInsert = contacts.map(contact => ({
      campaign_id: campaignId,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      custom_fields: Object.keys(contact)
        .filter(k => !['name', 'phone', 'email'].includes(k))
        .reduce((obj, key) => ({ ...obj, [key]: contact[key] }), {})
    }));

    const { error: insertError } = await supabase
      .from('campaign_contacts')
      .insert(contactsToInsert);

    if (insertError) {
      console.error('[Process CSV] Error inserting contacts:', insertError);
      throw insertError;
    }

    // Update campaign with metadata
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        csv_meta: {
          headers,
          total: contacts.length,
          preview
        },
        total_contacts: contacts.length
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('[Process CSV] Error updating campaign:', updateError);
      throw updateError;
    }

    console.log('[Process CSV] CSV processing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        total: contacts.length,
        preview,
        headers
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[Process CSV] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
