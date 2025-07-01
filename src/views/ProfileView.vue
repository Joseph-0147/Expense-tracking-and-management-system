// ===== 4. PROFILE VIEW (src/views/ProfileView.vue) =====
<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
  />
  <div class="profile-container">
    <!-- Navigation Header -->
    <nav class="profile-nav">
      <div class="nav-content">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>

        <!-- Profile Actions Dropdown -->
        <div class="profile-actions-dropdown" ref="profileActionsDropdown">
          <button @click="toggleActionsMenu" class="actions-btn">
            <i class="fas fa-ellipsis-v"></i>
            Actions
          </button>

          <!-- Actions Dropdown Menu -->
          <div v-if="showActionsMenu" class="actions-menu">
            <div class="actions-menu-section">
              <h5>Account</h5>
              <button @click="exportData" class="menu-item">
                <i class="fas fa-download"></i>
                Export Data
              </button>
              <button @click="openNotificationSettings" class="menu-item">
                <i class="fas fa-bell"></i>
                Notifications
                <span v-if="unreadNotifications > 0" class="notification-badge">
                  {{ unreadNotifications }}
                </span>
              </button>
            </div>

            <div class="actions-menu-divider"></div>

            <div class="actions-menu-section">
              <h5>Finance</h5>
              <button @click="viewFinancialSummary" class="menu-item">
                <i class="fas fa-chart-line"></i>
                Financial Summary
              </button>
              <button @click="openBudgetGoals" class="menu-item">
                <i class="fas fa-target"></i>
                Budget Goals
              </button>
            </div>

            <div class="actions-menu-divider"></div>

            <div class="actions-menu-section">
              <h5>Support</h5>
              <button @click="openHelp" class="menu-item">
                <i class="fas fa-question-circle"></i>
                Help & Support
              </button>
              <button @click="openFeedback" class="menu-item">
                <i class="fas fa-comment"></i>
                Send Feedback
              </button>
              <button @click="showKeyboardShortcuts" class="menu-item">
                <i class="fas fa-keyboard"></i>
                Keyboard Shortcuts
              </button>
            </div>

            <div class="actions-menu-divider"></div>

            <div class="actions-menu-section">
              <button @click="toggleDarkMode" class="menu-item">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
              </button>
              <button @click="logout" class="menu-item logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-banner">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <img
              v-if="authStore.user?.avatar"
              :src="authStore.user.avatar"
              :alt="authStore.user.name"
              class="avatar-img"
            />
            <span v-else>{{ authStore.userInitials }}</span>
          </div>
          <button class="avatar-edit" @click="editAvatar">
            <i class="fas fa-camera"></i>
          </button>
        </div>
        <div class="profile-info">
          <h1>{{ authStore.user?.name }}</h1>
          <p class="student-id">{{ authStore.user?.studentId }}</p>
          <p class="university">{{ authStore.user?.university }}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ formattedBalance }}</span>
              <span class="stat-label">Current Balance</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ transactionCount }}</span>
              <span class="stat-label">Transactions</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ savingsGoals }}</span>
              <span class="stat-label">Savings Goals</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="profile-content">
      <div class="profile-tabs">
        <button
          @click="activeTab = 'profile'"
          :class="{ active: activeTab === 'profile' }"
          class="tab-btn"
        >
          <i class="fas fa-user"></i>
          Profile Information
        </button>
        <button
          @click="activeTab = 'security'"
          :class="{ active: activeTab === 'security' }"
          class="tab-btn"
        >
          <i class="fas fa-shield-alt"></i>
          Security
        </button>
        <button
          @click="activeTab = 'preferences'"
          :class="{ active: activeTab === 'preferences' }"
          class="tab-btn"
        >
          <i class="fas fa-cog"></i>
          Preferences
        </button>
        <button
          @click="activeTab = 'financial'"
          :class="{ active: activeTab === 'financial' }"
          class="tab-btn"
        >
          <i class="fas fa-chart-line"></i>
          Financial Settings
        </button>
      </div>

      <div class="tab-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="profile-form">
          <h2>Personal Information</h2>
          <form @submit.prevent="updateProfile">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  v-model="profileForm.name"
                  :disabled="authStore.isLoading"
                />
              </div>
              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  v-model="profileForm.email"
                  :disabled="authStore.isLoading"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  v-model="profileForm.phone"
                  :disabled="authStore.isLoading"
                />
              </div>
              <div class="form-group">
                <label for="studentId">Student ID</label>
                <input
                  type="text"
                  id="studentId"
                  v-model="profileForm.studentId"
                  :disabled="authStore.isLoading"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="major">Major</label>
                <input
                  type="text"
                  id="major"
                  v-model="profileForm.major"
                  :disabled="authStore.isLoading"
                />
              </div>
              <div class="form-group">
                <label for="year">Academic Year</label>
                <select
                  id="year"
                  v-model="profileForm.year"
                  :disabled="authStore.isLoading"
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-button" :disabled="authStore.isLoading">
                <i v-if="authStore.isLoading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ authStore.isLoading ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Financial Settings Tab -->
        <div v-if="activeTab === 'financial'" class="financial-form">
          <h2>Financial Preferences</h2>
          <form @submit.prevent="saveFinancialSettings">
            <div class="form-row">
              <div class="form-group">
                <label for="currency">Default Currency</label>
                <select id="currency" v-model="profileForm.currency">
                  <option value="KSH">Kenyan Shilling (KSH)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div class="form-group">
                <label for="monthlyBudget">Monthly Budget Limit</label>
                <input
                  type="number"
                  id="monthlyBudget"
                  v-model="profileForm.monthlyBudget"
                  step="0.01"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="institution">Institution</label>
                <input type="text" id="institution" v-model="profileForm.institution" />
              </div>
              <div class="form-group">
                <label for="yearOfStudy">Year of Study</label>
                <select id="yearOfStudy" v-model="profileForm.yearOfStudy">
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="postgrad">Postgraduate</option>
                </select>
              </div>
            </div>

            <div class="financial-alerts">
              <h3>Financial Alerts</h3>
              <div class="alert-item">
                <label class="switch">
                  <input type="checkbox" v-model="preferences.budgetAlerts" />
                  <span class="slider"></span>
                </label>
                <div>
                  <strong>Budget Alerts</strong>
                  <p>Get notified when you're approaching spending limits</p>
                </div>
              </div>
              <div class="alert-item">
                <label class="switch">
                  <input type="checkbox" v-model="preferences.billReminders" />
                  <span class="slider"></span>
                </label>
                <div>
                  <strong>Bill Reminders</strong>
                  <p>Receive notifications for upcoming bills</p>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-button">
                <i class="fas fa-save"></i>
                Save Financial Settings
              </button>
            </div>
          </form>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="security-form">
          <h2>Security Settings</h2>
          <div class="security-section">
            <h3>Change Password</h3>
            <form @submit.prevent="changePassword">
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  placeholder="Enter current password"
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    placeholder="Enter new password"
                  />
                </div>
                <div class="form-group">
                  <label for="confirmNewPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    v-model="passwordForm.confirmNewPassword"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <button type="submit" class="save-button">
                <i class="fas fa-lock"></i>
                Update Password
              </button>
            </form>
          </div>
        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'" class="preferences-form">
          <h2>App Preferences</h2>
          <div class="preference-section">
            <h3>Notifications</h3>
            <div class="preference-item">
              <label class="switch">
                <input type="checkbox" v-model="preferences.emailNotifications" />
                <span class="slider"></span>
              </label>
              <div>
                <strong>Email Notifications</strong>
                <p>Receive email alerts for important account activities</p>
              </div>
            </div>
          </div>

          <div class="preference-section">
            <h3>Display</h3>
            <div class="preference-item">
              <label class="switch">
                <input type="checkbox" v-model="preferences.darkMode" />
                <span class="slider"></span>
              </label>
              <div>
                <strong>Dark Mode</strong>
                <p>Use dark theme for better viewing in low light</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="savePreferences" class="save-button">
              <i class="fas fa-save"></i>
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard Shortcuts Modal -->
    <div v-if="showShortcuts" class="modal-overlay" @click="showShortcuts = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Keyboard Shortcuts</h3>
          <button @click="showShortcuts = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <kbd>Ctrl + S</kbd>
              <span>Save Profile</span>
            </div>
            <div class="shortcut-item">
              <kbd>Esc</kbd>
              <span>Close Modals</span>
            </div>
            <div class="shortcut-item">
              <kbd>Tab</kbd>
              <span>Navigate Tabs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFinanceStore } from "@/stores/finance";

const router = useRouter();
const authStore = useAuthStore();
const financeStore = useFinanceStore();

// Component state
const activeTab = ref("profile");
const showActionsMenu = ref(false);
const showShortcuts = ref(false);
const isDarkMode = ref(false);
const unreadNotifications = ref(3);
const profileActionsDropdown = ref(null);

// Profile form data
const profileForm = reactive({
  name: "",
  email: "",
  phone: "",
  studentId: "",
  university: "",
  major: "",
  year: "",
  institution: "",
  yearOfStudy: "",
  currency: "KSH",
  monthlyBudget: "",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const preferences = reactive({
  emailNotifications: true,
  budgetAlerts: true,
  billReminders: true,
  darkMode: false,
});

// Computed properties
const formattedBalance = computed(() => {
  return `KSH ${financeStore.balance?.toLocaleString() || "0"}`;
});

const transactionCount = computed(() => {
  return financeStore.transactions?.length || 0;
});

const savingsGoals = computed(() => {
  return financeStore.savings?.length || 0;
});

// Methods
const goBack = () => {
  router.push("/");
};

const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value;
};

const editAvatar = () => {
  // Implement avatar upload functionality
  console.log("Edit avatar");
};

const updateProfile = async () => {
  await authStore.updateProfile(profileForm);
  alert("Profile updated successfully!");
};

const saveFinancialSettings = () => {
  // Save financial settings
  authStore.updateUser(profileForm);
  alert("Financial settings saved!");
};

const changePassword = () => {
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    alert("New passwords do not match");
    return;
  }
  alert("Password updated successfully!");
  Object.assign(passwordForm, {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
};

const savePreferences = () => {
  localStorage.setItem("user_preferences", JSON.stringify(preferences));
  alert("Preferences saved successfully!");
};

// Actions menu methods
const exportData = () => {
  console.log("Exporting user data");
  showActionsMenu.value = false;
};

const openNotificationSettings = () => {
  activeTab.value = "preferences";
  showActionsMenu.value = false;
};

const viewFinancialSummary = () => {
  router.push("/#overview");
};

const openBudgetGoals = () => {
  router.push("/#budget");
};

const openHelp = () => {
  console.log("Opening help");
  showActionsMenu.value = false;
};

const openFeedback = () => {
  console.log("Opening feedback form");
  showActionsMenu.value = false;
};

const showKeyboardShortcuts = () => {
  showShortcuts.value = true;
  showActionsMenu.value = false;
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark-mode", isDarkMode.value);
  showActionsMenu.value = false;
};

const logout = () => {
  if (confirm("Are you sure you want to sign out?")) {
    authStore.logout();
    router.push("/login");
  }
  showActionsMenu.value = false;
};

// Click outside to close
const handleClickOutside = (event) => {
  if (
    profileActionsDropdown.value &&
    !profileActionsDropdown.value.contains(event.target)
  ) {
    showActionsMenu.value = false;
  }
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === "Escape") {
    showActionsMenu.value = false;
    showShortcuts.value = false;
  }
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    if (activeTab.value === "profile") {
      updateProfile();
    } else if (activeTab.value === "financial") {
      saveFinancialSettings();
    } else if (activeTab.value === "preferences") {
      savePreferences();
    }
  }
};

onMounted(() => {
  if (authStore.user) {
    Object.assign(profileForm, authStore.user);
  }

  const savedPreferences = localStorage.getItem("user_preferences");
  if (savedPreferences) {
    Object.assign(preferences, JSON.parse(savedPreferences));
  }

  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* Profile Navigation */
.profile-nav {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-4) 0;
  margin-bottom: var(--space-6);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-base);
}

.back-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-500);
}

/* Profile Actions Dropdown */
.profile-actions-dropdown {
  position: relative;
}

.actions-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
}

.actions-btn:hover {
  background: var(--primary-600);
}

.actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 250px;
  z-index: 1000;
}

.actions-menu-section {
  padding: var(--space-3) 0;
}

.actions-menu-section h5 {
  margin: 0 0 var(--space-2) 0;
  padding: 0 var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.menu-item i {
  width: 16px;
  color: var(--text-muted);
}

.notification-badge {
  background: var(--danger-500);
  color: white;
  font-size: var(--font-size-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  margin-left: auto;
  min-width: 20px;
  text-align: center;
}

.logout-btn {
  color: var(--danger-600);
}

.logout-btn:hover {
  background: var(--danger-50);
  color: var(--danger-700);
}

.actions-menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-2) 0;
}

/* Profile Stats */
.profile-stats {
  display: flex;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* Financial Settings Form */
.financial-form {
  max-width: 800px;
}

.financial-alerts {
  margin-top: var(--space-6);
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

/* Tab Styling */
.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.tab-btn.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-500);
}

/* Modal Styles */
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
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-body {
  padding: var(--space-6);
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  cursor: pointer;
  color: var(--text-muted);
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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

/* Responsive Design */
@media (max-width: 768px) {
  .profile-stats {
    flex-direction: column;
    gap: var(--space-3);
  }

  .form-row {
    flex-direction: column;
  }

  .nav-content {
    flex-direction: column;
    gap: var(--space-4);
  }
}
</style>
