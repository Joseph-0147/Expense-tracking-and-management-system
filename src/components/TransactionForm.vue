<template>
  <div class="card">
    <div class="bg-gradient-primary text-white p-6 -m-6 mb-6 rounded-t-xl">
      <h3 class="text-xl font-semibold flex items-center gap-2">💳 Add Transaction</h3>
    </div>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Description</label>
          <input
            v-model="description"
            type="text"
            class="form-input"
            placeholder="Enter description"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Amount (Ksh)</label>
          <input
            v-model="amount"
            type="number"
            step="0.01"
            class="form-input"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Type</label>
          <select v-model="type" class="form-select" required>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select v-model="category" class="form-select" required>
            <optgroup v-if="type === 'income'" label="Income Categories">
              <option value="Job">Part-time Job</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Family">Family Support</option>
              <option value="Freelance">Freelance Work</option>
              <option value="Other">Other Income</option>
            </optgroup>
            <optgroup v-else label="Expense Categories">
              <option value="Tuition">Tuition</option>
              <option value="Books">Books & Supplies</option>
              <option value="Food">Food</option>
              <option value="Transport">Transportation</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other Expenses</option>
            </optgroup>
          </select>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg">
        <i class="fas fa-plus"></i>
        Add Transaction
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["add-transaction"]);

const description = ref("");
const amount = ref("");
const type = ref("expense");
const category = ref("");

const handleSubmit = () => {
  if (description.value && amount.value > 0 && category.value) {
    emit("add-transaction", {
      id: Date.now(),
      description: description.value,
      amount: parseFloat(amount.value),
      type: type.value,
      category: category.value,
      date: new Date().toISOString(),
    });

    // Reset form
    description.value = "";
    amount.value = "";
    category.value = "";
  } else {
    alert("Please fill in all required fields");
  }
};

// Reset category when type changes
watch(type, () => {
  category.value = "";
});
</script>

<style scoped>
.bg-gradient-primary {
  background: var(--gradient-primary);
}
</style>
