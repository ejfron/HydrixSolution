import { ref } from 'vue'

const isMobileSidebarOpen = ref(false)

export const useSidebarState = () => {
  const toggleMobileSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }
 
  const closeMobileSidebar = () => {
    isMobileSidebarOpen.value = false
  }

  const openMobileSidebar = () => {
    isMobileSidebarOpen.value = true
  }

  return {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
    openMobileSidebar
  }
}