// ===== 2. LOGIN VIEW (src/views/LoginView.vue) =====
<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h1>Welcome Back</h1>
        <p>Sign in to your student finance account</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            :disabled="authStore.isLoading"
            required
            placeholder="student@university.edu"
          />
        </div>

        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              :disabled="authStore.isLoading"
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
              :disabled="authStore.isLoading"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.rememberMe" />
            <span class="checkmark"></span>
            Remember me
          </label>
          <router-link to="/forgot-password" class="forgot-link">
            Forgot password?
          </router-link>
        </div>

        <button type="submit" class="auth-button" :disabled="authStore.isLoading">
          <i v-if="authStore.isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sign-in-alt"></i>
          {{ authStore.isLoading ? "Signing In..." : "Sign In" }}
        </button>

        <div v-if="authStore.error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ authStore.error }}
        </div>
      </form>

      <div class="auth-footer">
        <p>Don't have an account?</p>
        <router-link to="/register" class="switch-auth"> Create Account </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: "",
  password: "",
  rememberMe: false,
});

const showPassword = ref(false);

const handleLogin = async () => {
  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password,
    name: form.value.email.split("@")[0], // Extract name from email for demo
  });

  if (result.success) {
    router.push("/");
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push("/");
  }
});
</script>
