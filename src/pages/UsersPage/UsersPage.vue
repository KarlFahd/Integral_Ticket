<script setup>
import './UsersPage.scss'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { UserPlus, Users, Search, X } from 'lucide-vue-next'
import { useSidebar } from '../../composables/useSidebar.js'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import { useUserStore } from '../../stores/userStore.js'

const store = useUserStore()
const { users, isLoading } = storeToRefs(store)

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()
const showForm   = ref(false)
const formError  = ref('')
const submitting = ref(false)
const searchText = ref('')

const filteredUsers = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
  )
})

const form = ref({ name: '', username: '', email: '', password: '', is_hr: false })

const resetForm = () => {
  form.value = { name: '', username: '', email: '', password: '', is_hr: false }
  formError.value = ''
}

onMounted(() => store.fetchUsers())

const openForm = () => { resetForm(); showForm.value = true }
const closeForm = () => { showForm.value = false; resetForm() }

const handleCreate = async () => {
  formError.value = ''
  if (!form.value.name || !form.value.username || !form.value.email || !form.value.password) {
    formError.value = 'All fields are required.'
    return
  }
  submitting.value = true
  try {
    await store.createUser(form.value)
    closeForm()
  } catch (e) {
    const errors = e?.response?.data?.errors
    if (errors) {
      formError.value = Object.values(errors).flat().join(' ')
    } else {
      formError.value = e?.response?.data?.message || 'Could not create user.'
    }
  } finally {
    submitting.value = false
  }
}

const roleLabel = (u) => {
  if (u.is_admin) return 'Agent'
  if (u.is_hr)    return 'HR'
  return 'Employee'
}

const roleVariant = (u) => {
  if (u.is_admin) return 'admin'
  if (u.is_hr)    return 'hr'
  return 'employee'
}
</script>

<template>
  <div class="users-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="users-page__content">
      <AppHeader title="Users" subtitle="Manage team members" @toggle-sidebar="toggleSidebar" />

      <!-- Page header -->
      <div class="users-header">
        <div class="users-header__left">
          <Users :size="20" />
          <span>{{ users.length }} member{{ users.length !== 1 ? 's' : '' }}</span>
        </div>
        <button class="users-header__add" @click="openForm">
          <UserPlus :size="16" /> Add User
        </button>
      </div>

      <!-- Create User Form -->
      <div v-if="showForm" class="user-form-card">
        <div class="user-form-card__header">
          <h3>New User</h3>
          <button class="user-form-card__close" @click="closeForm"><X :size="16" /></button>
        </div>

        <div class="user-form-grid">
          <div class="user-form-field">
            <label>Full Name *</label>
            <input v-model="form.name" type="text" placeholder="Karl Fahed" />
          </div>
          <div class="user-form-field">
            <label>Username *</label>
            <input v-model="form.username" type="text" placeholder="karl" />
          </div>
          <div class="user-form-field">
            <label>Email *</label>
            <input v-model="form.email" type="email" placeholder="karl@integra.com" />
          </div>
          <div class="user-form-field">
            <label>Password *</label>
            <input v-model="form.password" type="password" placeholder="Min. 6 characters" />
          </div>
        </div>

        <div class="user-form-roles">
          <label class="role-toggle" :class="{ 'role-toggle--active': form.is_hr }">
            <input v-model="form.is_hr" type="checkbox" />
            <Users :size="15" />
            HR Access
          </label>
        </div>

        <p v-if="formError" class="user-form-error">{{ formError }}</p>

        <div class="user-form-actions">
          <button class="user-form-cancel" @click="closeForm">Cancel</button>
          <button class="user-form-submit" :disabled="submitting" @click="handleCreate">
            {{ submitting ? 'Creating…' : 'Create User' }}
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="users-search">
        <Search :size="18" />
        <input
          v-model="searchText"
          type="text"
          placeholder="Search by name or username..."
        />
      </div>

      <!-- Users table: skeleton rows while loading -->
      <template v-if="isLoading">
        <div class="users-table-wrap users-table-wrap--skeleton">
          <SkeletonLoader v-for="i in 5" :key="i" variant="row" />
        </div>
      </template>

      <template v-else>
        <div class="users-table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u.id">
                <td>
                  <div class="users-table__name">
                    <div class="users-table__avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
                    {{ u.name }}
                  </div>
                </td>
                <td class="users-table__username">@{{ u.username }}</td>
                <td class="users-table__email">{{ u.email }}</td>
                <td>
                  <span :class="['role-badge', `role-badge--${roleVariant(u)}`]">
                    {{ roleLabel(u) }}
                  </span>
                </td>
                <td class="users-table__date">{{ u.created_at }}</td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="users-table__empty">
                  {{ searchText ? 'No users match your search.' : 'No users found.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

    </main>
  </div>
</template>
