import type { Task } from '~/types'
import { isOverdue } from '~/utils/format'

export function useTasks() {
  const collection = useCollection<Task>('tasks')

  const pending = computed(() => collection.items.value.filter((task) => !task.done))
  const done = computed(() => collection.items.value.filter((task) => task.done))
  const completion = computed(() => {
    const total = collection.items.value.length
    return total === 0 ? 0 : Math.round((done.value.length / total) * 100)
  })
  const urgent = computed(() => pending.value.filter((task) => task.priority === 'haute' || isOverdue(task.due_date)))

  async function toggle(task: Task) {
    return collection.update(task.id, { done: !task.done }, true)
  }

  return { ...collection, pending, done, completion, urgent, toggle }
}
