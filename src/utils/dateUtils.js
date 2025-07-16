// Date utility functions for consistent date formatting across the application

/**
 * Format a date string for display
 * @param {string|Date} date - The date to format
 * @param {string} format - The format type ('short', 'long', 'medium')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'medium') {
  if (!date) return 'N/A'
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    
    const options = {
      short: { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      },
      medium: { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      },
      long: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    }
    
    return dateObj.toLocaleDateString('en-US', options[format] || options.medium)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 * @param {string|Date} date - The date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return 'N/A'
  
  try {
    const dateObj = new Date(date)
    const now = new Date()
    const diffInMs = dateObj.getTime() - now.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Tomorrow'
    if (diffInDays === -1) return 'Yesterday'
    if (diffInDays > 0) return `In ${diffInDays} days`
    return `${Math.abs(diffInDays)} days ago`
  } catch (error) {
    console.error('Error calculating relative time:', error)
    return 'N/A'
  }
}

/**
 * Check if a date is overdue
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export function isOverdue(date) {
  if (!date) return false
  
  try {
    const dateObj = new Date(date)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today
    return dateObj < now
  } catch (error) {
    console.error('Error checking if date is overdue:', error)
    return false
  }
}

/**
 * Check if a date is upcoming (within specified days)
 * @param {string|Date} date - The date to check
 * @param {number} days - Number of days to check ahead (default: 7)
 * @returns {boolean} True if the date is upcoming
 */
export function isUpcoming(date, days = 7) {
  if (!date) return false
  
  try {
    const dateObj = new Date(date)
    const now = new Date()
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
    
    return dateObj >= now && dateObj <= futureDate
  } catch (error) {
    console.error('Error checking if date is upcoming:', error)
    return false
  }
}

/**
 * Get current month name
 * @returns {string} Current month name
 */
export function getCurrentMonth() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}