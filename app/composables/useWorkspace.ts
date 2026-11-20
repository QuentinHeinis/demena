import type { Workspace, WorkspaceMember, WorkspaceRole } from '~/types'

interface MembershipRow extends WorkspaceMember {
  workspaces: Workspace | null
}

export function useWorkspace() {
  const supabase = useSupabase()
  const auth = useAuth()
  const toast = useToast()

  const workspaces = useState<Workspace[]>('workspaces', () => [])
  const memberships = useState<WorkspaceMember[]>('memberships', () => [])
  const activeId = useState<string | null>('active-workspace-id', () => null)
  const loading = useState<boolean>('workspace-loading', () => false)
  const ready = useState<boolean>('workspace-ready', () => false)

  const workspace = computed(() => workspaces.value.find((item) => item.id === activeId.value) ?? null)
  const role = computed<WorkspaceRole | null>(() => memberships.value.find((item) => item.workspace_id === activeId.value)?.role ?? null)
  const canWrite = computed(() => role.value === 'owner' || role.value === 'editor')
  const isOwner = computed(() => role.value === 'owner')

  async function fetch(force = false) {
    if (!auth.user.value) return
    if (ready.value && !force) return
    loading.value = true

    const { data: ensuredId, error: ensureError } = await supabase.rpc('ensure_personal_workspace')
    if (ensureError) {
      toast.error(`Impossible d'initialiser votre espace : ${ensureError.message}`)
      loading.value = false
      return
    }

    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace_id, user_id, role, invited_by, created_at, workspaces(*)')
      .eq('user_id', auth.user.value.id)

    loading.value = false

    if (error) {
      toast.error(error.message)
      return
    }

    const rows = (data ?? []) as unknown as MembershipRow[]
    memberships.value = rows.map(({ workspaces: _joined, ...member }) => member)
    workspaces.value = rows.map((row) => row.workspaces).filter((item): item is Workspace => item !== null)

    const saved = import.meta.client ? localStorage.getItem('demena-workspace') : null
    activeId.value = workspaces.value.find((item) => item.id === saved)?.id
      ?? workspaces.value[0]?.id
      ?? (ensuredId as string | null)
      ?? null

    ready.value = true
  }

  function select(id: string) {
    if (!workspaces.value.some((item) => item.id === id)) return
    activeId.value = id
    if (import.meta.client) localStorage.setItem('demena-workspace', id)
  }

  async function create(name: string) {
    if (!auth.user.value) return null
    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name, owner_id: auth.user.value.id })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      return null
    }

    const created = data as Workspace
    await supabase.from('workspace_members').insert({
      workspace_id: created.id,
      user_id: auth.user.value.id,
      role: 'owner'
    })

    workspaces.value = [...workspaces.value, created]
    memberships.value = [...memberships.value, {
      workspace_id: created.id,
      user_id: auth.user.value.id,
      role: 'owner',
      invited_by: null,
      created_at: created.created_at
    }]
    select(created.id)
    toast.success('Espace créé.')
    return created
  }

  async function update(patch: Partial<Workspace>) {
    if (!workspace.value) return null
    if (!isOwner.value) {
      toast.error('Seul le propriétaire peut modifier les informations de l’espace.')
      return null
    }

    const { data, error } = await supabase
      .from('workspaces')
      .update(patch)
      .eq('id', workspace.value.id)
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      return null
    }

    const updated = data as Workspace
    workspaces.value = workspaces.value.map((item) => (item.id === updated.id ? updated : item))
    toast.success('Espace mis à jour.')
    return updated
  }

  return {
    workspaces,
    memberships,
    activeId,
    workspaceId: activeId,
    workspace,
    role,
    canWrite,
    isOwner,
    loading,
    ready,
    fetch,
    select,
    create,
    update
  }
}
