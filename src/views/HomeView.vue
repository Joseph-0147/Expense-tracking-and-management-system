<template>
  <div class="dashboard">
    <!-- Sticky Navigation -->
    <nav class="dashboard-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h2>{{ authStore.user?.name }}'s Dashboard</h2>
        </div>

        <div class="nav-links">
          <button
            v-for="section in dashboardSections"
            :key="section.id"
            @click="scrollToSection(section.id)"
            :class="{ active: activeSection === section.id }"
            class="nav-link"
          >
            <i :class="section.icon"></i>
            <span class="nav-text">{{ section.name }}</span>
          </button>
        </div>

        <div class="nav-actions">
          <!-- Quick Actions Menu Toggle -->
          <button @click="showQuickActions = !showQuickActions" class="quick-actions-btn">
            <i class="fas fa-bolt"></i>
            <span class="sr-only">Quick Actions</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Dashboard Header -->
    <div class="dashboard-header" id="overview">
      <h1>Welcome back, {{ authStore.user?.name }}! 👋</h1>
      <p>Here's your financial overview for today</p>
    </div>

    <!-- Dashboard Content Grid -->
    <div class="dashboard-content">
      <!-- Balance Display -->
      <div class="lg:col-span-2" id="balance">
        <BalanceDisplay :balance="financeStore.balance" />
      </div>

      <!-- Other sections with IDs for scrolling -->
      <div class="lg:col-span-2" id="savings">
        <SavingsDisplay />
      </div>

      <div class="lg:col-span-3" id="transactions">
        <TransactionForm @add-transaction="handleAddTransaction" />
      </div>

      <div class="lg:col-span-3" id="transaction-list">
        <TransactionList
          :transactions="financeStore.transactions"
          @delete-transaction="handleDeleteTransaction"
        />
      </div>

      <div class="lg:col-span-6" id="budget">
        <BudgetManager />
      </div>

      <div class="lg:col-span-6" id="bills">
        <BillManager />
      </div>

      <div class="lg:col-span-3" id="tuition">
        <TuitionManager />
      </div>

      <div class="lg:col-span-3" id="scholarships">
        <ScholarshipManager />
      </div>

      <div class="lg:col-span-6" id="loans">
        <LoanManager />
      </div>

      <div class="lg:col-span-6" id="reports">
        <ReportGenerator />
      </div>
    </div>

    <!-- Enhanced Quick Actions Floating Menu -->
    <div class="quick-actions-menu" :class="{ active: showQuickActions }">
      <div class="quick-actions-content">
        <div class="quick-actions-header">
          <h3>Quick Actions</h3>
          <button @click="closeQuickActions" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="quick-actions-grid">
          <!-- Navigation Actions -->
          <div class="action-group">
            <h4>Navigate To</h4>
            <button
              v-for="section in dashboardSections.slice(0, 4)"
              :key="section.id"
              @click="scrollToSection(section.id)"
              class="action-btn"
            >
              <i :class="section.icon"></i>
              {{ section.name }}
            </button>
          </div>

          <!-- Quick Tasks -->
          <div class="action-group">
            <h4>Quick Tasks</h4>
            <button @click="openTransactionModal" class="action-btn">
              <i class="fas fa-plus-circle text-blue-500"></i>
              Add Transaction
            </button>
            <button @click="openBillModal" class="action-btn">
              <i class="fas fa-file-invoice text-green-500"></i>
              Add Bill
            </button>
            <button @click="openSavingsModal" class="action-btn">
              <i class="fas fa-piggy-bank text-purple-500"></i>
              Add to Savings
            </button>
            <button @click="generateQuickReport" class="action-btn">
              <i class="fas fa-chart-bar text-orange-500"></i>
              Quick Report
            </button>
          </div>

          <!-- Profile Actions -->
          <div class="action-group">
            <h4>Profile</h4>
            <button @click="navigateToProfile" class="action-btn">
              <i class="fas fa-user text-indigo-500"></i>
              View Profile
            </button>
            <button @click="toggleDarkMode" class="action-btn">
              <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
              {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
            </button>
            <button @click="logout" class="action-btn logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Table of Contents -->
    <TableOfContents
      :sections="dashboardSections"
      :active-section="activeSection"
      @scroll-to="scrollToSection"
    />

    <!-- Add Command Palette -->
    <CommandPalette
      :is-open="showCommandPalette"
      @close="showCommandPalette = false"
      @execute-command="executeCommand"
    />

    <!-- Add search trigger button -->
    <div class="search-trigger">
      <button @click="showCommandPalette = true" class="search-btn">
        <i class="fas fa-search"></i>
        <span>Search or jump to...</span>
        <kbd>Ctrl+K</kbd>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFinanceStore } from "@/stores/finance";
import BalanceDisplay from "@/components/BalanceDisplay.vue";
import SavingsDisplay from "@/components/SavingsDisplay.vue";
import BudgetManager from "@/components/BudgetManager.vue";
import BillManager from "@/components/BillManager.vue";
import TuitionManager from "@/components/TuitionManager.vue";
import ScholarshipManager from "@/components/ScholarshipManager.vue";
import LoanManager from "@/components/LoanManager.vue";
import TransactionForm from "@/components/TransactionForm.vue";
import TransactionList from "@/components/TransactionList.vue";
import ReportGenerator from "@/components/ReportGenerator.vue";
import TableOfContents from "@/components/TableOfContents.vue";
import CommandPalette from "@/components/CommandPalette.vue";

const router = useRouter();
const authStore = useAuthStore();
const financeStore = useFinanceStore();

// Remove profile dropdown state - no longer needed
const showQuickActions = ref(false);
const activeSection = ref("overview");
const showShortcuts = ref(false);
const showCommandPalette = ref(false);
const isDarkMode = ref(false);

// Navigation data
const dashboardSections = ref([
  { id: "overview", name: "Overview", icon: "fas fa-home" },
  { id: "balance", name: "Balance", icon: "fas fa-wallet" },
  { id: "transactions", name: "Transactions", icon: "fas fa-exchange-alt" },
  { id: "budget", name: "Budget", icon: "fas fa-chart-pie" },
  { id: "bills", name: "Bills", icon: "fas fa-file-invoice" },
  { id: "savings", name: "Savings", icon: "fas fa-piggy-bank" },
  { id: "tuition", name: "Tuition", icon: "fas fa-graduation-cap" },
  { id: "loans", name: "Loans", icon: "fas fa-hand-holding-usd" },
  { id: "reports", name: "Reports", icon: "fas fa-chart-bar" },
]);

// Simplified methods
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const navigateToProfile = () => {
  router.push("/profile");
  closeQuickActions();
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark-mode", isDarkMode.value);
  closeQuickActions();
};

const logout = () => {
  if (confirm("Are you sure you want to sign out?")) {
    authStore.logout();
    router.push("/login");
  }
  closeQuickActions();
};

// Navigation methods
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
    activeSection.value = sectionId;
    closeQuickActions();
  }
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.altKey) {
    switch (event.key) {
      case "1":
        event.preventDefault();
        scrollToSection("balance");
        break;
      case "2":
        event.preventDefault();
        scrollToSection("transactions");
        break;
      case "3":
        event.preventDefault();
        scrollToSection("budget");
        break;
      case "t":
        event.preventDefault();
        openTransactionModal();
        break;
      case "r":
        event.preventDefault();
        scrollToSection("reports");
        break;
    }
  } else if (event.key === "?") {
    event.preventDefault();
    showShortcuts.value = !showShortcuts.value;
  }
};

// Intersection Observer for active section tracking
const observeSections = () => {
  const sections = dashboardSections.value.map((s) => s.id);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: "-100px 0px -50% 0px",
    }
  );

  sections.forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) observer.observe(element);
  });

  return observer;
};

// Quick action methods
const openTransactionModal = () => {
  // Implement transaction modal
  closeQuickActions();
};

const openBillModal = () => {
  // Implement bill modal
  closeQuickActions();
};

const openSavingsModal = () => {
  // Implement savings modal
  closeQuickActions();
};

const generateQuickReport = () => {
  scrollToSection("reports");
};

// Click outside to close quick actions
const handleClickOutside = (event) => {
  if (
    showQuickActions.value &&
    !event.target.closest(".quick-actions-menu") &&
    !event.target.closest(".quick-actions-btn")
  ) {
    showQuickActions.value = false;
  }
};

// Handle command palette shortcuts
const handleGlobalKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    showCommandPalette.value = !showCommandPalette.value;
  }
  // Escape key closes all modals
  if (event.key === "Escape") {
    showProfileMenu.value = false;
    showProfileSettings.value = false;
    showCommandPalette.value = false;
    showQuickActions.value = false;
  }
};

const executeCommand = (command) => {
  switch (command.type) {
    case "navigation":
      scrollToSection(command.target);
      break;
    case "action":
      handleQuickAction(command.id);
      break;
    case "info":
      showQuickInfo(command.id);
      break;
  }
};

const handleQuickAction = (actionId) => {
  switch (actionId) {
    case "add-transaction":
      openTransactionModal();
      break;
    case "add-bill":
      openBillModal();
      break;
    case "generate-report":
      scrollToSection("reports");
      break;
  }
};

// Load data from local storage when the component mounts
onMounted(() => {
  financeStore.loadFromLocalStorage();
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keydown", handleGlobalKeydown);
  nextTick(() => {
    observeSections();
  });
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keydown", handleGlobalKeydown);
});

// Watch for changes and save to local storage
const watchOptions = { deep: true };

watch(
  () => financeStore.balance,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.transactions,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.savings,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.bills,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.budgets,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.tuitionFees,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.scholarships,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);

watch(
  () => financeStore.loans,
  () => financeStore.saveToLocalStorage(),
  watchOptions
);
</script>

<style scoped>
/* Dashboard Layout */
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8);
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  margin-bottom: var(--space-12);
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--border-color);
}

.dashboard-header h1 {
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-2);
}

.dashboard-header p {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

/* Column span utilities for different screen sizes */
.lg\:col-span-2 {
  grid-column: span 2;
}

.lg\:col-span-3 {
  grid-column: span 3;
}

.lg\:col-span-6 {
  grid-column: span 6;
}

/* Insight cards */
.insight-card {
  background: var(--bg-tertiary);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  transition: var(--transition-base);
}

.insight-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.insight-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-4);
}

/* Sticky Navigation */
.dashboard-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-6);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-brand h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.nav-links {
  display: flex;
  gap: var(--space-2);
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  white-space: nowrap;
}

.nav-link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-link.active {
  background: var(--primary-500);
  color: white;
}

.nav-text {
  display: none;
}

.quick-actions-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
}

.quick-actions-btn:hover {
  background: var(--primary-600);
}

/* Enhanced Quick Actions Menu */
.quick-actions-menu {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  transition: right 0.3s ease;
}

.quick-actions-menu.active {
  right: 0;
}

.quick-actions-content {
  padding: var(--space-6);
  height: 100%;
  overflow-y: auto;
}

.quick-actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  color: var(--text-secondary);
}

.quick-actions-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.action-group h4 {
  margin-bottom: var(--space-3);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  margin-bottom: var(--space-2);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-500);
}

/* Keyboard Shortcuts Modal */
.shortcuts-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.shortcuts-content {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 90%;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: var(--space-6) 0;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
}

kbd {
  background: var(--bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: var(--font-size-sm);
  border: 1px solid var(--border-color);
}

/* Profile Dropdown Styles */
.profile-dropdown {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
  max-width: 280px;
}

.profile-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-500);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
}

.profile-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.profile-email {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.profile-arrow {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  flex-shrink: 0;
}

.quick-actions-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  border: none;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions-btn:hover {
  background: var(--primary-600);
  transform: scale(1.05);
}

.logout-btn {
  color: var(--danger-600);
}

.logout-btn:hover {
  background: var(--danger-50);
  color: var(--danger-700);
}

/* Profile Settings Modal */
.profile-settings-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: var(--space-6);
}

.form-section h4 {
  margin-bottom: var(--space-4);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-2);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}

/* Responsive Design */
@media (max-width: 767px) {
  .profile-btn {
    max-width: 200px;
  }

  .profile-info {
    display: none;
  }

  .profile-menu {
    right: 0;
    left: 0;
    min-width: auto;
  }

  .profile-settings-modal {
    margin: var(--space-4);
    max-width: none;
  }
}

@media (max-width: 480px) {
  .profile-menu-header {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }
}
</style>
