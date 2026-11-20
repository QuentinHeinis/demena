import type {
  ApartmentKind,
  ApartmentStatus,
  BoxStatus,
  CalendarEventKind,
  ContactRole,
  TaskCategory,
  TaskPriority,
  TransactionCategory,
  TransactionType
} from '~/utils/constants'

export type WorkspaceRole = 'owner' | 'editor' | 'viewer'

export interface Workspace {
  id: string
  name: string
  owner_id: string
  move_date: string | null
  destination: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  invited_by: string | null
  created_at: string
  email?: string
  display_name?: string
}

export interface WorkspaceInvitation {
  id: string
  workspace_id: string
  email: string
  role: Exclude<WorkspaceRole, 'owner'>
  token: string
  invited_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string
  updated_at: string
}

export interface UserSettings {
  user_id: string
  display_name: string
  phone: string
  updated_at: string
}

export interface Task {
  id: string
  workspace_id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  done: boolean
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  workspace_id: string
  label: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  note: string
  created_at: string
}

export interface Budget {
  id: string
  workspace_id: string
  category: TransactionCategory
  amount: number
  created_at: string
  updated_at: string
}

export interface Apartment {
  id: string
  workspace_id: string
  title: string
  address: string
  city: string
  postal_code: string
  surface: number | null
  rooms: number | null
  price: number
  charges: number
  deposit: number
  kind: ApartmentKind
  status: ApartmentStatus
  rating: number
  visit_date: string | null
  listing_url: string
  contact_name: string
  contact_phone: string
  contact_email: string
  pros: string
  cons: string
  notes: string
  created_at: string
  updated_at: string
}

export interface MovingBox {
  id: string
  workspace_id: string
  label: string
  room: string
  status: BoxStatus
  fragile: boolean
  notes: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  workspace_id: string
  name: string
  role: ContactRole
  phone: string
  email: string
  notes: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  kind: CalendarEventKind
  title: string
  subtitle: string
  date: string
  dateKey: string
  allDay: boolean
  done?: boolean
  reminderMinutes?: number
  to: string
}

export interface CalendarCustomEvent {
  id: string
  workspace_id: string
  title: string
  description: string
  date: string
  all_day: boolean
  reminder_minutes: number
  created_at: string
  updated_at: string
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type TaskInput = Partial<Task> & Pick<Task, 'title'>
export type CalendarCustomEventInput = Partial<CalendarCustomEvent> & Pick<CalendarCustomEvent, 'title' | 'date'>
export type TransactionInput = Partial<Transaction> & Pick<Transaction, 'label' | 'amount' | 'type'>
export type BudgetInput = Partial<Budget> & Pick<Budget, 'category' | 'amount'>
export type ApartmentInput = Partial<Apartment> & Pick<Apartment, 'title'>
export type MovingBoxInput = Partial<MovingBox> & Pick<MovingBox, 'label'>
export type ContactInput = Partial<Contact> & Pick<Contact, 'name'>
