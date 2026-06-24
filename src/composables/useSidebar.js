import { ref } from 'vue'

export function useSidebar(startCollapsed = false) {
  const isSidebarCollapsed = ref(window.innerWidth < 768 ? true : startCollapsed)

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const closeSidebar = () => {
    isSidebarCollapsed.value = true
  }

  return { isSidebarCollapsed, toggleSidebar, closeSidebar }
}
