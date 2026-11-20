import type { Component } from 'vue'
import {
  Box,
  Building2,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Package,
  ContactRound,
  Settings,
  UsersRound,
  Wallet
} from '@lucide/vue'

export interface NavItem {
  to: string
  label: string
  title: string
  subtitle: string
  icon: Component
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Vue d’ensemble', title: 'Vue d’ensemble', subtitle: 'Votre déménagement en un coup d’œil', icon: LayoutDashboard },
  { to: '/taches', label: 'Tâches', title: 'Tâches', subtitle: 'Tout ce qu’il reste à faire', icon: ListTodo },
  { to: '/budget', label: 'Budget', title: 'Budget', subtitle: 'Suivez vos dépenses et vos enveloppes', icon: Wallet },
  { to: '/appartements', label: 'Appartements', title: 'Appartements', subtitle: 'Vos visites et votre shortlist', icon: Building2 },
  { to: '/calendrier', label: 'Calendrier', title: 'Calendrier', subtitle: 'Visites, échéances et jour J', icon: CalendarDays },
  { to: '/cartons', label: 'Cartons', title: 'Cartons', subtitle: 'Votre inventaire de déménagement', icon: Package },
  { to: '/contacts', label: 'Contacts', title: 'Contacts', subtitle: 'Déménageurs, agences et propriétaires', icon: ContactRound },
  { to: '/equipe', label: 'Équipe', title: 'Équipe & accès', subtitle: 'Invitez et gérez les droits de votre espace', icon: UsersRound },
  { to: '/parametres', label: 'Paramètres', title: 'Paramètres', subtitle: 'Vos informations de déménagement', icon: Settings }
]

export const BRAND_ICON = Box
