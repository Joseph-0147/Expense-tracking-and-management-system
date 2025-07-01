<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">
        <i class="fas fa-chart-bar text-blue-500 mr-2"></i>
        Generate Financial Reports
      </h3>
    </div>

    <div class="card-body">
      <!-- Report Configuration -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <!-- Report Type -->
        <div>
          <label class="form-label">Report Type</label>
          <select v-model="reportConfig.type" class="form-input">
            <option value="summary">Financial Summary</option>
            <option value="transactions">Transaction Report</option>
            <option value="budget">Budget Analysis</option>
            <option value="savings">Savings Report</option>
            <option value="bills">Bills & Payments</option>
            <option value="comprehensive">Comprehensive Report</option>
          </select>
        </div>

        <!-- Date Range -->
        <div>
          <label class="form-label">Date Range</label>
          <select v-model="reportConfig.dateRange" class="form-input">
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <!-- Export Format -->
        <div>
          <label class="form-label">Export Format</label>
          <select v-model="reportConfig.format" class="form-input">
            <option value="pdf">PDF</option>
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      <!-- Custom Date Range (shown when custom is selected) -->
      <div v-if="reportConfig.dateRange === 'custom'" class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="form-label">Start Date</label>
          <input type="date" v-model="reportConfig.startDate" class="form-input" />
        </div>
        <div>
          <label class="form-label">End Date</label>
          <input type="date" v-model="reportConfig.endDate" class="form-input" />
        </div>
      </div>

      <!-- Report Options -->
      <div class="mb-6">
        <label class="form-label">Include in Report</label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="reportConfig.includeCharts"
              class="checkbox"
            />
            Charts & Graphs
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="reportConfig.includeInsights"
              class="checkbox"
            />
            Financial Insights
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="reportConfig.includeGoals" class="checkbox" />
            Goals & Targets
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3">
        <button
          @click="generatePreview"
          class="btn btn-secondary"
          :disabled="isGenerating"
        >
          <i class="fas fa-eye mr-2"></i>
          Preview Report
        </button>
        <button
          @click="generateAndDownload"
          class="btn btn-primary"
          :disabled="isGenerating"
        >
          <i class="fas fa-download mr-2"></i>
          {{ isGenerating ? "Generating..." : "Generate & Download" }}
        </button>
        <button @click="scheduleReport" class="btn btn-ghost">
          <i class="fas fa-clock mr-2"></i>
          Schedule Report
        </button>
      </div>
    </div>

    <!-- Report Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreview">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Report Preview</h3>
          <button @click="closePreview" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-html="reportPreview"></div>
        </div>
        <div class="modal-footer">
          <button @click="closePreview" class="btn btn-secondary">Close</button>
          <button @click="generateAndDownload" class="btn btn-primary">
            Download Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { useReportGenerator } from "@/composables/useReportGenerator";

const financeStore = useFinanceStore();
const { generateReport, exportReport } = useReportGenerator();

const reportConfig = ref({
  type: "summary",
  dateRange: "this-month",
  format: "pdf",
  startDate: "",
  endDate: "",
  includeCharts: true,
  includeInsights: true,
  includeGoals: false,
});

const isGenerating = ref(false);
const showPreview = ref(false);
const reportPreview = ref("");

const generatePreview = async () => {
  try {
    isGenerating.value = true;
    const reportData = await generateReport(reportConfig.value, financeStore);
    reportPreview.value = reportData.html;
    showPreview.value = true;
  } catch (error) {
    console.error("Error generating preview:", error);
    // Show error notification
  } finally {
    isGenerating.value = false;
  }
};

const generateAndDownload = async () => {
  try {
    isGenerating.value = true;
    const reportData = await generateReport(reportConfig.value, financeStore);
    await exportReport(reportData, reportConfig.value);
  } catch (error) {
    console.error("Error generating report:", error);
    // Show error notification
  } finally {
    isGenerating.value = false;
  }
};

const closePreview = () => {
  showPreview.value = false;
  reportPreview.value = "";
};

const scheduleReport = () => {
  // Implement scheduled report functionality
  console.log("Schedule report functionality");
};
</script>

<style scoped>
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox {
  width: 1rem;
  height: 1rem;
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
  border-radius: 0.5rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
}

.btn-close:hover {
  color: #374151;
}
</style>
