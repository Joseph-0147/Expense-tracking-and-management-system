<template>
  <div class="tuition-manager">
    <CardHeader
      title="Tuition & Fees"
      icon="fas fa-graduation-cap"
      :show-add-button="true"
      add-button-text="Add Fee"
      @add="showTuitionModal = true"
    />

    <!-- Tuition Summary -->
    <div class="tuition-summary">
      <SummaryCard
        label="Total Fees"
        :value="financeStore.tuitionSummary?.totalFees || 0"
        type="currency"
      />
      <SummaryCard
        label="Paid"
        :value="financeStore.tuitionSummary?.totalPaid || 0"
        type="currency"
        status="positive"
      />
      <SummaryCard
        label="Balance"
        :value="financeStore.tuitionSummary?.totalRemaining || 0"
        type="currency"
        :status="(financeStore.tuitionSummary?.totalRemaining || 0) > 0 ? 'warning' : 'positive'"
      />
    </div>

    <!-- No Fees State -->
    <div
      v-if="
        !financeStore.currentSemesterFees || financeStore.currentSemesterFees.length === 0
      "
      class="no-fees"
    >
      <div class="no-fees-content">
        <h3>📚 No Tuition Fees Added</h3>
        <p>Add your semester fees to track payments and deadlines.</p>
        <button @click="showTuitionModal = true" class="btn-primary">
          Add Your First Fee
        </button>
      </div>
    </div>

    <!-- Current Semester Fees -->
    <div class="fees-section" v-else>
      <h3>Current Semester Fees</h3>
      <div class="fees-grid">
        <div
          v-for="fee in financeStore.currentSemesterFees"
          :key="fee.id"
          class="fee-card"
        >
          <div class="fee-header">
            <div class="fee-info">
              <h4 class="fee-name">{{ fee.name }}</h4>
              <span class="fee-type">{{ fee.type }}</span>
            </div>
            <div class="fee-amount">
              <span class="amount">Ksh{{ fee.amount?.toFixed(2) || "0.00" }}</span>
            </div>
          </div>

          <div class="fee-actions">
            <button @click="editFee(fee)" class="btn-edit">Edit</button>
            <button @click="deleteFee(fee.id)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Fee Modal -->
    <Modal
      :show="showTuitionModal || !!editingFee"
      :title="editingFee ? 'Edit Fee' : 'Add New Fee'"
      size="medium"
      @close="closeModal"
    >
      <form @submit.prevent="saveFee">
        <div class="form-group">
          <label>Fee Name</label>
          <input
            v-model="feeForm.name"
            type="text"
            placeholder="e.g., Tuition Fee, Lab Fee"
            required
          />
        </div>

        <div class="form-group">
          <label>Fee Type</label>
          <select v-model="feeForm.type" required>
            <option value="">Select type</option>
            <option value="Tuition">Tuition</option>
            <option value="Lab Fee">Lab Fee</option>
            <option value="Exam Fee">Exam Fee</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Amount (Ksh)</label>
            <input
              v-model.number="feeForm.amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input v-model="feeForm.dueDate" type="date" required />
          </div>
        </div>

        <div class="form-group">
          <label>Semester/Year</label>
          <input
            v-model="feeForm.semester"
            type="text"
            placeholder="e.g., Fall 2024"
            required
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-save">
            {{ editingFee ? "Update Fee" : "Add Fee" }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useFinanceStore } from "@/stores/finance";
import SummaryCard from "@/components/shared/SummaryCard.vue";
import Modal from "@/components/shared/Modal.vue";
import CardHeader from "@/components/shared/CardHeader.vue";

const financeStore = useFinanceStore();

const showTuitionModal = ref(false);
const editingFee = ref(null);

const feeForm = reactive({
  name: "",
  type: "",
  amount: "",
  dueDate: "",
  semester: "",
});

const resetForm = () => {
  feeForm.name = "";
  feeForm.type = "";
  feeForm.amount = "";
  feeForm.dueDate = "";
  feeForm.semester = "";
};

const closeModal = () => {
  showTuitionModal.value = false;
  editingFee.value = null;
  resetForm();
};

const editFee = (fee) => {
  editingFee.value = fee;
  feeForm.name = fee.name;
  feeForm.type = fee.type;
  feeForm.amount = fee.amount;
  feeForm.dueDate = fee.dueDate ? fee.dueDate.split("T")[0] : "";
  feeForm.semester = fee.semester || "";
};

const saveFee = () => {
  try {
    if (editingFee.value) {
      financeStore.updateTuitionFee(editingFee.value.id, { ...feeForm });
    } else {
      financeStore.addTuitionFee({ ...feeForm });
    }
    closeModal();
  } catch (error) {
    console.error("Error saving fee:", error);
    alert("Error saving fee. Please try again.");
  }
};

const deleteFee = (feeId) => {
  if (confirm("Are you sure you want to delete this fee?")) {
    try {
      financeStore.deleteTuitionFee(feeId);
    } catch (error) {
      console.error("Error deleting fee:", error);
      alert("Error deleting fee. Please try again.");
    }
  }
};
</script>

<style scoped>
.tuition-manager {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.tuition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tuition-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.tuition-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  border-left: 3px solid #6366f1;
}

.summary-card.paid {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.summary-card.remaining {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.summary-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.summary-value {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.no-fees {
  text-align: center;
  padding: 2rem 1rem;
}

.no-fees-content h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.no-fees-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.fees-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.fees-grid {
  display: grid;
  gap: 1rem;
}

.fee-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 3px solid #6366f1;
}

.fee-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.fee-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.fee-type {
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.fee-amount {
  text-align: right;
}

.amount {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.fee-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  flex: 1;
}

.btn-delete {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  flex: 1;
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
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
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
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-save {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tuition-manager {
    padding: 1rem;
  }

  .tuition-summary {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .fee-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .fee-amount {
    text-align: left;
  }
}
</style>
