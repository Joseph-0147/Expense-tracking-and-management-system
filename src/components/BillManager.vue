<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">💳 Bill Management</h2>
      <button @click="showAddBillModal = true" class="btn btn-primary">Add Bill</button>
    </div>

    <!-- Bill Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="summary-card">
        <span class="summary-label">Monthly Bills</span>
        <span class="summary-value"
          >Ksh{{ financeStore.totalMonthlyBills?.toFixed(2) || "0.00" }}</span
        >
      </div>
      <div class="summary-card" style="border-left-color: var(--warning-500)">
        <span class="summary-label">Upcoming</span>
        <span class="summary-value">{{ financeStore.upcomingBills?.length || 0 }}</span>
      </div>
      <div class="summary-card" style="border-left-color: var(--danger-500)">
        <span class="summary-label">Overdue</span>
        <span class="summary-value">{{ financeStore.overdueBills?.length || 0 }}</span>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="financeStore.upcomingBills?.length > 0" class="alert alert-warning">
      ⏰ {{ financeStore.upcomingBills.length }} bill(s) due in the next 7 days
    </div>

    <div v-if="financeStore.overdueBills?.length > 0" class="alert alert-danger">
      🚨 {{ financeStore.overdueBills.length }} overdue bill(s) need immediate attention
    </div>

    <!-- Upcoming Bills Section -->
    <div v-if="financeStore.upcomingBills?.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-yellow-600">⏰ Upcoming Bills</h3>
      <div class="space-y-3">
        <div
          v-for="bill in financeStore.upcomingBills"
          :key="bill.id"
          class="bill-item bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4"
        >
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h4 class="font-semibold text-primary">{{ bill.name }}</h4>
              <div class="text-sm text-muted">
                {{ bill.category }} • {{ bill.frequency }}
              </div>
              <div class="text-sm font-medium text-yellow-600">
                Due: {{ formatDate(bill.nextDueDate) }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">Ksh{{ bill.amount.toFixed(2) }}</div>
              <div class="flex gap-2 mt-2">
                <button @click="markAsPaid(bill.id)" class="btn btn-secondary btn-sm">
                  <i class="fas fa-check"></i> Pay
                </button>
                <button @click="editBill(bill)" class="btn btn-ghost btn-sm">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overdue Bills Section -->
    <div v-if="financeStore.overdueBills?.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-red-600">🚨 Overdue Bills</h3>
      <div class="space-y-3">
        <div
          v-for="bill in financeStore.overdueBills"
          :key="bill.id"
          class="bill-item bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
        >
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h4 class="font-semibold text-primary">{{ bill.name }}</h4>
              <div class="text-sm text-muted">
                {{ bill.category }} • {{ bill.frequency }}
              </div>
              <div class="text-sm font-medium text-red-600">
                Overdue since: {{ formatDate(bill.nextDueDate) }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">Ksh{{ bill.amount.toFixed(2) }}</div>
              <div class="flex gap-2 mt-2">
                <button @click="markAsPaid(bill.id)" class="btn btn-secondary btn-sm">
                  <i class="fas fa-check"></i> Pay Now
                </button>
                <button @click="editBill(bill)" class="btn btn-ghost btn-sm">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Bills Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4">📋 All Bills</h3>

      <div v-if="!financeStore.bills?.length" class="text-center py-12">
        <h3 class="text-lg font-semibold mb-2">💳 No Bills Added</h3>
        <p class="text-muted mb-6">
          Track your recurring bills and never miss a payment.
        </p>
        <button @click="showAddBillModal = true" class="btn btn-primary">
          Add Your First Bill
        </button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="bill in financeStore.bills"
          :key="bill.id"
          class="bill-item bg-gray border border-gray-200 rounded-lg p-4 hover:shadow-md transition-base"
        >
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h4 class="font-semibold text-primary">{{ bill.name }}</h4>
              <div class="text-sm text-muted">
                {{ bill.category }} • {{ bill.frequency }}
              </div>
              <div class="text-sm text-muted">
                Next due: {{ formatDate(bill.nextDueDate) }}
              </div>
              <p v-if="bill.notes" class="text-sm text-muted mt-1">{{ bill.notes }}</p>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">Ksh{{ bill.amount.toFixed(2) }}</div>
              <div class="flex gap-2 mt-2">
                <button @click="markAsPaid(bill.id)" class="btn btn-secondary btn-sm">
                  <i class="fas fa-check"></i> Pay
                </button>
                <button @click="editBill(bill)" class="btn btn-ghost btn-sm">
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="deleteBill(bill.id)"
                  class="btn btn-ghost btn-sm text-red-500"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Bill Modal -->
    <div v-if="showAddBillModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingBill ? "Edit Bill" : "Add New Bill" }}</h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveBill" class="space-y-4">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Bill Name</label>
                <input
                  v-model="billForm.name"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Electricity Bill"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Amount (Ksh)</label>
                <input
                  v-model="billForm.amount"
                  type="number"
                  step="0.01"
                  class="form-input"
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="billForm.category" class="form-select" required>
                  <option value="">Select category</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Internet">Internet</option>
                  <option value="Phone">Phone</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Frequency</label>
                <select v-model="billForm.frequency" class="form-select" required>
                  <option value="">Select frequency</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Next Due Date</label>
              <input
                v-model="billForm.nextDueDate"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea
                v-model="billForm.notes"
                class="form-textarea"
                rows="3"
                placeholder="Additional notes about this bill"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" @click="closeModal" class="btn btn-ghost flex-1">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary flex-1">
                {{ editingBill ? "Update Bill" : "Add Bill" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useFinanceStore } from "@/stores/finance";

const financeStore = useFinanceStore();

const showAddBillModal = ref(false);
const editingBill = ref(null);

const billForm = reactive({
  name: "",
  amount: "",
  frequency: "",
  nextDueDate: "",
  category: "Utilities",
  notes: "",
});

const resetForm = () => {
  billForm.name = "";
  billForm.amount = "";
  billForm.frequency = "";
  billForm.nextDueDate = "";
  billForm.category = "Utilities";
  billForm.notes = "";
};

const closeModal = () => {
  showAddBillModal.value = false;
  editingBill.value = null;
  resetForm();
};

const editBill = (bill) => {
  editingBill.value = bill;
  billForm.name = bill.name;
  billForm.amount = bill.amount;
  billForm.frequency = bill.frequency;
  billForm.nextDueDate = bill.nextDueDate.split("T")[0];
  billForm.category = bill.category;
  billForm.notes = bill.notes || "";
  showAddBillModal.value = true;
};

const saveBill = () => {
  const billData = {
    name: billForm.name,
    amount: parseFloat(billForm.amount),
    frequency: billForm.frequency,
    nextDueDate: billForm.nextDueDate,
    category: billForm.category,
    notes: billForm.notes,
  };

  if (editingBill.value) {
    financeStore.updateBill(editingBill.value.id, billData);
  } else {
    financeStore.addBill(billData);
  }
  closeModal();
};

const markAsPaid = (billId) => {
  financeStore.markBillAsPaid(billId);
};

const deleteBill = (billId) => {
  if (confirm("Are you sure you want to delete this bill?")) {
    financeStore.deleteBill(billId);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-title {
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

.grid {
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

.summary-card.overdue {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.summary-card.upcoming {
  border-left-color: #f59e0b;
  background: #fffbeb;
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

.mb-6 {
  margin-bottom: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-warning {
  background: #fffbeb;
  color: #856404;
  border-color: #ffeeba;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.upcoming-bills,
.overdue-bills,
.all-bills {
  margin-bottom: 2rem;
}

.upcoming-bills h3,
.overdue-bills h3,
.all-bills h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.space-y-3 {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.bill-item:hover {
  border-color: #4a8fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bill-item.upcoming {
  border-left: 4px solid #f59e0b;
}

.bill-item.overdue {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bill-name {
  font-weight: 600;
  color: #1f2937;
}

.bill-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #4a8fff;
}

.bill-frequency,
.bill-due {
  font-size: 0.875rem;
  color: #6b7280;
}

.bill-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-pay {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-edit {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-delete {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
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

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 2rem;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4a8fff;
  box-shadow: 0 0 0 3px rgba(74, 143, 255, 0.1);
}

.flex {
  display: flex;
}

.gap-3 {
  gap: 0.75rem;
}

.pt-4 {
  padding-top: 1rem;
}

.btn-ghost {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: #f3f4f6;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .bill-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .bill-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
