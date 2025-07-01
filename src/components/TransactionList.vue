<template>
  <div class="card transaction-list">
    <div
      class="card-header sticky top-0 bg-white pb-4 border-b-2 border-gray-200 mb-6 z-10"
    >
      <h3 class="card-title mb-4">📊 Transaction History</h3>

      <!-- Filter Controls -->
      <div class="filter-controls">
        <!-- Search Input -->
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search transactions..."
            class="form-input search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="{ active: activeFilter === filter.value }"
            class="filter-tab"
          >
            {{ filter.label }}
            <span v-if="filter.count !== undefined" class="count-badge">
              {{ filter.count }}
            </span>
          </button>
        </div>

        <!-- Additional Filters -->
        <div class="additional-filters">
          <select v-model="categoryFilter" class="form-select filter-select">
            <option value="">All Categories</option>
            <option
              v-for="category in availableCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>

          <select v-model="dateFilter" class="form-select filter-select">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <button @click="clearFilters" class="btn btn-ghost btn-sm">
            <i class="fas fa-times"></i> Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction Count -->
    <div class="transaction-summary">
      <p class="text-sm text-muted mb-4">
        Showing {{ filteredTransactions.length }} of
        {{ transactions.length }} transactions
        <span v-if="totalValue !== 0" class="ml-2">
          • Total:
          <span
            :class="totalValue >= 0 ? 'text-green-600' : 'text-red-600'"
            class="font-semibold"
          >
            {{ totalValue >= 0 ? "+" : "" }}Ksh{{ Math.abs(totalValue).toFixed(2) }}
          </span>
        </span>
      </p>
    </div>

    <!-- No Transactions State -->
    <div v-if="!transactions.length" class="text-center py-12">
      <div class="text-6xl mb-4">💳</div>
      <p class="text-muted text-lg">No transactions yet</p>
      <p class="text-sm text-muted">Add your first transaction to get started</p>
    </div>

    <!-- No Filtered Results -->
    <div v-else-if="!filteredTransactions.length" class="text-center py-12">
      <div class="text-4xl mb-4">🔍</div>
      <p class="text-muted text-lg">No transactions match your filters</p>
      <button @click="clearFilters" class="btn btn-secondary mt-4">Clear Filters</button>
    </div>

    <!-- Transaction List -->
    <div v-else class="transaction-container">
      <div
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        class="transaction-item bg-gray border border-gray-200 rounded-lg p-4 hover:shadow-md transition-base"
        :class="[transaction.type]"
      >
        <div class="flex justify-between items-center">
          <div class="transaction-info flex-1">
            <div class="font-semibold text-primary">{{ transaction.description }}</div>
            <div class="transaction-meta">
              <span
                class="transaction-type text-xs font-medium uppercase"
                :class="transaction.type"
              >
                {{ transaction.type }}
              </span>
              <span class="text-xs text-muted">•</span>
              <span class="text-xs text-muted">{{ transaction.category }}</span>
            </div>
            <div class="text-xs text-muted mt-1">
              <i class="fas fa-calendar-alt mr-1"></i>
              {{ formatDate(transaction.date) }}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="transaction-amount font-bold text-lg" :class="transaction.type">
              {{ transaction.type === "income" ? "+" : "-" }}Ksh{{
                transaction.amount.toFixed(2)
              }}
            </div>

            <div class="transaction-actions">
              <button
                @click="editTransaction(transaction)"
                class="btn btn-ghost btn-sm text-blue-500 hover:bg-blue-50"
                title="Edit transaction"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="confirmDelete(transaction)"
                class="btn btn-ghost btn-sm text-danger-500 hover:bg-red-50"
                title="Delete transaction"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions (when multiple transactions selected) -->
    <div v-if="selectedTransactions.length > 0" class="bulk-actions">
      <div
        class="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <span class="text-sm font-medium">
          {{ selectedTransactions.length }} transaction(s) selected
        </span>
        <div class="flex gap-2">
          <button @click="bulkDelete" class="btn btn-danger btn-sm">
            <i class="fas fa-trash"></i> Delete Selected
          </button>
          <button @click="clearSelection" class="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Confirm Delete</h3>
          <button @click="closeDeleteModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="text-center py-4">
            <div class="text-4xl mb-4">⚠️</div>
            <p class="text-lg font-semibold mb-2">Delete Transaction?</p>
            <p class="text-muted mb-4">
              Are you sure you want to delete
              <strong>"{{ transactionToDelete?.description }}"</strong>?
            </p>
            <p class="text-sm text-muted">This action cannot be undone.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-ghost flex-1">Cancel</button>
          <button @click="deleteTransaction" class="btn btn-danger flex-1">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["delete-transaction", "edit-transaction"]);

// Filter states
const searchQuery = ref("");
const activeFilter = ref("all");
const categoryFilter = ref("");
const dateFilter = ref("");

// Selection and deletion states
const selectedTransactions = ref([]);
const showDeleteModal = ref(false);
const transactionToDelete = ref(null);

// Computed properties
const availableCategories = computed(() => {
  const categories = new Set(props.transactions.map((t) => t.category));
  return Array.from(categories).sort();
});

const filterOptions = computed(() => {
  const incomeCount = props.transactions.filter((t) => t.type === "income").length;
  const expenseCount = props.transactions.filter((t) => t.type === "expense").length;

  return [
    { label: "All", value: "all", count: props.transactions.length },
    { label: "Income", value: "income", count: incomeCount },
    { label: "Expenses", value: "expense", count: expenseCount },
  ];
});

const filteredTransactions = computed(() => {
  let result = props.transactions;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (activeFilter.value !== "all") {
    result = result.filter((t) => t.type === activeFilter.value);
  }

  // Category filter
  if (categoryFilter.value) {
    result = result.filter((t) => t.category === categoryFilter.value);
  }

  // Date filter
  if (dateFilter.value) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    result = result.filter((t) => {
      const transactionDate = new Date(t.date);

      switch (dateFilter.value) {
        case "today":
          return transactionDate >= today;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return transactionDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return transactionDate >= monthAgo;
        case "year":
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return transactionDate >= yearAgo;
        default:
          return true;
      }
    });
  }

  // Sort by date (newest first)
  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalValue = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => {
    return sum + (t.type === "income" ? t.amount : -t.amount);
  }, 0);
});

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const clearFilters = () => {
  searchQuery.value = "";
  activeFilter.value = "all";
  categoryFilter.value = "";
  dateFilter.value = "";
};

const confirmDelete = (transaction) => {
  transactionToDelete.value = transaction;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  transactionToDelete.value = null;
};

const deleteTransaction = () => {
  if (transactionToDelete.value) {
    emit("delete-transaction", transactionToDelete.value.id);
    closeDeleteModal();
  }
};

const editTransaction = (transaction) => {
  emit("edit-transaction", transaction);
};

const bulkDelete = () => {
  if (
    confirm(
      `Are you sure you want to delete ${selectedTransactions.value.length} transaction(s)?`
    )
  ) {
    selectedTransactions.value.forEach((id) => {
      emit("delete-transaction", id);
    });
    clearSelection();
  }
};

const clearSelection = () => {
  selectedTransactions.value = [];
};

// Watch for changes and update filter counts
watch(
  () => props.transactions,
  () => {
    // Clear invalid filters when transactions change
    if (
      categoryFilter.value &&
      !availableCategories.value.includes(categoryFilter.value)
    ) {
      categoryFilter.value = "";
    }
  },
  { deep: true }
);
</script>

<style scoped>
.transaction-list {
  height: 600px; /* Increased height for filters */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  flex-shrink: 0;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-wrapper {
  position: relative;
  max-width: 300px;
}

.search-input {
  padding-left: 2.5rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.filter-tabs {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.filter-tab {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.filter-tab:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.filter-tab.active {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.count-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
}

.filter-tab.active .count-badge {
  background: rgba(255, 255, 255, 0.3);
}

.additional-filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  min-width: 120px;
}

.transaction-summary {
  flex-shrink: 0;
  padding: var(--space-2) 0;
}

.transaction-container {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--space-2);
  margin-right: calc(-1 * var(--space-2));
}

.transaction-container::-webkit-scrollbar {
  width: 6px;
}

.transaction-container::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.transaction-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
}

.transaction-container::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.transaction-item {
  position: relative;
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.transaction-item:last-child {
  margin-bottom: 0;
}

.transaction-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: var(--radius-sm);
}

.transaction-item.income::before {
  background: var(--secondary-500);
}

.transaction-item.expense::before {
  background: var(--danger-500);
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.transaction-type.income {
  color: var(--secondary-600);
}

.transaction-type.expense {
  color: var(--danger-600);
}

.transaction-amount.income {
  color: var(--secondary-600);
}

.transaction-amount.expense {
  color: var(--danger-600);
}

.transaction-actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: var(--transition-base);
}

.transaction-item:hover .transaction-actions {
  opacity: 1;
}

.bulk-actions {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid var(--border-color);
  padding: var(--space-4);
  margin: -var(--space-4) -var(--space-6) -var(--space-6);
}

.text-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* Responsive */
@media (max-width: 768px) {
  .transaction-list {
    height: 500px;
  }

  .filter-controls {
    gap: var(--space-3);
  }

  .additional-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: auto;
  }

  .transaction-item .flex {
    flex-direction: column;
    gap: var(--space-2);
  }

  .transaction-actions {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .transaction-list {
    height: 450px;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .filter-tab {
    text-align: center;
  }
}
</style>
