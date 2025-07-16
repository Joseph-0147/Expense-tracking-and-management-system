<template>
  <div 
    v-if="show" 
    class="modal-overlay" 
    @click="handleOverlayClick"
    :class="{ 'modal-overlay--closing': isClosing }"
  >
    <div 
      class="modal-content" 
      :class="modalSizeClass"
      @click.stop
      ref="modalContent"
    >
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-section">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <slot v-else name="title"></slot>
        </div>
        <button 
          @click="handleClose" 
          class="modal-close-btn"
          aria-label="Close modal"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <slot></slot>
      </div>

      <!-- Modal Footer -->
      <div v-if="$slots.footer || showDefaultFooter" class="modal-footer">
        <slot name="footer">
          <div v-if="showDefaultFooter" class="modal-default-footer">
            <button 
              @click="handleClose" 
              class="btn btn-secondary"
              :disabled="loading"
            >
              Cancel
            </button>
            <button 
              @click="handleConfirm" 
              class="btn btn-primary"
              :disabled="loading || !canConfirm"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              {{ confirmText }}
            </button>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'extra-large'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  showDefaultFooter: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  canConfirm: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const modalContent = ref(null)
const isClosing = ref(false)

const modalSizeClass = computed(() => {
  return `modal-content--${props.size}`
})

const handleClose = () => {
  if (!props.closable || props.loading) return
  
  isClosing.value = true
  setTimeout(() => {
    emit('close')
    isClosing.value = false
  }, 150)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

const handleConfirm = () => {
  if (!props.canConfirm || props.loading) return
  emit('confirm')
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && props.show && props.closable) {
    handleClose()
  }
}

// Focus management
const focusFirstElement = () => {
  nextTick(() => {
    if (modalContent.value) {
      const focusableElements = modalContent.value.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }
  })
}

const trapFocus = (event) => {
  if (!modalContent.value) return
  
  const focusableElements = modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Prevent body scroll when modal is open
const preventBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const restoreBodyScroll = () => {
  document.body.style.overflow = ''
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    preventBodyScroll()
    focusFirstElement()
  } else {
    restoreBodyScroll()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', trapFocus)
  
  if (props.show) {
    preventBodyScroll()
    focusFirstElement()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', trapFocus)
  restoreBodyScroll()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  opacity: 1;
  animation: modalFadeIn 0.2s ease-out;
}

.modal-overlay--closing {
  animation: modalFadeOut 0.15s ease-in;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.2s ease-out;
  transform: scale(1);
}

.modal-content--small {
  width: 100%;
  max-width: 400px;
}

.modal-content--medium {
  width: 100%;
  max-width: 500px;
}

.modal-content--large {
  width: 100%;
  max-width: 700px;
}

.modal-content--extra-large {
  width: 100%;
  max-width: 900px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 2rem;
  height: 2rem;
}

.modal-close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-default-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-default-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-content--small,
  .modal-content--medium,
  .modal-content--large,
  .modal-content--extra-large {
    max-width: none;
    width: 100%;
    margin: 0.5rem;
  }
}</style>