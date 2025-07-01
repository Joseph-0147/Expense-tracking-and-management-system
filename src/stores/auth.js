// ===== 1. AUTH STORE (src/stores/auth.js) =====
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userInitials = computed(() => {
    if (!user.value) return ''
    const names = user.value.name.split(' ')
    return names.map(name => name.charAt(0)).join('').toUpperCase()
  })

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - replace with actual API response
      const mockUser = {
        id: 1,
        email: credentials.email,
        name: credentials.name || 'Student User',
        avatar: null,
        studentId: 'STU2024001',
        university: 'University of Example',
        major: 'Computer Science',
        year: 'Junior',
        createdAt: new Date().toISOString()
      }
      
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      // Store in state
      user.value = mockUser
      token.value = mockToken
      
      // Store in localStorage
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      
      return { success: true, user: mockUser }
    } catch (err) {
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Mock registration
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        avatar: null,
        studentId: userData.studentId,
        university: userData.university,
        major: userData.major,
        year: userData.year,
        createdAt: new Date().toISOString()
      }
      
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      user.value = newUser
      token.value = mockToken
      
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(newUser))
      
      return { success: true, user: newUser }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('studentFinanceBalance')
    localStorage.removeItem('studentFinanceTransactions')
  }

  const loadUserFromStorage = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  const updateProfile = async (profileData) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const updatedUser = { ...user.value, ...profileData }
      user.value = updatedUser
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      
      return { success: true, user: updatedUser }
    } catch (err) {
      error.value = err.message || 'Profile update failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userInitials,
    // Actions
    login,
    register,
    logout,
    loadUserFromStorage,
    updateProfile
  }
})