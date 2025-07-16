<template>
  <div class="card-header" :class="headerClass">
    <div class="card-title-section">
      <h2 v-if="title" class="card-title">
        <i v-if="icon" :class="icon" class="card-icon"></i>
        {{ title }}
      </h2>
      <slot v-else name="title"></slot>
      
      <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      <slot v-else name="subtitle"></slot>
    </div>
    
    <div v-if="$slots.actions || showAddButton" class="card-actions">
      <slot name="actions">
        <button 
          v-if="showAddButton"
          @click="handleAddClick"
          class="btn btn-primary"
          :disabled="addButtonDisabled"
        >
          <i class="fas fa-plus"></i>
          {{ addButtonText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showAddButton: {
    type: Boolean,
    default: false
  },
  addButtonText: {
    type: String,
    default: 'Add'
  },
  addButtonDisabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'bordered'].includes(value)
  }
})

const emit = defineEmits(['add'])

const headerClass = computed(() => {
  return [
    `card-header--${props.variant}`
  ]
})

const handleAddClick = () => {
  emit('add')
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.card-header--compact {
  padding: 1rem;
}

.card-header--bordered {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem 0.75rem 0 0;
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;
}

.card-icon {
  font-size: 1.125rem;
  color: #667eea;
  flex-shrink: 0;
}

.card-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .card-header--compact {
    padding: 0.75rem;
  }
  
  .card-title {
    font-size: 1.125rem;
  }
  
  .card-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1rem;
    flex-wrap: wrap;
  }
  
  .card-icon {
    font-size: 1rem;
  }
  
  .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}</style>