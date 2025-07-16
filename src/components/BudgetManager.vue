<template>
  <div class="budget-manager">
    <CardHeader
      title="Budget Tracker"
      icon="fas fa-chart-pie"
      :show-add-button="true"
      add-button-text="Add Budget"
      @add="showBudgetModal = true"
    />

    <!-- Budget Summary -->
    <div class="budget-summary">
      <SummaryCard
        label="Total Budgeted"
        :value="financeStore.budgetSummary?.totalBudgeted || 0"
        type="currency"
      />
      <SummaryCard
        label="Total Spent"
        :value="financeStore.budgetSummary?.totalSpent || 0"
        type="currency"
        status="warning"
      />
      <SummaryCard
        label="Remaining"
        :value="financeStore.budgetSummary?.totalRemaining || 0"
        type="currency"
        :status="(financeStore.budgetSummary?.totalRemaining || 0) < 0 ? 'negative' : 'positive'"
      />
    </div>

    <!-- Alert Cards -->
    <Alert
      v-if="(financeStore.budgetSummary?.overBudget || 0) > 0"
      type="danger"
      :message="`⚠️ ${financeStore.budgetSummary.overBudget} budget(s) exceeded this month`"
    />
    
    <Alert
      v-if="(financeStore.budgetSummary?.warningBudgets || 0) > 0"
      type="warning"
      :message="`🟡 ${financeStore.budgetSummary.warningBudgets} budget(s) at 80%+ spending`"
    />

    <!-- Budget List -->
    <div class="budget-list" v-if="(financeStore.currentMonthBudgets || []).length > 0">
      <h3>{{ getCurrentMonth() }} Budgets</h3>
      <div class="budget-items">
        <div
          v-for="budget in financeStore.currentMonthBudgets || []"
          :key="budget.id"
          class="budget-item"
          :class="budget.status"
        >
          <div class="budget-info">
            <div class="budget-header-row">
              <span class="budget-category">{{ budget.category }}</span>
              <span class="budget-amount">Ksh{{ (budget.amount || 0).toFixed(2) }}</span>
            </div>

            <div class="budget-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :class="budget.status"
                  :style="{ width: `${Math.min(budget.percentage || 0, 100)}%` }"
                ></div>
              </div>
              <span class="progress-text"
                >{{ (budget.percentage || 0).toFixed(1) }}%</span
              >
            </div>

            <div class="budget-details">
              <span class="spent">Spent: Ksh{{ (budget.spent || 0).toFixed(2) }}</span>
              <span class="remaining" :class="{ negative: (budget.remaining || 0) < 0 }">
                {{ (budget.remaining || 0) >= 0 ? "Remaining" : "Over" }}: Ksh{{
                  Math.abs(budget.remaining || 0).toFixed(2)
                }}
              </span>
            </div>
          </div>

          <div class="budget-actions">
            <button @click="editBudget(budget)" class="btn-edit">Edit</button>
            <button @click="deleteBudget(budget.id)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Spending Analysis -->
    <div
      class="spending-analysis"
      v-if="(financeStore.categorySpending || []).length > 0"
    >
      <h3>Category Spending This Month</h3>
      <div class="spending-list">
        <div
          v-for="item in (financeStore.categorySpending || []).slice(0, 5)"
          :key="item.category"
          class="spending-item"
        >
          <span class="category-name">{{ item.category }}</span>
          <span class="category-amount">Ksh{{ (item.amount || 0).toFixed(2) }}</span>
          <div class="category-bar">
            <div
              class="category-fill"
              :style="{
                width: `${
                  financeStore.categorySpending?.[0]?.amount
                    ? ((item.amount || 0) / financeStore.categorySpending[0].amount) * 100
                    : 0
                }%`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Budgets State -->
    <div v-if="(financeStore.currentMonthBudgets || []).length === 0" class="no-budgets">
      <div class="no-budgets-content">
        <h3>📊 Start Budgeting Today!</h3>
        <p>Create your first budget to track spending and reach your financial goals.</p>
        <button @click="showBudgetModal = true" class="btn-primary">
          Create Your First Budget
        </button>
      </div>
    </div>

    <!-- Add/Edit Budget Modal -->
    <Modal
      :show="showBudgetModal || !!editingBudget"
      :title="editingBudget ? 'Edit Budget' : 'Add New Budget'"
      size="medium"
      @close="closeModal"
    >
      <form @submit.prevent="saveBudget">
        <div class="form-group">
          <label>Category</label>
          <select v-model="budgetForm.category" required>
            <option value="">Select category</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Utilities">Utilities</option>
            <option value="Housing">Housing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Monthly Budget Amount</label>
          <input
            v-model.number="budgetForm.amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
          />
        </div>

        <div class="form-group">
          <label>Description (Optional)</label>
          <textarea
            v-model="budgetForm.description"
            placeholder="Budget notes or goals"
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-save">
            {{ editingBudget ? "Update Budget" : "Add Budget" }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { getCurrentMonth } from "@/utils/dateUtils";
import SummaryCard from "@/components/shared/SummaryCard.vue";
import Alert from "@/components/shared/Alert.vue";
import Modal from "@/components/shared/Modal.vue";
import CardHeader from "@/components/shared/CardHeader.vue";

const financeStore = useFinanceStore();

const showBudgetModal = ref(false);
const editingBudget = ref(null);

const budgetForm = reactive({
  category: "",
  amount: "",
  description: "",
});

// Debug computed property
const debugInfo = computed(() => {
  console.log("=== BUDGET MANAGER DEBUG ===");
  console.log("Current budgets:", financeStore.currentMonthBudgets);
  console.log("Budget summary:", financeStore.budgetSummary);
  console.log("All transactions:", financeStore.transactions);
  console.log("Raw budgets:", financeStore.budgets);

  return {
    budgets: financeStore.currentMonthBudgets,
    summary: financeStore.budgetSummary,
    transactions: financeStore.transactions,
  };
});

// Watch for changes
watch(
  () => financeStore.transactions,
  () => {
    console.log("Transactions changed, triggering budget recalculation");
  },
  { deep: true }
);

watch(
  () => financeStore.budgets,
  () => {
    console.log("Budgets changed");
  },
  { deep: true }
);

onMounted(() => {
  console.log("BudgetManager mounted");
  console.log("Debug info:", debugInfo.value);
});

// Add a test method to create sample data
const createTestData = () => {
  // Add a test budget
  financeStore.addBudget({
    category: "Food & Dining",
    amount: 1000,
    description: "Monthly food budget",
  });

  // Add a test transaction
  financeStore.addTransaction({
    description: "Lunch at restaurant",
    amount: 150,
    type: "expense",
    category: "Food & Dining",
  });

  console.log("Test data created");
};

// Rest of your existing methods...
const resetForm = () => {
  budgetForm.category = "";
  budgetForm.amount = "";
  budgetForm.description = "";
};

const closeModal = () => {
  showBudgetModal.value = false;
  editingBudget.value = null;
  resetForm();
};

const editBudget = (budget) => {
  editingBudget.value = budget;
  budgetForm.category = budget.category;
  budgetForm.amount = budget.amount;
  budgetForm.description = budget.description || "";
};

const saveBudget = () => {
  try {
    if (editingBudget.value) {
      financeStore.updateBudget(editingBudget.value.id, { ...budgetForm });
    } else {
      financeStore.addBudget({ ...budgetForm });
    }
    closeModal();
  } catch (error) {
    console.error("Error saving budget:", error);
    alert("Error saving budget. Please try again.");
  }
};

const deleteBudget = (budgetId) => {
  if (confirm("Are you sure you want to delete this budget?")) {
    try {
      financeStore.deleteBudget(budgetId);
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Error deleting budget. Please try again.");
    }
  }
};

// Expose createTestData for debugging (you can remove this in production)
window.createTestData = createTestData;
</script>

<style scoped>
.budget-manager {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.budget-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-primary {
  background: #4a8fff;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #3b7ce6;
}

.budget-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  border-left: 4px solid #4a8fff;
}

.summary-card.negative {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.summary-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.summary-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.summary-value.spent {
  color: #f59e0b;
}

.no-budgets {
  text-align: center;
  padding: 3rem 1rem;
}

.no-budgets-content h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.no-budgets-content p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a8fff;
  box-shadow: 0 0 0 3px rgba(74, 143, 255, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-save {
  background: #4a8fff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.alert-section {
  margin-bottom: 1.5rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.alert-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fef08a;
}

.budget-list {
  margin-bottom: 2rem;
}

.budget-items {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.budget-item {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 4px solid transparent;
  transition: border-color 0.3s ease;
}

.budget-item:hover {
  border-left-color: #4a8fff;
}

.budget-info {
  flex-grow: 1;
}

.budget-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.budget-category {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.budget-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #4a8fff;
}

.budget-progress {
  margin: 1rem 0;
}

.progress-bar {
  background: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 0.5rem;
}

.progress-fill {
  background: #4a8fff;
  height: 100%;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.budget-details {
  font-size: 0.875rem;
  color: #374151;
}

.spent {
  display: block;
  margin-bottom: 0.5rem;
}

.remaining {
  display: block;
}

.remaining.negative {
  color: #dc2626;
}

.budget-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-edit {
  background: #4a8fff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-delete {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.spending-analysis {
  margin-top: 2rem;
}

.spending-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.spending-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-name {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.category-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #4a8fff;
  margin-bottom: 0.5rem;
}

.category-bar {
  background: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 0.5rem;
}

.category-fill {
  background: #4a8fff;
  height: 100%;
}
</style>
