<template>
  <div class="summary-card" :class="cardClass" :style="cardStyle">
    <span class="summary-label">{{ label }}</span>
    <span class="summary-value" :class="valueClass">
      {{ formattedValue }}
    </span>
    <div v-if="$slots.footer" class="summary-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'currency', 'percentage', 'count'].includes(value)
  },
  status: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'positive', 'negative', 'warning', 'danger'].includes(value)
  },
  borderColor: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: 'Ksh'
  }
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return 'N/A'
  }

  const numValue = Number(props.value)
  
  switch (props.type) {
    case 'currency':
      return isNaN(numValue) ? props.value : `${props.currency}${numValue.toFixed(2)}`
    case 'percentage':
      return isNaN(numValue) ? props.value : `${numValue.toFixed(1)}%`
    case 'count':
      return isNaN(numValue) ? props.value : numValue.toString()
    default:
      return props.value.toString()
  }
})

const cardClass = computed(() => {
  const classes = []
  
  if (props.status !== 'default') {
    classes.push(`summary-card--${props.status}`)
  }
  
  return classes.join(' ')
})

const valueClass = computed(() => {
  const classes = []
  
  if (props.status === 'negative' || props.status === 'danger') {
    classes.push('negative')
  } else if (props.status === 'positive') {
    classes.push('positive')
  } else if (props.status === 'warning') {
    classes.push('warning')
  }
  
  return classes.join(' ')
})

const cardStyle = computed(() => {
  const style = {}
  
  if (props.borderColor) {
    style['border-left-color'] = props.borderColor
  }
  
  return style
})
</script>

<style scoped>
.summary-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border-left: 4px solid var(--primary-500);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.summary-value.positive {
  color: var(--success-600);
}

.summary-value.negative {
  color: var(--danger-600);
}

.summary-value.warning {
  color: var(--warning-600);
}

.summary-footer {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Status variants */
.summary-card--positive {
  border-left-color: var(--success-500);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.summary-card--negative {
  border-left-color: var(--danger-500);
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.summary-card--warning {
  border-left-color: var(--warning-500);
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.summary-card--danger {
  border-left-color: var(--danger-500);
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .summary-card {
    padding: 1rem;
  }
  
  .summary-value {
    font-size: 1.25rem;
  }
}
</style>