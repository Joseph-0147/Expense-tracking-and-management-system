<template>
  <div 
    v-if="show" 
    class="alert"
    :class="alertClasses"
    role="alert"
    :aria-live="type === 'danger' ? 'assertive' : 'polite'"
  >
    <div class="alert-content">
      <div class="alert-icon" v-if="showIcon">
        <i :class="iconClass"></i>
      </div>
      
      <div class="alert-body">
        <div v-if="title" class="alert-title">{{ title }}</div>
        <div class="alert-message">
          <slot>{{ message }}</slot>
        </div>
      </div>
      
      <button 
        v-if="dismissible" 
        @click="handleDismiss"
        class="alert-dismiss"
        aria-label="Dismiss alert"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div v-if="$slots.actions" class="alert-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'info', 'warning', 'danger'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  autoDismiss: {
    type: Number,
    default: 0 // 0 means no auto dismiss
  }
})

const emit = defineEmits(['dismiss'])

const alertClasses = computed(() => {
  return [
    `alert--${props.type}`,
    {
      'alert--dismissible': props.dismissible
    }
  ]
})

const iconClass = computed(() => {
  const iconMap = {
    success: 'fas fa-check-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle'
  }
  
  return iconMap[props.type] || iconMap.info
})

const handleDismiss = () => {
  emit('dismiss')
}

// Auto dismiss functionality
onMounted(() => {
  if (props.autoDismiss > 0) {
    setTimeout(() => {
      if (props.show) {
        handleDismiss()
      }
    }, props.autoDismiss)
  }
})
</script>

<style scoped>
.alert {
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  animation: alertSlideIn 0.3s ease-out;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.alert-message {
  font-size: 0.875rem;
  line-height: 1.5;
}

.alert-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.6;
  flex-shrink: 0;
}

.alert-dismiss:hover {
  opacity: 1;
}

.alert-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Alert variants */
.alert--success {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #22c55e;
  color: #15803d;
}

.alert--success .alert-icon {
  color: #22c55e;
}

.alert--success .alert-dismiss:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.alert--info {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1d4ed8;
}

.alert--info .alert-icon {
  color: #3b82f6;
}

.alert--info .alert-dismiss:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.alert--warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #f59e0b;
  color: #d97706;
}

.alert--warning .alert-icon {
  color: #f59e0b;
}

.alert--warning .alert-dismiss:hover {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.alert--danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  color: #dc2626;
}

.alert--danger .alert-icon {
  color: #ef4444;
}

.alert--danger .alert-dismiss:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Animations */
@keyframes alertSlideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .alert {
    padding: 0.75rem;
  }
  
  .alert-content {
    gap: 0.5rem;
  }
  
  .alert-icon {
    font-size: 1rem;
  }
  
  .alert-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>