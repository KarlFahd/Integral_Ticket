import { ref } from 'vue'

// Module-level (not created inside the function) so every page shares the
// exact same collapsed/expanded state — needed now that AppHeader also
// reads it (to know how much space the fixed sidebar takes up), and as a
// side effect the sidebar no longer forgets it was collapsed when you
// navigate to another page.
const isSidebarCollapsed = ref(window.innerWidth < 768)

export function useSidebar() {
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const closeSidebar = () => {
    isSidebarCollapsed.value = true
  }

  return { isSidebarCollapsed, toggleSidebar, closeSidebar }
}
