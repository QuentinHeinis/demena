import type { WorkspaceInvitation, WorkspaceMember, WorkspaceRole } from '~/types'

interface ProfileRow {
  id: string
  email: string
  display_name: string
}

export function useTeam() {
  const supabase = useSupabase()
  const auth = useAuth()
  const toast = useToast()
  const workspace = useWorkspace()

  const members = useState<WorkspaceMember[]>('team-members', () => [])
  const invitations = useState<WorkspaceInvitation[]>('team-invitations', () => [])
  const loading = useState<boolean>('team-loading', () => false)

  async function fetch() {
    const id = workspace.workspaceId.value
    if (!id) return
    loading.value = true

    const [membersRes, invitesRes, profilesRes] = await Promise.all([
      supabase.from('workspace_members').select('workspace_id, user_id, role, invited_by, created_at').eq('workspace_id', id).order('created_at', { ascending: true }),
      supabase.from('workspace_invitations').select('*').eq('workspace_id', id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, email, display_name')
    ])

    loading.value = false

    if (membersRes.error || invitesRes.error || profilesRes.error) {
      toast.error(membersRes.error?.message ?? invitesRes.error?.message ?? profilesRes.error?.message ?? 'Erreur inconnue')
      return
    }

    const profiles = new Map((profilesRes.data ?? []).map((row) => [row.id, row as ProfileRow]))
    members.value = (membersRes.data ?? []).map((row) => {
      const profile = profiles.get(row.user_id)
      return {
        ...row,
        role: row.role as WorkspaceRole,
        email: profile?.email ?? '',
        display_name: profile?.display_name ?? ''
      } as WorkspaceMember
    })
    invitations.value = (invitesRes.data ?? []) as WorkspaceInvitation[]
  }

  async function invite(email: string, role: 'editor' | 'viewer'): Promise<string | null> {
    if (!workspace.workspaceId.value || !auth.user.value) return null

    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: workspace.workspaceId.value,
        email: email.trim().toLowerCase(),
        role,
        invited_by: auth.user.value.id
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      return null
    }

    const invitation = data as WorkspaceInvitation
    invitations.value = [invitation, ...invitations.value]
    toast.success('Invitation créée.')
    return invitation.token
  }

  async function updateRole(userId: string, role: WorkspaceRole) {
    if (!workspace.workspaceId.value) return
    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspace.workspaceId.value)
      .eq('user_id', userId)

    if (error) {
      toast.error(error.message)
      return
    }

    members.value = members.value.map((member) => (member.user_id === userId ? { ...member, role } : member))
    toast.success('Droits mis à jour.')
  }

  async function removeMember(userId: string) {
    if (!workspace.workspaceId.value) return
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspace.workspaceId.value)
      .eq('user_id', userId)

    if (error) {
      toast.error(error.message)
      return
    }

    members.value = members.value.filter((member) => member.user_id !== userId)
    toast.success('Membre retiré de l’espace.')
  }

  async function cancelInvitation(id: string) {
    const { error } = await supabase.from('workspace_invitations').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    invitations.value = invitations.value.filter((invitation) => invitation.id !== id)
    toast.success('Invitation annulée.')
  }

  async function accept(token: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('accept_workspace_invitation', { invite_token: token })
    if (error) {
      toast.error(error.message)
      return false
    }
    await workspace.fetch(true)
    await fetch()
    toast.success('Vous avez rejoint l’espace !')
    return Boolean(data)
  }

  function invitationLink(token: string) {
    return `${window.location.origin}/invitation?token=${encodeURIComponent(token)}`
  }

  return {
    members,
    invitations,
    loading,
    fetch,
    invite,
    updateRole,
    removeMember,
    cancelInvitation,
    accept,
    invitationLink
  }
}
