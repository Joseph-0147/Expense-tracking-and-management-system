// ===== 6. UPDATED APP.VUE ===== //
<template>
  <div id="app">
    <header v-if="authStore.isAuthenticated">
      <nav>
        <div class="nav-left">
          <router-link to="/" class="logo-link">
            <i class="fas fa-chart-line"></i> Finance Dashboard
          </router-link>
        </div>
        <div class="nav-right">
          <!-- Enhanced Profile Dropdown Menu -->
          <div class="profile-dropdown" ref="profileDropdown">
            <button @click="toggleProfileMenu" class="profile-btn">
              <div class="profile-avatar">
                <img
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                  :alt="authStore.user.name"
                  class="avatar-img"
                />
                <div v-else class="avatar-placeholder">
                  {{ authStore.userInitials }}
                </div>
              </div>
              <div class="profile-info">
                <span class="profile-name">{{ authStore.user?.name }}</span>
                <span class="profile-email">{{ authStore.user?.email }}</span>
              </div>
              <i
                class="fas fa-chevron-down profile-arrow"
                :class="{ rotated: showProfileMenu }"
              ></i>
            </button>

            <!-- Enhanced Dropdown Menu -->
            <div v-if="showProfileMenu" class="profile-menu">
              <div class="profile-menu-header">
                <div class="profile-avatar-large">
                  <img
                    v-if="authStore.user?.avatar"
                    :src="authStore.user.avatar"
                    :alt="authStore.user.name"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ authStore.userInitials }}
                  </div>
                </div>
                <div class="profile-details">
                  <h4>{{ authStore.user?.name }}</h4>
                  <p>{{ authStore.user?.email }}</p>
                  <span class="profile-role">{{
                    authStore.user?.role || "Student"
                  }}</span>
                </div>
              </div>

              <div class="profile-menu-divider"></div>

              <div class="profile-menu-section">
                <h5>Account</h5>
                <router-link to="/profile" @click="closeProfileMenu" class="menu-item">
                  <i class="fas fa-user"></i>
                  Profile Settings
                </router-link>
                <button @click="openNotificationSettings" class="menu-item">
                  <i class="fas fa-bell"></i>
                  Notifications
                  <span v-if="unreadNotifications > 0" class="notification-badge">
                    {{ unreadNotifications }}
                  </span>
                </button>
              </div>

              <div class="profile-menu-divider"></div>

              <div class="profile-menu-section">
                <h5>Finance</h5>
                <button @click="viewFinancialSummary" class="menu-item">
                  <i class="fas fa-chart-line"></i>
                  Financial Summary
                </button>
                <button @click="exportData" class="menu-item">
                  <i class="fas fa-download"></i>
                  Export Data
                </button>
                <button @click="openBudgetGoals" class="menu-item">
                  <i class="fas fa-target"></i>
                  Budget Goals
                </button>
              </div>

              <div class="profile-menu-divider"></div>

              <div class="profile-menu-section">
                <h5>Support</h5>
                <button @click="openHelp" class="menu-item">
                  <i class="fas fa-question-circle"></i>
                  Help & Support
                </button>
                <button @click="openFeedback" class="menu-item">
                  <i class="fas fa-comment"></i>
                  Send Feedback
                </button>
              </div>

              <div class="profile-menu-divider"></div>

              <div class="profile-menu-section">
                <button @click="toggleDarkMode" class="menu-item">
                  <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                  {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
                </button>
                <button @click="handleLogout" class="menu-item logout-btn">
                  <i class="fas fa-sign-out-alt"></i>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const showProfileMenu = ref(false);
const profileDropdown = ref(null);
const isDarkMode = ref(false);
const unreadNotifications = ref(3);

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const closeProfileMenu = () => {
  showProfileMenu.value = false;
};

const handleLogout = () => {
  if (confirm("Are you sure you want to sign out?")) {
    authStore.logout();
    showProfileMenu.value = false;
    router.push("/login");
  }
};

// Profile menu actions
const openNotificationSettings = () => {
  router.push("/profile");
  closeProfileMenu();
};

const viewFinancialSummary = () => {
  router.push("/#overview");
  closeProfileMenu();
};

const exportData = () => {
  // Implement data export functionality
  console.log("Exporting user data");
  closeProfileMenu();
};

const openBudgetGoals = () => {
  router.push("/#budget");
  closeProfileMenu();
};

const openHelp = () => {
  // Implement help functionality
  console.log("Opening help");
  closeProfileMenu();
};

const openFeedback = () => {
  // Implement feedback functionality
  console.log("Opening feedback form");
  closeProfileMenu();
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark-mode", isDarkMode.value);
  closeProfileMenu();
};

// Click outside to close
const handleClickOutside = (event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === "Escape") {
    showProfileMenu.value = false;
  }
};

onMounted(() => {
  authStore.loadUserFromStorage();
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style>
/* Global styles for the complete application */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

/* Header Navigation Styles */
header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-left .logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Enhanced Profile Dropdown Styles */
.profile-dropdown {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 280px;
  color: white;
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-avatar-large {
  width: 60px;
  height: 60px;
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
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
}

.profile-name {
  font-weight: 500;
  color: white;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.profile-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.profile-arrow {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.profile-arrow.rotated {
  transform: rotate(180deg);
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
}

.profile-menu-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.profile-details h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1e293b;
}

.profile-details p {
  margin: 0 0 0.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

.profile-role {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.profile-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.profile-menu-section {
  padding: 0.75rem 0;
}

.profile-menu-section h5 {
  margin: 0 0 0.5rem 0;
  padding: 0 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #374151;
  font-size: 0.875rem;
  text-decoration: none;
  position: relative;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item i {
  width: 16px;
  color: #6b7280;
}

.notification-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  margin-left: auto;
  min-width: 20px;
  text-align: center;
}

.logout-btn {
  color: #dc2626;
}

.logout-btn:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.logout-btn i {
  color: #dc2626;
}

/* Auth Container Styles */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

.register-card {
  max-width: 600px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
}

.auth-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #64748b;
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.forgot-link,
.terms-link {
  color: #667eea;
  text-decoration: none;
}

.auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.switch-auth {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

/* Profile Styles */
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.profile-banner {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info h1 {
  font-size: 1.875rem;
  margin-bottom: 0.5rem;
}

.student-id {
  opacity: 0.8;
  font-weight: 500;
}

.university {
  opacity: 0.7;
}

.profile-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
}

.profile-tabs button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.profile-tabs button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.profile-form h2,
.security-form h2,
.preferences-form h2 {
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.security-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.security-section h3 {
  margin-bottom: 1rem;
  color: #374151;
}

.preference-section {
  margin-bottom: 2rem;
}

.preference-section h3 {
  margin-bottom: 1rem;
  color: #374151;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .profile-banner {
    flex-direction: column;
    text-align: center;
  }

  .profile-tabs {
    flex-direction: column;
  }

  nav {
    padding: 1rem;
  }

  .nav-right {
    gap: 1rem;
  }

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
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .profile-container {
    padding: 1rem;
  }

  .profile-menu-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .profile-menu {
    width: 100%;
    right: -100%;
  }
}
</style>
