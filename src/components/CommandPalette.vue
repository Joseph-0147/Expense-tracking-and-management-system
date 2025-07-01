<template>
  <teleport to="body">
    <div v-if="isOpen" class="command-palette-overlay" @click="close">
      <div class="command-palette" @click.stop>
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input
            ref="searchInput"
            v-model="searchQuery"
            @keydown="handleKeydown"
            placeholder="Search sections, add transaction, generate report..."
            class="search-input"
          />
          <kbd class="escape-hint">ESC</kbd>
        </div>

        <div class="results-container">
          <div v-if="filteredCommands.length === 0" class="no-results">
            No results found
          </div>

          <div v-else class="results-list">
            <div
              v-for="(command, index) in filteredCommands"
              :key="command.id"
              :class="{ selected: selectedIndex === index }"
              @click="executeCommand(command)"
              @mouseenter="selectedIndex = index"
              class="result-item"
            >
              <div class="result-icon">
                <i :class="command.icon"></i>
              </div>
              <div class="result-content">
                <div class="result-title">{{ command.title }}</div>
                <div class="result-description">{{ command.description }}</div>
              </div>
              <div class="result-shortcut" v-if="command.shortcut">
                <kbd>{{ command.shortcut }}</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close", "execute-command"]);

const searchQuery = ref("");
const selectedIndex = ref(0);
const searchInput = ref(null);

const commands = ref([
  // Navigation commands
  {
    id: "nav-overview",
    title: "Go to Overview",
    description: "Navigate to dashboard overview",
    icon: "fas fa-home",
    type: "navigation",
    target: "overview",
  },
  {
    id: "nav-balance",
    title: "Go to Balance",
    description: "View your current balance",
    icon: "fas fa-wallet",
    type: "navigation",
    target: "balance",
    shortcut: "Alt+1",
  },
  {
    id: "nav-transactions",
    title: "Go to Transactions",
    description: "View and manage transactions",
    icon: "fas fa-exchange-alt",
    type: "navigation",
    target: "transactions",
    shortcut: "Alt+2",
  },
  {
    id: "nav-budget",
    title: "Go to Budget",
    description: "Manage your budgets",
    icon: "fas fa-chart-pie",
    type: "navigation",
    target: "budget",
    shortcut: "Alt+3",
  },
  {
    id: "nav-bills",
    title: "Go to Bills",
    description: "Track upcoming bills",
    icon: "fas fa-file-invoice",
    type: "navigation",
    target: "bills",
  },
  {
    id: "nav-savings",
    title: "Go to Savings",
    description: "Manage your savings goals",
    icon: "fas fa-piggy-bank",
    type: "navigation",
    target: "savings",
  },
  {
    id: "nav-tuition",
    title: "Go to Tuition",
    description: "Track tuition payments",
    icon: "fas fa-graduation-cap",
    type: "navigation",
    target: "tuition",
  },
  {
    id: "nav-loans",
    title: "Go to Loans",
    description: "Manage student loans",
    icon: "fas fa-hand-holding-usd",
    type: "navigation",
    target: "loans",
  },
  {
    id: "nav-reports",
    title: "Go to Reports",
    description: "Generate financial reports",
    icon: "fas fa-chart-bar",
    type: "navigation",
    target: "reports",
  },

  // Action commands
  {
    id: "add-transaction",
    title: "Add Transaction",
    description: "Record a new income or expense",
    icon: "fas fa-plus-circle",
    type: "action",
    shortcut: "Alt+T",
  },
  {
    id: "add-bill",
    title: "Add Bill",
    description: "Add a new bill to track",
    icon: "fas fa-file-plus",
    type: "action",
  },
  {
    id: "add-budget",
    title: "Create Budget",
    description: "Set up a new budget category",
    icon: "fas fa-chart-pie",
    type: "action",
  },
  {
    id: "generate-report",
    title: "Generate Report",
    description: "Create a financial report",
    icon: "fas fa-file-alt",
    type: "action",
    shortcut: "Alt+R",
  },
  {
    id: "add-savings-goal",
    title: "Add Savings Goal",
    description: "Set a new savings target",
    icon: "fas fa-target",
    type: "action",
  },

  // Quick info commands
  {
    id: "show-balance",
    title: "Show Current Balance",
    description: "Display your current account balance",
    icon: "fas fa-eye",
    type: "info",
  },
  {
    id: "show-monthly-summary",
    title: "Monthly Summary",
    description: "View this month's financial summary",
    icon: "fas fa-calendar",
    type: "info",
  },
]);

const filteredCommands = computed(() => {
  if (!searchQuery.value) return commands.value.slice(0, 8);

  const query = searchQuery.value.toLowerCase();
  return commands.value
    .filter(
      (command) =>
        command.title.toLowerCase().includes(query) ||
        command.description.toLowerCase().includes(query)
    )
    .slice(0, 8);
});

const executeCommand = (command) => {
  emit("execute-command", command);
  close();
};

const handleKeydown = (event) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        filteredCommands.value.length - 1
      );
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      break;
    case "Enter":
      event.preventDefault();
      if (filteredCommands.value[selectedIndex.value]) {
        executeCommand(filteredCommands.value[selectedIndex.value]);
      }
      break;
    case "Escape":
      close();
      break;
  }
};

const close = () => {
  emit("close");
  searchQuery.value = "";
  selectedIndex.value = 0;
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  }
);

watch(filteredCommands, () => {
  selectedIndex.value = 0;
});
</script>

<style scoped>
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.command-palette {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.search-container {
  position: relative;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.search-icon {
  position: absolute;
  left: var(--space-6);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-12) var(--space-3) var(--space-12);
  border: none;
  outline: none;
  font-size: var(--font-size-lg);
  background: transparent;
}

.escape-hint {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.results-container {
  max-height: 400px;
  overflow-y: auto;
}

.no-results {
  padding: var(--space-8);
  text-align: center;
  color: var(--text-muted);
}

.result-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: var(--transition-base);
}

.result-item:hover,
.result-item.selected {
  background: var(--bg-secondary);
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-3);
  color: var(--primary-500);
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.result-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.result-shortcut {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

kbd {
  background: var(--bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: monospace;
  border: 1px solid var(--border-color);
}
</style>
