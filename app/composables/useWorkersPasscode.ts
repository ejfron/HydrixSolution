// composables/useWorkersPasscode.ts
import { ref } from 'vue'

export const useWorkersPasscode = (plan: 'basic' | 'standard' | 'premium') => {
  // 🔑 Scoped storage key
  const storageKey = `workers_passcode_${plan}`
  const isAuthenticated = ref(false)
  const showPasscodeModal = ref(false)
  const showSetupModal = ref(false)
  const pendingPath = ref<string | null>(null)
  const hasPasscode = ref(false)

  // Check if passcode exists in localStorage
  const checkPasscodeExists = () => {
    const savedPasscode = localStorage.getItem(storageKey)
    hasPasscode.value = !!savedPasscode
    return hasPasscode.value
  }

  // Set up new passcode
  const setupPasscode = (newPasscode: string): boolean => {
    if (newPasscode.length === 4 && /^\d+$/.test(newPasscode)) {
      localStorage.setItem(storageKey, newPasscode)
      hasPasscode.value = true
      return true
    }
    return false
  }

  // Verify entered passcode
  const verifyPasscode = (enteredPasscode: string): boolean => {
    const savedPasscode = localStorage.getItem(storageKey)
    if (enteredPasscode === savedPasscode) {
      isAuthenticated.value = true
      showPasscodeModal.value = false
      return true
    }
    return false
  }

  // Reset authentication (call this when leaving the page)
  const resetAuth = () => {
    isAuthenticated.value = false
  }

  // Change existing passcode
  const changePasscode = (oldPasscode: string, newPasscode: string): boolean => {
    const savedPasscode = localStorage.getItem(storageKey)
    if (oldPasscode === savedPasscode && newPasscode.length === 4 && /^\d+$/.test(newPasscode)) {
      localStorage.setItem(storageKey, newPasscode)
      return true
    }
    return false
  }

  // Reset passcode (forgot passcode) – optional, if you want to wipe the key
  const resetPasscode = () => {
    localStorage.removeItem(storageKey)
    hasPasscode.value = false
    isAuthenticated.value = false
  }

  const checkSession = () => {
    isAuthenticated.value = false
    checkPasscodeExists()
  }

  const requireAuth = (path: string) => {
    if (!isAuthenticated.value) {
      pendingPath.value = path
      if (hasPasscode.value) {
        showPasscodeModal.value = true
      } else {
        showSetupModal.value = true
      }
      return false
    }
    return true
  }

  return {
    isAuthenticated,
    showPasscodeModal,
    showSetupModal,
    pendingPath,
    hasPasscode,
    checkPasscodeExists,
    setupPasscode,
    verifyPasscode,
    changePasscode,
    resetPasscode,
    resetAuth,
    checkSession,
    requireAuth,
  }
}