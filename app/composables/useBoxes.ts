import type { MovingBox } from '~/types'
import { BOX_STATUSES } from '~/utils/constants'

export function useBoxes() {
  const collection = useCollection<MovingBox>('boxes')

  const progress = computed(() => {
    const total = collection.items.value.length
    if (total === 0) return 0
    const finished = collection.items.value.filter((box) => box.status === 'emballe' || box.status === 'transporte' || box.status === 'devide').length
    return Math.round((finished / total) * 100)
  })

  const grouped = computed(() => BOX_STATUSES.map((status) => ({
    ...status,
    boxes: collection.items.value.filter((box) => box.status === status.value)
  })))

  return { ...collection, progress, grouped }
}
