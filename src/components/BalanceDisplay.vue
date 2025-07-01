<template>
  <div class="card balance-card">
    <h2
      class="text-lg font-semibold text-secondary mb-4 flex items-center justify-center gap-2"
    >
      💰 Current Balance
    </h2>
    <p class="balance-amount text-center" :class="{ negative: balance < 0 }">
      Ksh{{ formattedBalance }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  balance: {
    type: Number,
    required: true,
  },
});

const formattedBalance = computed(() => {
  return props.balance.toFixed(2);
});
</script>

<style scoped>
.balance-card {
  position: relative;
  overflow: hidden;
  text-align: center;
}

.balance-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.balance-amount {
  font-size: 3rem !important;
  font-weight: 800 !important;
  background: linear-gradient(
    135deg,
    var(--secondary-500),
    var(--secondary-600)
  ) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  margin: 0 !important;
}

.balance-amount.negative {
  background: linear-gradient(135deg, var(--danger-500), var(--danger-600)) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
</style>
