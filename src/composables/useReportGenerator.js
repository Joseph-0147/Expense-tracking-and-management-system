import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export function useReportGenerator() {
  const generateReport = async (config, financeStore) => {
    const data = getReportData(config, financeStore)
    const html = generateReportHTML(data, config)
    
    return {
      data,
      html,
      config
    }
  }

  const getReportData = (config, financeStore) => {
    const dateRange = getDateRange(config.dateRange, config.startDate, config.endDate)
    
    // Filter data based on date range
    const filteredTransactions = financeStore.transactions.filter(t => 
      isDateInRange(new Date(t.date), dateRange.start, dateRange.end)
    )

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const categorizedExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {})

    return {
      dateRange,
      transactions: filteredTransactions,
      summary: {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
      },
      categorizedExpenses,
      budgets: financeStore.budgets,
      bills: financeStore.bills,
      savings: financeStore.savings,
      tuitionFees: financeStore.tuitionFees,
      scholarships: financeStore.scholarships,
      loans: financeStore.loans
    }
  }

  const generateReportHTML = (data, config) => {
    let html = `
      <div class="report-container">
        <div class="report-header">
          <h1>Financial Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Period: ${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}</p>
        </div>
    `

    // Add summary section
    if (config.type === 'summary' || config.type === 'comprehensive') {
      html += `
        <div class="report-section">
          <h2>Financial Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Total Income:</span>
              <span class="value income">Ksh ${data.summary.totalIncome.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Expenses:</span>
              <span class="value expense">Ksh ${data.summary.totalExpenses.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Net Amount:</span>
              <span class="value ${data.summary.netAmount >= 0 ? 'income' : 'expense'}">
                Ksh ${data.summary.netAmount.toFixed(2)}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Savings Rate:</span>
              <span class="value">${data.summary.savingsRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      `
    }

    // Add transactions section
    if (config.type === 'transactions' || config.type === 'comprehensive') {
      html += `
        <div class="report-section">
          <h2>Transactions (${data.transactions.length})</h2>
          <table class="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
      `
      
      data.transactions.forEach(transaction => {
        html += `
          <tr>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}">${transaction.type}</td>
            <td class="${transaction.type}">Ksh ${transaction.amount.toFixed(2)}</td>
          </tr>
        `
      })

      html += `
            </tbody>
          </table>
        </div>
      `
    }

    // Add budget analysis
    if (config.type === 'budget' || config.type === 'comprehensive') {
      html += `
        <div class="report-section">
          <h2>Budget Analysis</h2>
      `
      
      if (data.budgets.length > 0) {
        html += `<table class="report-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>`
        
        data.budgets.forEach(budget => {
          const spent = data.categorizedExpenses[budget.category] || 0
          const remaining = budget.amount - spent
          const status = remaining >= 0 ? 'On Track' : 'Over Budget'
          
          html += `
            <tr>
              <td>${budget.category}</td>
              <td>Ksh ${budget.amount.toFixed(2)}</td>
              <td>Ksh ${spent.toFixed(2)}</td>
              <td class="${remaining >= 0 ? 'income' : 'expense'}">Ksh ${remaining.toFixed(2)}</td>
              <td class="${remaining >= 0 ? 'income' : 'expense'}">${status}</td>
            </tr>
          `
        })
        
        html += `</tbody></table>`
      } else {
        html += '<p>No budgets configured.</p>'
      }
      
      html += '</div>'
    }

    html += `
        <div class="report-footer">
          <p>Generated by Student Finance App</p>
        </div>
      </div>
      
      <style>
        .report-container { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; }
        .report-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb; }
        .report-section { margin-bottom: 2rem; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .summary-item { display: flex; justify-content: space-between; padding: 0.5rem; background: #f9fafb; border-radius: 0.25rem; }
        .report-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        .report-table th, .report-table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .report-table th { background: #f3f4f6; font-weight: bold; }
        .income { color: #059669; }
        .expense { color: #dc2626; }
        .report-footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280; }
      </style>
    `

    return html
  }

  const exportReport = async (reportData, config) => {
    switch (config.format) {
      case 'pdf':
        return exportToPDF(reportData, config)
      case 'excel':
        return exportToExcel(reportData, config)
      case 'csv':
        return exportToCSV(reportData, config)
      case 'json':
        return exportToJSON(reportData, config)
      default:
        throw new Error('Unsupported export format')
    }
  }

  const exportToPDF = (reportData, config) => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Financial Report', 20, 20)
    
    // Add date info
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35)
    doc.text(`Period: ${reportData.data.dateRange.start.toLocaleDateString()} - ${reportData.data.dateRange.end.toLocaleDateString()}`, 20, 45)
    
    let yPosition = 60

    // Add summary
    doc.setFontSize(16)
    doc.text('Summary', 20, yPosition)
    yPosition += 10
    
    const summaryData = [
      ['Total Income', `Ksh ${reportData.data.summary.totalIncome.toFixed(2)}`],
      ['Total Expenses', `Ksh ${reportData.data.summary.totalExpenses.toFixed(2)}`],
      ['Net Amount', `Ksh ${reportData.data.summary.netAmount.toFixed(2)}`],
      ['Savings Rate', `${reportData.data.summary.savingsRate.toFixed(1)}%`]
    ]
    
    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid'
    })

    // Add transactions if included
    if (config.type === 'transactions' || config.type === 'comprehensive') {
      yPosition = doc.lastAutoTable.finalY + 20
      
      doc.setFontSize(16)
      doc.text('Recent Transactions', 20, yPosition)
      yPosition += 10
      
      const transactionData = reportData.data.transactions.slice(0, 20).map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.category,
        t.type,
        `Ksh ${t.amount.toFixed(2)}`
      ])
      
      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: transactionData,
        theme: 'grid'
      })
    }

    // Save the PDF
    const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const exportToExcel = (reportData, config) => {
    const workbook = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Income', reportData.data.summary.totalIncome],
      ['Total Expenses', reportData.data.summary.totalExpenses],
      ['Net Amount', reportData.data.summary.netAmount],
      ['Savings Rate (%)', reportData.data.summary.savingsRate]
    ]
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    // Transactions sheet
    if (reportData.data.transactions.length > 0) {
      const transactionData = [
        ['Date', 'Description', 'Category', 'Type', 'Amount'],
        ...reportData.data.transactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.description,
          t.category,
          t.type,
          t.amount
        ])
      ]
      
      const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData)
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions')
    }
    
    // Export
    const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const exportToCSV = (reportData, config) => {
    let csvContent = 'Date,Description,Category,Type,Amount\n'
    
    reportData.data.transactions.forEach(t => {
      csvContent += `${new Date(t.date).toLocaleDateString()},${t.description},${t.category},${t.type},${t.amount}\n`
    })
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToJSON = (reportData, config) => {
    const jsonData = JSON.stringify(reportData.data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Helper functions
  const getDateRange = (range, startDate, endDate) => {
    const now = new Date()
    let start, end = new Date()

    switch (range) {
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'last-3-months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1)
        break
      case 'custom':
        start = new Date(startDate)
        end = new Date(endDate)
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return { start, end }
  }

  const isDateInRange = (date, start, end) => {
    return date >= start && date <= end
  }

  return {
    generateReport,
    exportReport
  }
}