export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  await auth.initialize()

  const publicRoutes = ['/login', '/register', '/forgot-password', '/invitation']
  const isPublic = publicRoutes.includes(to.path)

  if (!auth.user.value && !isPublic) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (auth.user.value && isPublic && to.path !== '/invitation') {
    return navigateTo('/')
  }

  if (auth.user.value && !isPublic) {
    const workspace = useWorkspace()
    await workspace.fetch()
    if (!workspace.workspaceId.value) {
      await workspace.fetch(true)
    }
  }
})
