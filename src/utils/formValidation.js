// Form validation utilities for consistent validation across the application

/**
 * Validate required fields
 * @param {*} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} Validation result { isValid: boolean, error: string }
 */
export function validateRequired(value, fieldName = 'Field') {
  const trimmedValue = typeof value === 'string' ? value.trim() : value
  
  if (trimmedValue === null || trimmedValue === undefined || trimmedValue === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Validate numeric values
 * @param {*} value - The value to validate
 * @param {object} options - Validation options { min, max, allowZero, fieldName }
 * @returns {object} Validation result { isValid: boolean, error: string }
 */
export function validateNumber(value, options = {}) {
  const { min = 0, max = null, allowZero = false, fieldName = 'Amount' } = options
  
  const numValue = Number(value)
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`
    }
  }
  
  if (!allowZero && numValue <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be greater than 0`
    }
  }
  
  if (numValue < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`
    }
  }
  
  if (max !== null && numValue > max) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed ${max}`
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Validate date values
 * @param {*} value - The date value to validate
 * @param {object} options - Validation options { allowPast, allowFuture, fieldName }
 * @returns {object} Validation result { isValid: boolean, error: string }
 */
export function validateDate(value, options = {}) {
  const { allowPast = true, allowFuture = true, fieldName = 'Date' } = options
  
  if (!value) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    }
  }
  
  try {
    const dateObj = new Date(value)
    
    if (isNaN(dateObj.getTime())) {
      return {
        isValid: false,
        error: `${fieldName} must be a valid date`
      }
    }
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    if (!allowPast && dateObj < now) {
      return {
        isValid: false,
        error: `${fieldName} cannot be in the past`
      }
    }
    
    if (!allowFuture && dateObj > now) {
      return {
        isValid: false,
        error: `${fieldName} cannot be in the future`
      }
    }
    
    return { isValid: true, error: null }
  } catch (error) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid date`
    }
  }
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {object} Validation result { isValid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email is required'
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Validate form object with multiple fields
 * @param {object} formData - The form data to validate
 * @param {object} rules - Validation rules for each field
 * @returns {object} Validation result { isValid: boolean, errors: object }
 */
export function validateForm(formData, rules) {
  const errors = {}
  let isValid = true
  
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const fieldValue = formData[fieldName]
    
    for (const rule of fieldRules) {
      const result = rule(fieldValue, fieldName)
      
      if (!result.isValid) {
        errors[fieldName] = result.error
        isValid = false
        break // Stop at first error for this field
      }
    }
  }
  
  return { isValid, errors }
}

/**
 * Create validation rule for required field
 * @param {string} fieldName - Display name for the field
 * @returns {function} Validation function
 */
export function required(fieldName) {
  return (value) => validateRequired(value, fieldName)
}

/**
 * Create validation rule for numeric field
 * @param {object} options - Validation options
 * @returns {function} Validation function
 */
export function numeric(options = {}) {
  return (value) => validateNumber(value, options)
}

/**
 * Create validation rule for date field
 * @param {object} options - Validation options
 * @returns {function} Validation function
 */
export function date(options = {}) {
  return (value) => validateDate(value, options)
}

/**
 * Create validation rule for email field
 * @returns {function} Validation function
 */
export function email() {
  return (value) => validateEmail(value)
}