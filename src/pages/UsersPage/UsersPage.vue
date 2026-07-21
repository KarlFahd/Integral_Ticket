<script setup>
import './UsersPage.scss'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { UserPlus, Users, X } from 'lucide-vue-next'
import { useSidebar } from '../../composables/useSidebar.js'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseInput from '../../components/common/BaseInput/BaseInput.vue'
import BaseSearchInput from '../../components/common/BaseSearchInput/BaseSearchInput.vue'
import BaseIconButton from '../../components/common/BaseIconButton/BaseIconButton.vue'
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
const fieldErrors = ref({ name: '', username: '', email: '', password: '' })

const resetForm = () => {
  form.value = { name: '', username: '', email: '', password: '', is_hr: false }
  fieldErrors.value = { name: '', username: '', email: '', password: '' }
  formError.value = ''
}

onMounted(() => store.fetchUsers())

const openForm = () => { resetForm(); showForm.value = true }
const closeForm = () => { showForm.value = false; resetForm() }

const clearFieldError = (field) => { fieldErrors.value[field] = '' }

const updateField = (field, value) => {
  form.value[field] = value
  clearFieldError(field)
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateForm = () => {
  const errors = { name: '', username: '', email: '', password: '' }

  if (!form.value.name.trim())      errors.name = 'Full name is required.'
  if (!form.value.username.trim())  errors.username = 'Username is required.'

  if (!form.value.email.trim())          errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(form.value.email.trim())) errors.email = 'Enter a valid email address.'

  if (!form.value.password)              errors.password = 'Password is required.'
  else if (form.value.password.length < 6) errors.password = 'Password must be at least 6 characters.'

  fieldErrors.value = errors
  return Object.values(errors).every(msg => !msg)
}

const handleCreate = async () => {
  formError.value = ''
  if (!validateForm()) return

  submitting.value = true
  try {
    await store.createUser(form.value)
    closeForm()
  } catch (e) {
    const errors = e?.response?.data?.errors
    if (errors) {
      for (const field of Object.keys(fieldErrors.value)) {
        if (errors[field]) fieldErrors.value[field] = errors[field][0]
      }
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
        <BaseButton variant="primary" size="md" :full-width="false" class="users-header__add" @click="openForm">
          <UserPlus :size="16" /> Add User
        </BaseButton>
      </div>

      <!-- Create User Form -->
      <div v-if="showForm" class="user-form-card">
        <div class="user-form-card__header">
          <h3>New User</h3>
          <BaseIconButton variant="ghost-danger" class="user-form-card__close" @click="closeForm"><X :size="16" /></BaseIconButton>
        </div>

        <div class="user-form-grid">
          <div class="user-form-field">
            <BaseInput
              :model-value="form.name"
              label="Full Name"
              required
              placeholder="Karl Fahed"
              :error="!!fieldErrors.name"
              @update:model-value="updateField('name', $event)"
            />
            <span v-if="fieldErrors.name" class="user-form-field__error">{{ fieldErrors.name }}</span>
          </div>
          <div class="user-form-field">
            <BaseInput
              :model-value="form.username"
              label="Username"
              required
              placeholder="karl"
              :error="!!fieldErrors.username"
              @update:model-value="updateField('username', $event)"
            />
            <span v-if="fieldErrors.username" class="user-form-field__error">{{ fieldErrors.username }}</span>
          </div>
          <div class="user-form-field">
            <BaseInput
              :model-value="form.email"
              type="email"
              label="Email"
              required
              placeholder="karl@integra.com"
              :error="!!fieldErrors.email"
              @update:model-value="updateField('email', $event)"
            />
            <span v-if="fieldErrors.email" class="user-form-field__error">{{ fieldErrors.email }}</span>
          </div>
          <div class="user-form-field">
            <BaseInput
              :model-value="form.password"
              type="password"
              label="Password"
              required
              placeholder="Min. 6 characters"
              :error="!!fieldErrors.password"
              @update:model-value="updateField('password', $event)"
            />
            <span v-if="fieldErrors.password" class="user-form-field__error">{{ fieldErrors.password }}</span>
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
          <BaseButton variant="secondary" size="md" :full-width="false" @click="closeForm">Cancel</BaseButton>
          <BaseButton variant="primary" size="md" :full-width="false" :disabled="submitting" @click="handleCreate">
            {{ submitting ? 'Creating…' : 'Create User' }}
          </BaseButton>
        </div>
      </div>

      <!-- Search -->
      <BaseSearchInput
        v-model="searchText"
        placeholder="Search by name or username..."
        class="users-search"
      />

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
