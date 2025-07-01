<template>
  <div class="scholarship-manager">
    <div class="scholarship-header">
      <h2>🎓 Scholarships & Grants</h2>
      <button @click="showScholarshipModal = true" class="btn-primary">
        Add Scholarship
      </button>
    </div>

    <!-- Scholarship Summary -->
    <div class="scholarship-summary">
      <div class="summary-card total">
        <span class="summary-label">Total Available</span>
        <span class="summary-value">
          Ksh{{ financeStore.scholarshipSummary?.totalAvailable?.toFixed(2) || "0.00" }}
        </span>
      </div>
      <div class="summary-card received">
        <span class="summary-label">Received</span>
        <span class="summary-value">
          Ksh{{ financeStore.scholarshipSummary?.totalReceived?.toFixed(2) || "0.00" }}
        </span>
      </div>
      <div class="summary-card pending">
        <span class="summary-label">Applied</span>
        <span class="summary-value">
          {{ financeStore.scholarshipSummary?.appliedCount || 0 }}
        </span>
      </div>
      <div
        class="summary-card deadlines"
        v-if="financeStore.scholarshipSummary?.upcomingDeadlines > 0"
      >
        <span class="summary-label">Due Soon</span>
        <span class="summary-value">
          {{ financeStore.scholarshipSummary?.upcomingDeadlines || 0 }}
        </span>
      </div>
    </div>

    <!-- Upcoming Deadlines Alert -->
    <div
      class="alert-section"
      v-if="financeStore.upcomingScholarshipDeadlines?.length > 0"
    >
      <div class="alert alert-warning">
        ⏰ {{ financeStore.upcomingScholarshipDeadlines.length }} scholarship deadline(s)
        approaching
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        @click="activeFilter = 'all'"
        :class="{ active: activeFilter === 'all' }"
        class="filter-tab"
      >
        All ({{ filteredScholarships.length }})
      </button>
      <button
        @click="activeFilter = 'available'"
        :class="{ active: activeFilter === 'available' }"
        class="filter-tab"
      >
        Available
      </button>
      <button
        @click="activeFilter = 'applied'"
        :class="{ active: activeFilter === 'applied' }"
        class="filter-tab"
      >
        Applied
      </button>
      <button
        @click="activeFilter = 'received'"
        :class="{ active: activeFilter === 'received' }"
        class="filter-tab"
      >
        Received
      </button>
      <button
        @click="activeFilter = 'rejected'"
        :class="{ active: activeFilter === 'rejected' }"
        class="filter-tab"
      >
        Rejected
      </button>
    </div>

    <!-- No Scholarships State -->
    <div
      v-if="!financeStore.scholarships || financeStore.scholarships.length === 0"
      class="no-scholarships"
    >
      <div class="no-scholarships-content">
        <h3>🎯 No Scholarships Added</h3>
        <p>Track scholarships and grants to maximize your funding opportunities.</p>
        <button @click="showScholarshipModal = true" class="btn-primary">
          Add Your First Scholarship
        </button>
      </div>
    </div>

    <!-- Scholarships Grid -->
    <div class="scholarships-section" v-else>
      <div class="scholarships-grid">
        <div
          v-for="scholarship in filteredScholarships"
          :key="scholarship.id"
          class="scholarship-card"
          :class="scholarship.status"
        >
          <div class="scholarship-header">
            <div class="scholarship-info">
              <h4 class="scholarship-name">{{ scholarship.name }}</h4>
              <span class="scholarship-type">{{ scholarship.type }}</span>
            </div>
            <div class="scholarship-amount">
              <span class="amount"
                >Ksh{{ scholarship.amount?.toFixed(2) || "0.00" }}</span
              >
              <span class="status-badge" :class="scholarship.status">
                {{ getStatusText(scholarship.status) }}
              </span>
            </div>
          </div>

          <div class="scholarship-details">
            <div class="detail-row" v-if="scholarship.provider">
              <span class="label">Provider:</span>
              <span class="value">{{ scholarship.provider }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Deadline:</span>
              <span
                class="value"
                :class="{
                  overdue: isOverdue(scholarship.deadline),
                  upcoming: isUpcoming(scholarship.deadline),
                }"
              >
                {{ formatDate(scholarship.deadline) }}
              </span>
            </div>
            <div class="detail-row" v-if="scholarship.requirements">
              <span class="label">Requirements:</span>
              <span class="value">{{ scholarship.requirements }}</span>
            </div>
            <div class="detail-row" v-if="scholarship.applicationDate">
              <span class="label">Applied:</span>
              <span class="value">{{ formatDate(scholarship.applicationDate) }}</span>
            </div>
            <div class="detail-row" v-if="scholarship.receivedDate">
              <span class="label">Received:</span>
              <span class="value">{{ formatDate(scholarship.receivedDate) }}</span>
            </div>
          </div>

          <div
            class="progress-section"
            v-if="scholarship.status === 'applied' && scholarship.expectedResponse"
          >
            <div class="progress-label">
              Expected Response: {{ formatDate(scholarship.expectedResponse) }}
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${getResponseProgress(scholarship)}%` }"
              ></div>
            </div>
          </div>

          <div class="scholarship-actions">
            <button
              v-if="scholarship.status === 'available'"
              @click="markAsApplied(scholarship)"
              class="btn-apply"
            >
              Mark Applied
            </button>
            <button
              v-if="scholarship.status === 'applied'"
              @click="markAsReceived(scholarship)"
              class="btn-received"
            >
              Mark Received
            </button>
            <button
              v-if="scholarship.status === 'applied'"
              @click="markAsRejected(scholarship)"
              class="btn-rejected"
            >
              Mark Rejected
            </button>
            <button @click="editScholarship(scholarship)" class="btn-edit">Edit</button>
            <button @click="deleteScholarship(scholarship.id)" class="btn-delete">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Scholarship Modal -->
    <div
      v-if="showScholarshipModal || editingScholarship"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            {{ editingScholarship ? "Edit Scholarship" : "Add New Scholarship/Grant" }}
          </h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveScholarship">
            <div class="form-group">
              <label>Scholarship/Grant Name</label>
              <input
                v-model="scholarshipForm.name"
                type="text"
                placeholder="e.g., Merit Scholarship, Research Grant"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Type</label>
                <select v-model="scholarshipForm.type" required>
                  <option value="">Select type</option>
                  <option value="Merit Scholarship">Merit Scholarship</option>
                  <option value="Need-based Grant">Need-based Grant</option>
                  <option value="Research Grant">Research Grant</option>
                  <option value="Athletic Scholarship">Athletic Scholarship</option>
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Minority Scholarship">Minority Scholarship</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="Private Foundation">Private Foundation</option>
                  <option value="Corporate Sponsorship">Corporate Sponsorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Amount (Ksh)</label>
                <input
                  v-model.number="scholarshipForm.amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Provider/Organization</label>
              <input
                v-model="scholarshipForm.provider"
                type="text"
                placeholder="University, Foundation, Company, etc."
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Application Deadline</label>
                <input v-model="scholarshipForm.deadline" type="date" required />
              </div>

              <div
                class="form-group"
                v-if="
                  scholarshipForm.status === 'applied' ||
                  editingScholarship?.status === 'applied'
                "
              >
                <label>Expected Response Date</label>
                <input v-model="scholarshipForm.expectedResponse" type="date" />
              </div>
            </div>

            <div class="form-group">
              <label>Requirements</label>
              <textarea
                v-model="scholarshipForm.requirements"
                placeholder="GPA requirements, essay, recommendations, etc."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Website/Link (Optional)</label>
              <input
                v-model="scholarshipForm.website"
                type="url"
                placeholder="https://example.com/scholarship"
              />
            </div>

            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea
                v-model="scholarshipForm.notes"
                placeholder="Additional notes, application progress, etc."
                rows="2"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-save">
                {{ editingScholarship ? "Update Scholarship" : "Add Scholarship" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useFinanceStore } from "@/stores/finance";

const financeStore = useFinanceStore();

const showScholarshipModal = ref(false);
const editingScholarship = ref(null);
const activeFilter = ref("all");

const scholarshipForm = reactive({
  name: "",
  type: "",
  amount: "",
  provider: "",
  deadline: "",
  expectedResponse: "",
  requirements: "",
  website: "",
  notes: "",
  status: "available",
});

const filteredScholarships = computed(() => {
  if (!financeStore.scholarships) return [];

  if (activeFilter.value === "all") {
    return financeStore.scholarships;
  }

  return financeStore.scholarships.filter((s) => s.status === activeFilter.value);
});

const resetForm = () => {
  scholarshipForm.name = "";
  scholarshipForm.type = "";
  scholarshipForm.amount = "";
  scholarshipForm.provider = "";
  scholarshipForm.deadline = "";
  scholarshipForm.expectedResponse = "";
  scholarshipForm.requirements = "";
  scholarshipForm.website = "";
  scholarshipForm.notes = "";
  scholarshipForm.status = "available";
};

const closeModal = () => {
  showScholarshipModal.value = false;
  editingScholarship.value = null;
  resetForm();
};

const editScholarship = (scholarship) => {
  editingScholarship.value = scholarship;
  scholarshipForm.name = scholarship.name;
  scholarshipForm.type = scholarship.type;
  scholarshipForm.amount = scholarship.amount;
  scholarshipForm.provider = scholarship.provider;
  scholarshipForm.deadline = scholarship.deadline
    ? scholarship.deadline.split("T")[0]
    : "";
  scholarshipForm.expectedResponse = scholarship.expectedResponse
    ? scholarship.expectedResponse.split("T")[0]
    : "";
  scholarshipForm.requirements = scholarship.requirements || "";
  scholarshipForm.website = scholarship.website || "";
  scholarshipForm.notes = scholarship.notes || "";
  scholarshipForm.status = scholarship.status;
};

const saveScholarship = () => {
  try {
    if (editingScholarship.value) {
      financeStore.updateScholarship(editingScholarship.value.id, { ...scholarshipForm });
    } else {
      financeStore.addScholarship({ ...scholarshipForm });
    }
    closeModal();
  } catch (error) {
    console.error("Error saving scholarship:", error);
    alert("Error saving scholarship. Please try again.");
  }
};

const deleteScholarship = (scholarshipId) => {
  if (confirm("Are you sure you want to delete this scholarship?")) {
    try {
      financeStore.deleteScholarship(scholarshipId);
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      alert("Error deleting scholarship. Please try again.");
    }
  }
};

const markAsApplied = (scholarship) => {
  try {
    financeStore.updateScholarshipStatus(scholarship.id, "applied", {
      applicationDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating scholarship status:", error);
    alert("Error updating scholarship status. Please try again.");
  }
};

const markAsReceived = (scholarship) => {
  try {
    financeStore.updateScholarshipStatus(scholarship.id, "received", {
      receivedDate: new Date().toISOString(),
    });

    // Add as income transaction
    financeStore.addTransaction({
      description: `${scholarship.name} - Scholarship Received`,
      amount: scholarship.amount,
      type: "income",
      category: "Scholarship",
      date: new Date().toISOString(),
    });

    alert("Scholarship marked as received and added to your income!");
  } catch (error) {
    console.error("Error updating scholarship status:", error);
    alert("Error updating scholarship status. Please try again.");
  }
};

const markAsRejected = (scholarship) => {
  if (confirm("Mark this scholarship as rejected?")) {
    try {
      financeStore.updateScholarshipStatus(scholarship.id, "rejected", {
        rejectedDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating scholarship status:", error);
      alert("Error updating scholarship status. Please try again.");
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

const isUpcoming = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysDiff = (deadlineDate - today) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7 && daysDiff > 0;
};

const getStatusText = (status) => {
  const statusMap = {
    available: "Available",
    applied: "Applied",
    received: "Received",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
};

const getResponseProgress = (scholarship) => {
  if (!scholarship.expectedResponse || !scholarship.applicationDate) return 0;

  const applicationDate = new Date(scholarship.applicationDate);
  const expectedDate = new Date(scholarship.expectedResponse);
  const today = new Date();

  const totalDays = (expectedDate - applicationDate) / (1000 * 60 * 60 * 24);
  const passedDays = (today - applicationDate) / (1000 * 60 * 60 * 24);

  return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
};
</script>

<style scoped>
.scholarship-manager {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.scholarship-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.scholarship-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.scholarship-summary {
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
  border-left: 3px solid #10b981;
}

.summary-card.received {
  border-left-color: #059669;
  background: #ecfdf5;
}

.summary-card.pending {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.summary-card.deadlines {
  border-left-color: #ef4444;
  background: #fef2f2;
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

.alert-section {
  margin-bottom: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.alert-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fbbf24;
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
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.no-scholarships {
  text-align: center;
  padding: 2rem 1rem;
}

.no-scholarships-content h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.no-scholarships-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.scholarships-grid {
  display: grid;
  gap: 1rem;
}

.scholarship-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 3px solid #10b981;
  transition: all 0.3s ease;
}

.scholarship-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.scholarship-card.applied {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.scholarship-card.received {
  border-left-color: #059669;
  background: #ecfdf5;
}

.scholarship-card.rejected {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.scholarship-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.scholarship-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.scholarship-type {
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.scholarship-amount {
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

.status-badge.available {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.applied {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.received {
  background: #dcfce7;
  color: #166534;
}

.status-badge.rejected {
  background: #fecaca;
  color: #dc2626;
}

.scholarship-details {
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

.progress-section {
  margin-bottom: 1rem;
}

.progress-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.scholarship-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-apply {
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

.btn-received {
  background: #059669;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  flex: 1;
  min-width: 80px;
}

.btn-rejected {
  background: #ef4444;
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
  background: #6366f1;
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
  background: #dc2626;
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
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .scholarship-manager {
    padding: 1rem;
  }

  .scholarship-summary {
    grid-template-columns: 1fr 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .scholarship-header {
    flex-direction: column;
    gap: 1rem;
  }

  .scholarship-actions {
    justify-content: center;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }
}
</style>
