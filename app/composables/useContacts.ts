import type { Contact } from '~/types'

export function useContacts() {
  return useCollection<Contact>('contacts')
}
