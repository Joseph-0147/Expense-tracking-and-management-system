<template>
  <div class="savings-card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">🎯 Savings</h2>
      <button
        @click="showSavingsModal = true"
        class="btn btn-primary bg-white/20 border-white/30"
      >
        Manage
      </button>
    </div>

    <div class="savings-overview grid gap-6">
      <div class="savings-stat">
        <span class="stat-label">Current Savings</span>
        <span class="stat-value"
          >Ksh{{ financeStore.savings.totalSaved?.toFixed(2) || "0.00" }}</span
        >
      </div>

      <div v-if="financeStore.savings.savingsGoal > 0" class="savings-stat">
        <span class="stat-label">Goal Progress</span>
        <div class="progress-container flex items-center gap-4 mt-2">
          <div class="progress-bar flex-1">
            <div
              class="progress-fill bg-green-500"
              :style="{
                width: `${Math.min(
                  (financeStore.savings.totalSaved / financeStore.savings.savingsGoal) *
                    100,
                  100
                )}%`,
              }"
            ></div>
          </div>
          <span class="progress-text font-semibold">
            {{
              (
                (financeStore.savings.totalSaved / financeStore.savings.savingsGoal) *
                100
              ).toFixed(0)
            }}%
          </span>
        </div>
        <div class="text-sm opacity-90 mt-2">
          Goal: Ksh{{ financeStore.savings.savingsGoal?.toFixed(2) }}
        </div>
      </div>
    </div>

    <!-- Savings Modal -->
    <div
      v-if="showSavingsModal"
      class="modal-overlay"
      @click.self="showSavingsModal = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Manage Savings</h3>
          <button @click="showSavingsModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="grid gap-6">
            <!-- Add to Savings -->
            <div class="action-section">
              <h4 class="font-semibold mb-3 text-green-600">💰 Add to Savings</h4>
              <form @submit.prevent="addToSavings" class="flex gap-2">
                <input
                  v-model="addAmount"
                  type="number"
                  step="0.01"
                  class="form-input flex-1"
                  placeholder="Amount to add"
                  min="0"
                />
                <button type="submit" class="btn btn-secondary">Add</button>
              </form>
            </div>

            <!-- Withdraw from Savings -->
            <div class="action-section">
              <h4 class="font-semibold mb-3 text-orange-600">💸 Withdraw</h4>
              <form @submit.prevent="withdrawFromSavings" class="flex gap-2">
                <input
                  v-model="withdrawAmount"
                  type="number"
                  step="0.01"
                  class="form-input flex-1"
                  placeholder="Amount to withdraw"
                  min="0"
                  :max="financeStore.savings.totalSaved"
                />
                <button type="submit" class="btn btn-ghost">Withdraw</button>
              </form>
            </div>

            <!-- Set Savings Goal -->
            <div class="action-section">
              <h4 class="font-semibold mb-3 text-blue-600">🎯 Set Goal</h4>
              <form @submit.prevent="setSavingsGoal" class="flex gap-2">
                <input
                  v-model="savingsGoal"
                  type="number"
                  step="0.01"
                  class="form-input flex-1"
                  placeholder="Savings goal"
                  min="0"
                />
                <button type="submit" class="btn btn-primary">Set Goal</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useFinanceStore } from "@/stores/finance";

const financeStore = useFinanceStore();

const showSavingsModal = ref(false);
const addAmount = ref("");
const withdrawAmount = ref("");
const savingsGoal = ref(financeStore.savings.savingsGoal || "");

const addToSavings = () => {
  try {
    const amount = parseFloat(addAmount.value);
    if (amount > 0) {
      financeStore.addToSavings(amount);
      addAmount.value = "";
    }
  } catch (error) {
    console.error("Error adding to savings:", error);
  }
};

const withdrawFromSavings = () => {
  try {
    const amount = parseFloat(withdrawAmount.value);
    if (amount > 0 && amount <= financeStore.savings.totalSaved) {
      financeStore.withdrawFromSavings(amount);
      withdrawAmount.value = "";
    }
  } catch (error) {
    console.error("Error withdrawing from savings:", error);
  }
};

const setSavingsGoal = () => {
  const goal = parseFloat(savingsGoal.value);
  if (goal >= 0) {
    financeStore.setSavingsGoal(goal);
    showSavingsModal.value = false;
  }
};
</script>

<style scoped>
.savings-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
}

.savings-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: var(--radius-sm);
}

.action-section {
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}
</style>
