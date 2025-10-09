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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      throw new Error('User has no agency');
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Only admins can send invites');
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      throw new Error('Email and role are required');
    }

    // Check if email already has an account
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id')
      .eq('email', email)
      .eq('agency_id', profile.agency_id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvite) {
      throw new Error('There is already a pending invite for this email');
    }

    // Create invite
    const { data: invite, error: insertError } = await supabase
      .from('invites')
      .insert({
        agency_id: profile.agency_id,
        email,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('Invite created:', invite.id);

    // TODO: Send email with invite link
    // const inviteLink = `${supabaseUrl}/accept-invite?token=${invite.token}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        invite_id: invite.id,
        message: 'Convite criado com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending invite:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
