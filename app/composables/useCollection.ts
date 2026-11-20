export function useCollection<T extends { id: string }>(table: string) {
  const supabase = useSupabase()
  const workspace = useWorkspace()
  const toast = useToast()

  const items = useState<T[]>(`items:${table}`, () => [])
  const loading = useState<boolean>(`loading:${table}`, () => false)
  const error = useState<string | null>(`error:${table}`, () => null)

  function workspaceFilter() {
    if (!workspace.workspaceId.value) {
      toast.error('Aucun espace actif sélectionné.')
      return null
    }
    return workspace.workspaceId.value
  }

  async function fetch(orderBy = 'created_at', ascending = false) {
    const workspaceId = workspaceFilter()
    if (!workspaceId) return

    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .eq('workspace_id', workspaceId)
      .order(orderBy, { ascending })

    loading.value = false

    if (err) {
      error.value = err.message
      toast.error(`Impossible de charger ${table} : ${err.message}`)
      return
    }

    items.value = (data ?? []) as T[]
  }

  async function insert(payload: Record<string, unknown>, silent = false): Promise<T | null> {
    const workspaceId = workspaceFilter()
    if (!workspaceId) return null
    error.value = null

    const { data, error: err } = await supabase
      .from(table)
      .insert({ ...payload, workspace_id: workspaceId })
      .select()
      .single()

    if (err) {
      error.value = err.message
      toast.error(err.message)
      return null
    }

    const created = data as T
    items.value = [created, ...items.value]
    if (!silent) toast.success('Ajouté avec succès.')
    return created
  }

  async function update(id: string, patch: Record<string, unknown>, silent = false): Promise<T | null> {
    error.value = null

    const { data, error: err } = await supabase
      .from(table)
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (err) {
      error.value = err.message
      toast.error(err.message)
      return null
    }

    const updated = data as T
    items.value = items.value.map((item) => (item.id === id ? updated : item))
    if (!silent) toast.success('Modifications enregistrées.')
    return updated
  }

  async function remove(id: string): Promise<boolean> {
    error.value = null

    const { error: err } = await supabase.from(table).delete().eq('id', id)

    if (err) {
      error.value = err.message
      toast.error(err.message)
      return false
    }

    items.value = items.value.filter((item) => item.id !== id)
    toast.success('Supprimé.')
    return true
  }

  watch(() => workspace.workspaceId.value, (id) => {
    if (id) fetch()
  })

  return { items, loading, error, fetch, insert, update, remove }
}
