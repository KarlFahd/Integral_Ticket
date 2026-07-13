import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '../services/usersApi.js'
import { useToast }  from '../composables/useToast.js'

export const useUserStore = defineStore('users', () => {
  const toast = useToast()

  const users     = ref([])
  const isLoading = ref(false)
  const error     = ref(null)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null
    try {
      users.value = await usersApi.getAll()
    } catch (e) {
      error.value = 'Failed to load users.'
      toast.error('Could not load users. Please refresh.')
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(payload) {
    const created = await usersApi.create(payload)
    users.value.push(created)
    toast.success('User created successfully.')
    return created
  }

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
  }
})
