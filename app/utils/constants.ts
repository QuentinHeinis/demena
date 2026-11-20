export const TASK_CATEGORIES = [
  { value: 'administratif', label: 'Administratif', hex: '#3b82f6', class: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20' },
  { value: 'cartons', label: 'Cartons & rangement', hex: '#f59e0b', class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20' },
  { value: 'demenageur', label: 'Déménageur', hex: '#8b5cf6', class: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20' },
  { value: 'nouveau_logement', label: 'Nouveau logement', hex: '#10b981', class: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20' },
  { value: 'resiliation', label: 'Résiliations', hex: '#f43f5e', class: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20' },
  { value: 'autre', label: 'Autre', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' }
] as const

export const TASK_PRIORITIES = [
  { value: 'basse', label: 'Basse', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' },
  { value: 'moyenne', label: 'Moyenne', hex: '#f59e0b', class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20' },
  { value: 'haute', label: 'Haute', hex: '#f43f5e', class: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20' }
] as const

export const TASK_SORT_OPTIONS = [
  { value: 'due', label: 'Échéance' },
  { value: 'priority', label: 'Priorité' },
  { value: 'category', label: 'Catégorie' },
  { value: 'status', label: 'Statut' },
  { value: 'title', label: 'Titre' },
  { value: 'created', label: 'Ajout récent' }
] as const

export const TASK_SORT_ORDER_OPTIONS = [
  { value: 'asc', label: 'Croissant' },
  { value: 'desc', label: 'Décroissant' }
] as const

export const TRANSACTION_TYPES = [
  { value: 'depense', label: 'Dépense', hex: '#f43f5e' },
  { value: 'recette', label: 'Recette', hex: '#10b981' }
] as const

export const TRANSACTION_CATEGORIES = [
  { value: 'demenageur', label: 'Déménageur', hex: '#8b5cf6', class: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20' },
  { value: 'cartons', label: 'Cartons & fournitures', hex: '#f59e0b', class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20' },
  { value: 'transport', label: 'Transport', hex: '#0ea5e9', class: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20' },
  { value: 'loyer', label: 'Loyer', hex: '#3b82f6', class: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20' },
  { value: 'caution', label: 'Caution & frais', hex: '#6366f1', class: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20' },
  { value: 'assurance', label: 'Assurance', hex: '#14b8a6', class: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20' },
  { value: 'achat', label: 'Achat & équipement', hex: '#10b981', class: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20' },
  { value: 'administration', label: 'Administration', hex: '#f43f5e', class: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20' },
  { value: 'autre', label: 'Autre', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' }
] as const

export const APARTMENT_KINDS = [
  { value: 'location', label: 'Location' },
  { value: 'achat', label: 'Achat' }
] as const

export const APARTMENT_STATUSES = [
  { value: 'a_visiter', label: 'À visiter', hex: '#0ea5e9', class: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20' },
  { value: 'visite_planifiee', label: 'Visite planifiée', hex: '#6366f1', class: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20' },
  { value: 'visite_faite', label: 'Visite faite', hex: '#f59e0b', class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20' },
  { value: 'interesse', label: 'Intéressé', hex: '#10b981', class: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20' },
  { value: 'refuse', label: 'Écarté', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' },
  { value: 'accepte', label: 'Retenu', hex: '#8b5cf6', class: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20' }
] as const

export const BOX_STATUSES = [
  { value: 'a_emballer', label: 'À emballer', hex: '#f59e0b', class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20' },
  { value: 'emballe', label: 'Emballé', hex: '#3b82f6', class: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20' },
  { value: 'transporte', label: 'Transporté', hex: '#8b5cf6', class: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20' },
  { value: 'devide', label: 'Dévidé', hex: '#10b981', class: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20' }
] as const

export const PUSH_REMINDER_OPTIONS = [
  { value: '0', label: 'À l’heure' },
  { value: '60', label: '1 heure avant' },
  { value: '1440', label: '1 jour avant' },
  { value: '2880', label: '2 jours avant' }
] as const

export const CALENDAR_KINDS = [
  { value: 'move', label: 'Jour J', hex: '#8b5cf6', class: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20' },
  { value: 'visit', label: 'Visites', hex: '#0ea5e9', class: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20' },
  { value: 'task', label: 'Échéances', hex: '#f59e0b', class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20' },
  { value: 'custom', label: 'Libres', hex: '#14b8a6', class: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20' }
] as const

export const REMINDER_OPTIONS = [
  { value: '0', label: 'À l’heure' },
  { value: '60', label: '1 heure avant' },
  { value: '1440', label: '1 jour avant' },
  { value: '2880', label: '2 jours avant' },
  { value: 'none', label: 'Aucun rappel' }
] as const

export const EVENT_REMINDER_OPTIONS = [
  { value: '-1', label: 'Rappel des paramètres' },
  { value: '-2', label: 'Aucun rappel' },
  { value: '0', label: 'À l’heure' },
  { value: '5', label: '5 minutes avant' },
  { value: '15', label: '15 minutes avant' },
  { value: '60', label: '1 heure avant' },
  { value: '1440', label: '1 jour avant' },
  { value: '2880', label: '2 jours avant' }
] as const

export const BOX_ROOMS = [
  { value: 'cuisine', label: 'Cuisine' },
  { value: 'salon', label: 'Salon' },
  { value: 'chambre', label: 'Chambre' },
  { value: 'salle_de_bain', label: 'Salle de bain' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'autres', label: 'Autres' }
] as const

export const CONTACT_ROLES = [
  { value: 'demenageur', label: 'Déménageur', hex: '#8b5cf6', class: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20' },
  { value: 'agence', label: 'Agence', hex: '#0ea5e9', class: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20' },
  { value: 'proprietaire', label: 'Propriétaire', hex: '#6366f1', class: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20' },
  { value: 'famille', label: 'Famille', hex: '#f43f5e', class: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20' },
  { value: 'autre', label: 'Autre', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' }
] as const

export const WORKSPACE_ROLES = [
  { value: 'owner', label: 'Propriétaire', hex: '#6366f1', class: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20' },
  { value: 'editor', label: 'Éditeur', hex: '#10b981', class: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20' },
  { value: 'viewer', label: 'Lecteur', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' }
] as const

export const INVITE_ROLES = [
  { value: 'editor', label: 'Éditeur — peut tout modifier', hex: '#10b981', class: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20' },
  { value: 'viewer', label: 'Lecteur — consultation seule', hex: '#64748b', class: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20' }
] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]['value']
export type TaskPriority = (typeof TASK_PRIORITIES)[number]['value']
export type TaskSort = (typeof TASK_SORT_OPTIONS)[number]['value']
export type TaskSortOrder = (typeof TASK_SORT_ORDER_OPTIONS)[number]['value']
export type TransactionType = (typeof TRANSACTION_TYPES)[number]['value']
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number]['value']
export type ApartmentKind = (typeof APARTMENT_KINDS)[number]['value']
export type ApartmentStatus = (typeof APARTMENT_STATUSES)[number]['value']
export type CalendarEventKind = (typeof CALENDAR_KINDS)[number]['value']
export type BoxStatus = (typeof BOX_STATUSES)[number]['value']
export type ContactRole = (typeof CONTACT_ROLES)[number]['value']

export function labelOf<T extends string>(options: readonly { value: T, label: string }[], value: T | string | null | undefined): string {
  return options.find((option) => option.value === value)?.label ?? String(value ?? '—')
}

export function metaOf<T extends { value: string }>(options: readonly T[], value: string | null | undefined): T | undefined {
  return options.find((option) => option.value === value)
}
