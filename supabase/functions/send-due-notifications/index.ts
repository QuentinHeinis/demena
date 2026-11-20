import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com'
const cronSecret = Deno.env.get('CRON_SECRET')

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function parseDate(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split('-').map(Number)
    return new Date(parts[0]!, parts[1]! - 1, parts[2]!).getTime()
  }
  return new Date(value).getTime()
}

interface SubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  reminder_minutes: number
  timezone: string
  device: string
}

interface EventRow {
  key: string
  title: string
  body: string
  startsAt: number
  url: string
}

async function sendOne(subscription: SubscriptionRow, payload: { title: string, body: string, url: string, tag?: string }): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload)
    )
    return true
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode
    if (status === 404 || status === 410) {
      await supabase.from('push_subscriptions').delete().eq('id', subscription.id)
    }
    console.error('push failed', (error as Error).message)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (!vapidPublicKey || !vapidPrivateKey) return json({ error: 'VAPID keys missing' }, 500)
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const isCron = Boolean(cronSecret) && req.headers.get('x-cron-secret') === cronSecret
  let userId: string | null = null
  const authorization = req.headers.get('authorization')
  if (!isCron && authorization?.startsWith('Bearer ')) {
    const { data, error } = await supabase.auth.getUser(authorization.slice(7))
    if (!error && data.user) userId = data.user.id
  }
  if (!isCron && !userId) return json({ error: 'Unauthorized' }, 401)

  const body = await req.json().catch(() => ({}))

  if (body.test) {
    if (!userId) return json({ error: 'User token required for test' }, 401)
    const { data: subscription } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    if (!subscription) return json({ error: 'No push subscription' }, 404)

    const sent = await sendOne(subscription as SubscriptionRow, { title: 'Déména', body: 'Les notifications sont activées.', url: '/' })
    return json({ ok: sent })
  }

  if (!isCron) return json({ error: 'Cron secret required' }, 401)

  const { data: subscriptions } = await supabase.from('push_subscriptions').select('*')
  const { data: workspaces } = await supabase.from('workspaces').select('id, name, move_date, destination')
  const { data: apartments } = await supabase.from('apartments').select('id, workspace_id, title, visit_date, address, city')
  const { data: tasks } = await supabase.from('tasks').select('id, workspace_id, title, due_date, done')
  const { data: memberships } = await supabase.from('workspace_members').select('user_id, workspace_id')

  const eventsByWorkspace = new Map<string, EventRow[]>()
  function add(workspaceId: string, event: EventRow) {
    const list = eventsByWorkspace.get(workspaceId) ?? []
    list.push(event)
    eventsByWorkspace.set(workspaceId, list)
  }

  for (const workspace of workspaces ?? []) {
    if (!workspace.move_date) continue
    add(workspace.id, {
      key: `move:${workspace.id}:${workspace.move_date}`,
      title: 'Jour J — Déménagement',
      body: workspace.destination || workspace.name,
      startsAt: parseDate(workspace.move_date),
      url: '/parametres'
    })
  }

  for (const apartment of apartments ?? []) {
    if (!apartment.visit_date) continue
    add(apartment.workspace_id, {
      key: `visit:${apartment.id}:${apartment.visit_date}`,
      title: `Visite — ${apartment.title}`,
      body: [apartment.address, apartment.city].filter(Boolean).join(', '),
      startsAt: parseDate(apartment.visit_date),
      url: '/appartements'
    })
  }

  for (const task of tasks ?? []) {
    if (!task.due_date || task.done) continue
    add(task.workspace_id, {
      key: `task:${task.id}:${task.due_date}`,
      title: task.title,
      body: 'Échéance à respecter',
      startsAt: parseDate(task.due_date),
      url: '/taches'
    })
  }

  let sent = 0
  let failed = 0

  for (const subscription of (subscriptions ?? []) as SubscriptionRow[]) {
    const workspaceIds = new Set(
      (memberships ?? []).filter((membership) => membership.user_id === subscription.user_id).map((membership) => membership.workspace_id)
    )
    const reminderMs = subscription.reminder_minutes * 60_000
    const now = Date.now()

    for (const workspaceId of workspaceIds) {
      for (const event of eventsByWorkspace.get(workspaceId) ?? []) {
        const notifyAt = event.startsAt - reminderMs
        const age = now - notifyAt
        if (age < 0 || age > 12 * 60 * 60_000) continue

        const eventKey = `${event.key}:${subscription.reminder_minutes}`
        const { data: alreadySent } = await supabase
          .from('push_notifications_sent')
          .select('id')
          .eq('subscription_id', subscription.id)
          .eq('event_key', eventKey)
          .maybeSingle()
        if (alreadySent) continue

        const ok = await sendOne(subscription, {
          title: event.title,
          body: event.body,
          url: event.url,
          tag: eventKey
        })

        if (ok) {
          await supabase.from('push_notifications_sent').insert({ subscription_id: subscription.id, event_key: eventKey })
          sent++
        } else {
          failed++
        }
      }
    }
  }

  return json({ sent, failed })
})
