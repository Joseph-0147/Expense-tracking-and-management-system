// ===== 3. REGISTER VIEW (src/views/RegisterView.vue) =====
<template>
  <div class="auth-container">
    <div class="auth-card register-card">
      <div class="auth-header">
        <div class="logo">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h1>Create Account</h1>
        <p>Join thousands of students managing their finances</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">
              <i class="fas fa-user"></i>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              v-model="form.firstName"
              :disabled="authStore.isLoading"
              required
              placeholder="John"
            />
          </div>

          <div class="form-group">
            <label for="lastName">
              <i class="fas fa-user"></i>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              v-model="form.lastName"
              :disabled="authStore.isLoading"
              required
              placeholder="Doe"
            />
          </div>
        </div>

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
            placeholder="john.doe@university.edu"
          />
        </div>

        <div class="form-group">
          <label for="studentId">
            <i class="fas fa-id-card"></i>
            Student ID
          </label>
          <input
            type="text"
            id="studentId"
            v-model="form.studentId"
            :disabled="authStore.isLoading"
            required
            placeholder="STU2024001"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="university">
              <i class="fas fa-university"></i>
              University
            </label>
            <input
              type="text"
              id="university"
              v-model="form.university"
              :disabled="authStore.isLoading"
              required
              placeholder="University of Example"
            />
          </div>

          <div class="form-group">
            <label for="major">
              <i class="fas fa-book"></i>
              Major
            </label>
            <input
              type="text"
              id="major"
              v-model="form.major"
              :disabled="authStore.isLoading"
              required
              placeholder="Computer Science"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="year">
            <i class="fas fa-calendar"></i>
            Academic Year
          </label>
          <select id="year" v-model="form.year" :disabled="authStore.isLoading" required>
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
          </select>
        </div>

        <div class="form-row">
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
                placeholder="Create password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">
              <i class="fas fa-lock"></i>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              v-model="form.confirmPassword"
              :disabled="authStore.isLoading"
              required
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.agreeToTerms" required />
            <span class="checkmark"></span>
            I agree to the <a href="#" class="terms-link">Terms of Service</a> and
            <a href="#" class="terms-link">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="authStore.isLoading || !isFormValid"
        >
          <i v-if="authStore.isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-user-plus"></i>
          {{ authStore.isLoading ? "Creating Account..." : "Create Account" }}
        </button>

        <div v-if="authStore.error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ authStore.error }}
        </div>
      </form>

      <div class="auth-footer">
        <p>Already have an account?</p>
        <router-link to="/login" class="switch-auth"> Sign In </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  studentId: "",
  university: "",
  major: "",
  year: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
});

const showPassword = ref(false);

const isFormValid = computed(() => {
  return (
    form.value.password === form.value.confirmPassword &&
    form.value.password.length >= 6 &&
    form.value.agreeToTerms
  );
});

const handleRegister = async () => {
  if (!isFormValid.value) {
    authStore.error = "Please check all fields and ensure passwords match";
    return;
  }

  const result = await authStore.register({
    name: `${form.value.firstName} ${form.value.lastName}`,
    email: form.value.email,
    studentId: form.value.studentId,
    university: form.value.university,
    major: form.value.major,
    year: form.value.year,
    password: form.value.password,
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
