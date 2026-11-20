import type { Apartment } from '~/types'
import { APARTMENT_STATUSES } from '~/utils/constants'

export function useApartments() {
  const collection = useCollection<Apartment>('apartments')

  const shortlist = computed(() => collection.items.value
    .filter((apartment) => ['interesse', 'accepte'].includes(apartment.status))
    .sort((a, b) => b.rating - a.rating))

  const upcomingVisits = computed(() => collection.items.value
    .filter((apartment) => apartment.visit_date && new Date(apartment.visit_date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.visit_date!).getTime() - new Date(b.visit_date!).getTime()))

  const counts = computed(() => APARTMENT_STATUSES.map((status) => ({
    ...status,
    count: collection.items.value.filter((apartment) => apartment.status === status.value).length
  })))

  const averageRent = computed(() => {
    const rentals = collection.items.value.filter((apartment) => apartment.kind === 'location' && Number(apartment.price) > 0)
    if (rentals.length === 0) return 0
    return rentals.reduce((sum, apartment) => sum + Number(apartment.price), 0) / rentals.length
  })

  return { ...collection, shortlist, upcomingVisits, counts, averageRent }
}
