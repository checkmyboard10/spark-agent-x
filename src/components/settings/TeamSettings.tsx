import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { InviteUserDialog } from "./InviteUserDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/usePermissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TeamSettings = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'member' | 'invite', id: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canManageTeam, isLoading: isLoadingPermissions } = usePermissions();

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

  const handleDeleteMember = async () => {
    if (!deleteTarget || deleteTarget.type !== 'member') return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', deleteTarget.id);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (error) {
      toast({
        title: "Erro ao remover membro",
        description: "Não foi possível remover o membro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteInvite = async () => {
    if (!deleteTarget || deleteTarget.type !== 'invite') return;

    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
    } catch (error) {
      toast({
        title: "Erro ao cancelar convite",
        description: "Não foi possível cancelar o convite. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Cast to any to bypass TypeScript enum restriction until types are regenerated
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole as any })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Role atualizado",
        description: "O papel do usuário foi atualizado com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Erro ao atualizar role",
        description: error.message === 'Não é possível remover ou rebaixar o último administrador da agency' 
          ? error.message 
          : "Ocorreu um erro ao atualizar o papel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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

  if (isLoadingPermissions) {
    return <div>Carregando...</div>;
  }

  if (!canManageTeam) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Apenas administradores podem gerenciar a equipe.
          Entre em contato com um administrador.
        </AlertDescription>
      </Alert>
    );
  }

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
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Usuário
          </Button>
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
                  <Select
                    value={member.user_roles?.[0]?.role || "user"}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderador</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setDeleteTarget({ type: 'member', id: member.id });
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pendingInvites && pendingInvites.length > 0 && (
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setDeleteTarget({ type: 'invite', id: invite.id });
                        setDeleteDialogOpen(true);
                      }}
                    >
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'member' 
                ? 'Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita.'
                : 'Tem certeza que deseja cancelar este convite?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteTarget?.type === 'member' ? handleDeleteMember : handleDeleteInvite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
