<template>
  <div class="loan-manager card">
    <div class="card-header">
      <h2 class="card-title">💰 Student Loans</h2>
      <button @click="showLoanModal = true" class="btn btn-primary">Add Loan</button>
    </div>

    <!-- Loan Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div class="summary-card">
        <span class="summary-label">Total Borrowed</span>
        <span class="summary-value">
          Ksh{{ financeStore.loanSummary?.totalBorrowed?.toFixed(2) || "0.00" }}
        </span>
      </div>
      <div class="summary-card" style="border-left-color: var(--danger-500)">
        <span class="summary-label">Outstanding</span>
        <span class="summary-value">
          Ksh{{ financeStore.loanSummary?.totalOutstanding?.toFixed(2) || "0.00" }}
        </span>
      </div>
      <div class="summary-card" style="border-left-color: var(--secondary-500)">
        <span class="summary-label">Paid</span>
        <span class="summary-value">
          Ksh{{ financeStore.loanSummary?.totalPaid?.toFixed(2) || "0.00" }}
        </span>
      </div>
      <div class="summary-card" style="border-left-color: var(--warning-500)">
        <span class="summary-label">Total Interest</span>
        <span class="summary-value">
          Ksh{{ financeStore.loanSummary?.totalInterest?.toFixed(2) || "0.00" }}
        </span>
      </div>
    </div>

    <!-- Payment Progress -->
    <div
      v-if="financeStore.loanSummary?.totalBorrowed > 0"
      class="payment-progress bg-gray rounded-lg p-6 mb-6"
    >
      <div class="flex justify-between items-center mb-4">
        <span class="font-semibold text-secondary">Overall Repayment Progress</span>
        <span class="font-bold text-primary">
          {{
            (
              ((financeStore.loanSummary?.totalPaid || 0) /
                (financeStore.loanSummary?.totalBorrowed || 1)) *
              100
            ).toFixed(1)
          }}%
        </span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{
            width: `${Math.min(
              ((financeStore.loanSummary?.totalPaid || 0) /
                (financeStore.loanSummary?.totalBorrowed || 1)) *
                100,
              100
            )}%`,
          }"
        ></div>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="financeStore.upcomingLoanPayments?.length > 0" class="alert alert-warning">
      ⏰ {{ financeStore.upcomingLoanPayments.length }} loan payment(s) due soon
    </div>

    <div v-if="financeStore.overdueLoanPayments?.length > 0" class="alert alert-danger">
      🚨 {{ financeStore.overdueLoanPayments.length }} loan payment(s) overdue
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        @click="activeFilter = 'all'"
        :class="{ active: activeFilter === 'all' }"
        class="filter-tab"
      >
        All ({{ filteredLoans.length }})
      </button>
      <button
        @click="activeFilter = 'active'"
        :class="{ active: activeFilter === 'active' }"
        class="filter-tab"
      >
        Active
      </button>
      <button
        @click="activeFilter = 'paid'"
        :class="{ active: activeFilter === 'paid' }"
        class="filter-tab"
      >
        Paid Off
      </button>
      <button
        @click="activeFilter = 'deferred'"
        :class="{ active: activeFilter === 'deferred' }"
        class="filter-tab"
      >
        Deferred
      </button>
    </div>

    <!-- No Loans State -->
    <div
      v-if="!financeStore.loans || financeStore.loans.length === 0"
      class="text-center py-12"
    >
      <h3 class="text-lg font-semibold mb-2">🏦 No Student Loans Added</h3>
      <p class="text-muted mb-6">
        Track your student loans to manage repayments and monitor progress.
      </p>
      <button @click="showLoanModal = true" class="btn btn-primary">
        Add Your First Loan
      </button>
    </div>

    <!-- Loans Grid -->
    <div v-else class="grid gap-4">
      <div
        v-for="loan in filteredLoans"
        :key="loan.id"
        class="loan-card bg-gray border border-gray-200 rounded-lg p-4 transition-base hover:shadow-md"
        :class="loan.status"
      >
        <div class="loan-header">
          <div class="loan-info">
            <h4 class="loan-name">{{ loan.name }}</h4>
            <span class="loan-type">{{ loan.type }}</span>
          </div>
          <div class="loan-amount">
            <span class="amount"
              >Ksh{{ loan.principalAmount?.toFixed(2) || "0.00" }}</span
            >
            <span class="status-badge" :class="loan.status">
              {{ getStatusText(loan.status) }}
            </span>
          </div>
        </div>

        <div class="loan-details">
          <div class="detail-row">
            <span class="label">Lender:</span>
            <span class="value">{{ loan.lender }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Interest Rate:</span>
            <span class="value">{{ loan.interestRate }}% per year</span>
          </div>
          <div class="detail-row">
            <span class="label">Outstanding:</span>
            <span class="value"
              >Ksh{{ loan.outstandingBalance?.toFixed(2) || "0.00" }}</span
            >
          </div>
          <div class="detail-row" v-if="loan.monthlyPayment">
            <span class="label">Monthly Payment:</span>
            <span class="value">Ksh{{ loan.monthlyPayment?.toFixed(2) || "0.00" }}</span>
          </div>
          <div class="detail-row" v-if="loan.nextPaymentDate">
            <span class="label">Next Payment:</span>
            <span
              class="value"
              :class="{
                overdue: isOverdue(loan.nextPaymentDate),
                upcoming: isUpcoming(loan.nextPaymentDate),
              }"
            >
              {{ formatDate(loan.nextPaymentDate) }}
            </span>
          </div>
          <div
            class="detail-row"
            v-if="loan.status === 'active' && loan.estimatedPayoffDate"
          >
            <span class="label">Payoff Date:</span>
            <span class="value">{{ formatDate(loan.estimatedPayoffDate) }}</span>
          </div>
        </div>

        <div class="loan-progress" v-if="loan.status === 'active'">
          <div class="progress-label">Repayment Progress</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${getLoanProgress(loan)}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ getLoanProgress(loan).toFixed(1) }}% paid</div>
        </div>

        <div class="loan-actions">
          <button
            v-if="loan.status === 'active'"
            @click="makePayment(loan)"
            class="btn-payment"
          >
            Make Payment
          </button>
          <button
            v-if="loan.status === 'active'"
            @click="viewPaymentSchedule(loan)"
            class="btn-schedule"
          >
            Schedule
          </button>
          <button @click="editLoan(loan)" class="btn-edit">Edit</button>
          <button @click="deleteLoan(loan.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Loan Modal -->
    <div v-if="showLoanModal || editingLoan" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingLoan ? "Edit Loan" : "Add New Student Loan" }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveLoan">
            <div class="form-group">
              <label>Loan Name</label>
              <input
                v-model="loanForm.name"
                type="text"
                placeholder="e.g., Federal Student Loan, Private Education Loan"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Loan Type</label>
                <select v-model="loanForm.type" required>
                  <option value="">Select type</option>
                  <option value="Federal Student Loan">Federal Student Loan</option>
                  <option value="Private Student Loan">Private Student Loan</option>
                  <option value="Institutional Loan">Institutional Loan</option>
                  <option value="Parent PLUS Loan">Parent PLUS Loan</option>
                  <option value="Graduate PLUS Loan">Graduate PLUS Loan</option>
                  <option value="Perkins Loan">Perkins Loan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Lender</label>
                <input
                  v-model="loanForm.lender"
                  type="text"
                  placeholder="Bank, Government, Institution"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Principal Amount (Ksh)</label>
                <input
                  v-model.number="loanForm.principalAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div class="form-group">
                <label>Interest Rate (% per year)</label>
                <input
                  v-model.number="loanForm.interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Loan Term (months)</label>
                <input
                  v-model.number="loanForm.termMonths"
                  type="number"
                  min="1"
                  placeholder="e.g., 120 for 10 years"
                  required
                />
              </div>

              <div class="form-group">
                <label>Start Date</label>
                <input v-model="loanForm.startDate" type="date" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Grace Period (months)</label>
                <input
                  v-model.number="loanForm.gracePeriodMonths"
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div class="form-group">
                <label>Current Status</label>
                <select v-model="loanForm.status" required>
                  <option value="active">Active</option>
                  <option value="deferred">Deferred</option>
                  <option value="forbearance">Forbearance</option>
                  <option value="paid">Paid Off</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea
                v-model="loanForm.notes"
                placeholder="Additional loan details, payment instructions, etc."
                rows="2"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-save">
                {{ editingLoan ? "Update Loan" : "Add Loan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closePaymentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Make Payment - {{ selectedLoan?.name }}</h3>
          <button @click="closePaymentModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="payment-summary">
            <div class="summary-row">
              <span>Outstanding Balance:</span>
              <span>Ksh{{ selectedLoan?.outstandingBalance?.toFixed(2) }}</span>
            </div>
            <div class="summary-row" v-if="selectedLoan?.monthlyPayment">
              <span>Regular Payment:</span>
              <span>Ksh{{ selectedLoan?.monthlyPayment?.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Interest Rate:</span>
              <span>{{ selectedLoan?.interestRate }}% per year</span>
            </div>
          </div>

          <form @submit.prevent="processLoanPayment">
            <div class="form-group">
              <label>Payment Amount (Ksh)</label>
              <input
                v-model.number="paymentForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                :max="selectedLoan?.outstandingBalance"
                placeholder="0.00"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Payment Type</label>
                <select v-model="paymentForm.paymentType" required>
                  <option value="regular">Regular Payment</option>
                  <option value="principal">Principal Only</option>
                  <option value="interest">Interest Only</option>
                  <option value="extra">Extra Payment</option>
                </select>
              </div>

              <div class="form-group">
                <label>Payment Method</label>
                <select v-model="paymentForm.method" required>
                  <option value="">Select method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Auto Debit">Auto Debit</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Reference Number (Optional)</label>
              <input
                v-model="paymentForm.reference"
                type="text"
                placeholder="Transaction reference or confirmation number"
              />
            </div>

            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea
                v-model="paymentForm.notes"
                placeholder="Payment notes"
                rows="2"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closePaymentModal" class="btn-cancel">
                Cancel
              </button>
              <button type="submit" class="btn-save">Process Payment</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Payment Schedule Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal">
      <div class="modal-content schedule-modal" @click.stop>
        <div class="modal-header">
          <h3>Payment Schedule - {{ selectedLoan?.name }}</h3>
          <button @click="closeScheduleModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="schedule-summary">
            <div class="summary-item">
              <span class="label">Monthly Payment:</span>
              <span class="value">Ksh{{ selectedLoan?.monthlyPayment?.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Remaining Payments:</span>
              <span class="value">{{ getRemainingPayments(selectedLoan) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Interest:</span>
              <span class="value"
                >Ksh{{ getTotalInterest(selectedLoan)?.toFixed(2) }}</span
              >
            </div>
          </div>

          <div class="schedule-table">
            <div class="table-header">
              <span>Payment #</span>
              <span>Date</span>
              <span>Principal</span>
              <span>Interest</span>
              <span>Balance</span>
            </div>
            <div class="table-body">
              <div
                v-for="payment in getPaymentSchedule(selectedLoan).slice(0, 12)"
                :key="payment.paymentNumber"
                class="table-row"
              >
                <span>{{ payment.paymentNumber }}</span>
                <span>{{ formatDate(payment.date) }}</span>
                <span>Ksh{{ payment.principal.toFixed(2) }}</span>
                <span>Ksh{{ payment.interest.toFixed(2) }}</span>
                <span>Ksh{{ payment.balance.toFixed(2) }}</span>
              </div>
            </div>
            <div class="schedule-note">Showing next 12 payments</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useFinanceStore } from "@/stores/finance";

const financeStore = useFinanceStore();

const showLoanModal = ref(false);
const showPaymentModal = ref(false);
const showScheduleModal = ref(false);
const editingLoan = ref(null);
const selectedLoan = ref(null);
const activeFilter = ref("all");

const loanForm = reactive({
  name: "",
  type: "",
  lender: "",
  principalAmount: "",
  interestRate: "",
  termMonths: "",
  startDate: "",
  gracePeriodMonths: 0,
  status: "active",
  notes: "",
});

const paymentForm = reactive({
  amount: "",
  paymentType: "regular",
  method: "",
  reference: "",
  notes: "",
});

const filteredLoans = computed(() => {
  if (!financeStore.loans) return [];

  if (activeFilter.value === "all") {
    return financeStore.loans;
  }

  return financeStore.loans.filter((loan) => loan.status === activeFilter.value);
});

const resetForm = () => {
  loanForm.name = "";
  loanForm.type = "";
  loanForm.lender = "";
  loanForm.principalAmount = "";
  loanForm.interestRate = "";
  loanForm.termMonths = "";
  loanForm.startDate = "";
  loanForm.gracePeriodMonths = 0;
  loanForm.status = "active";
  loanForm.notes = "";
};

const resetPaymentForm = () => {
  paymentForm.amount = "";
  paymentForm.paymentType = "regular";
  paymentForm.method = "";
  paymentForm.reference = "";
  paymentForm.notes = "";
};

const closeModal = () => {
  showLoanModal.value = false;
  editingLoan.value = null;
  resetForm();
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedLoan.value = null;
  resetPaymentForm();
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  selectedLoan.value = null;
};

const editLoan = (loan) => {
  editingLoan.value = loan;
  loanForm.name = loan.name;
  loanForm.type = loan.type;
  loanForm.lender = loan.lender;
  loanForm.principalAmount = loan.principalAmount;
  loanForm.interestRate = loan.interestRate;
  loanForm.termMonths = loan.termMonths;
  loanForm.startDate = loan.startDate ? loan.startDate.split("T")[0] : "";
  loanForm.gracePeriodMonths = loan.gracePeriodMonths || 0;
  loanForm.status = loan.status;
  loanForm.notes = loan.notes || "";
};

const saveLoan = () => {
  try {
    if (editingLoan.value) {
      financeStore.updateLoan(editingLoan.value.id, { ...loanForm });
    } else {
      financeStore.addLoan({ ...loanForm });
    }
    closeModal();
  } catch (error) {
    console.error("Error saving loan:", error);
    alert("Error saving loan. Please try again.");
  }
};

const deleteLoan = (loanId) => {
  if (confirm("Are you sure you want to delete this loan?")) {
    try {
      financeStore.deleteLoan(loanId);
    } catch (error) {
      console.error("Error deleting loan:", error);
      alert("Error deleting loan. Please try again.");
    }
  }
};

const makePayment = (loan) => {
  selectedLoan.value = loan;
  paymentForm.amount = loan.monthlyPayment || "";
  showPaymentModal.value = true;
};

const processLoanPayment = () => {
  try {
    financeStore.makeLoanPayment(selectedLoan.value.id, {
      amount: Number(paymentForm.amount),
      paymentType: paymentForm.paymentType,
      method: paymentForm.method,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
    });
    closePaymentModal();
    alert("Payment processed successfully!");
  } catch (error) {
    console.error("Error processing payment:", error);
    alert(error.message || "Error processing payment. Please try again.");
  }
};

const viewPaymentSchedule = (loan) => {
  selectedLoan.value = loan;
  showScheduleModal.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isOverdue = (date) => {
  return new Date(date) < new Date();
};

const isUpcoming = (date) => {
  const today = new Date();
  const paymentDate = new Date(date);
  const daysDiff = (paymentDate - today) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7 && daysDiff > 0;
};

const getStatusText = (status) => {
  const statusMap = {
    active: "Active",
    deferred: "Deferred",
    forbearance: "Forbearance",
    paid: "Paid Off",
  };
  return statusMap[status] || status;
};

const getLoanProgress = (loan) => {
  if (!loan.principalAmount || loan.principalAmount === 0) return 0;
  const paidAmount =
    loan.principalAmount - (loan.outstandingBalance || loan.principalAmount);
  return Math.min((paidAmount / loan.principalAmount) * 100, 100);
};

const getRemainingPayments = (loan) => {
  if (!loan || loan.status !== "active") return 0;

  const monthlyPayment = loan.monthlyPayment || 0;
  const outstanding = loan.outstandingBalance || 0;

  if (monthlyPayment <= 0) return 0;

  return Math.ceil(outstanding / monthlyPayment);
};

const getTotalInterest = (loan) => {
  if (!loan) return 0;

  const remainingPayments = getRemainingPayments(loan);
  const totalPayments = remainingPayments * (loan.monthlyPayment || 0);
  const outstanding = loan.outstandingBalance || 0;

  return Math.max(totalPayments - outstanding, 0);
};

const getPaymentSchedule = (loan) => {
  if (!loan || !loan.monthlyPayment) return [];

  const schedule = [];
  let balance = loan.outstandingBalance || loan.principalAmount || 0;
  const monthlyRate = (loan.interestRate || 0) / 100 / 12;
  const payment = loan.monthlyPayment || 0;

  let paymentNumber = 1;
  let currentDate = new Date();

  while (balance > 0.01 && paymentNumber <= 360) {
    // Max 30 years
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(payment - interestPayment, balance);

    balance -= principalPayment;

    schedule.push({
      paymentNumber,
      date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + paymentNumber - 1,
        currentDate.getDate()
      ).toISOString(),
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(balance, 0),
    });

    paymentNumber++;
  }

  return schedule;
};
</script>

<style scoped>
.loan-manager {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.card {
  background: #f8fafc;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: #3b82f6;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.summary-card {
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  border-left: 3px solid #3b82f6;
}

.summary-card.outstanding {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.summary-card.paid {
  border-left-color: #10b981;
  background: #ecfdf5;
}

.summary-card.interest {
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

.payment-progress {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-label {
  font-weight: 600;
  color: #374151;
}

.progress-percentage {
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.alert-section {
  margin-bottom: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.alert-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.alert-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.filter-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.filter-tab {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  background: #f3f4f6;
}

.filter-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.no-loans {
  text-align: center;
  padding: 2rem 1rem;
}

.no-loans-content h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.no-loans-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.loans-grid {
  display: grid;
  gap: 1rem;
}

.loan-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 3px solid #3b82f6;
  transition: all 0.3s ease;
}

.loan-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loan-card.active {
  border-left: 3px solid var(--primary-500);
}

.loan-card.deferred {
  border-left: 3px solid var(--warning-500);
  background: #fffbeb;
}

.loan-card.paid {
  border-left: 3px solid var(--secondary-500);
  background: #ecfdf5;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.loan-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.loan-type {
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.loan-amount {
  text-align: right;
}

.amount {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
}

.status-badge.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.deferred {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.paid {
  background: #dcfce7;
  color: #166534;
}

.loan-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-row .label {
  color: #6b7280;
  font-weight: 500;
}

.detail-row .value {
  color: #1f2937;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
}

.detail-row .value.overdue {
  color: #dc2626;
  font-weight: 600;
}

.detail-row .value.upcoming {
  color: #f59e0b;
  font-weight: 600;
}

.loan-progress {
  margin-bottom: 1rem;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.25rem;
}

.loan-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-payment {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  flex: 1;
  min-width: 80px;
}

.btn-schedule {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  flex: 1;
  min-width: 80px;
}

.btn-edit {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  flex: 1;
  min-width: 60px;
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
  min-width: 60px;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.schedule-modal {
  max-width: 800px;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.payment-summary {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.schedule-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.summary-item {
  text-align: center;
}

.summary-item .label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-item .value {
  font-weight: 600;
  color: #1f2937;
}

.schedule-table {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table-body {
  max-height: 300px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.table-row:last-child {
  border-bottom: none;
}

.schedule-note {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  background: #f8fafc;
}

/* Responsive Design */
@media (max-width: 768px) {
  .loan-manager {
    padding: 1rem;
  }

  .loan-summary {
    grid-template-columns: 1fr 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .loan-header {
    flex-direction: column;
    gap: 1rem;
  }

  .loan-actions {
    justify-content: center;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 80px 80px 80px 80px;
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  .schedule-summary {
    grid-template-columns: 1fr;
  }
}
</style>
