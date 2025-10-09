import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Shield, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { InviteUserDialog } from "./InviteUserDialog";

export const TeamSettings = () => {
  const { canManageTeam } = usePermissions();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (!profile?.agency_id) return [];

      const { data } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          user_roles (role)
        `)
        .eq('agency_id', profile.agency_id);

      return data;
    },
  });

  const { data: pendingInvites } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (!profile?.agency_id) return [];

      const { data } = await supabase
        .from('invites')
        .select('*')
        .eq('agency_id', profile.agency_id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      return data;
    },
  });

  const getRoleBadge = (roles: any[]) => {
    if (!roles || roles.length === 0) return <Badge variant="outline">User</Badge>;
    
    const role = roles[0].role;
    const variants: any = {
      admin: "default",
      moderator: "secondary",
      user: "outline",
    };

    return <Badge variant={variants[role] || "outline"}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Membros da Equipe</CardTitle>
            <CardDescription>
              Gerencie os usuários da sua agência
            </CardDescription>
          </div>
          {canManageTeam && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Usuário
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers?.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {member.full_name?.charAt(0) || member.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.full_name || member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.user_roles)}
                  {canManageTeam && (
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {canManageTeam && pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites Pendentes</CardTitle>
            <CardDescription>
              Convites que ainda não foram aceitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite: any) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Expira em {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{invite.role}</Badge>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};
