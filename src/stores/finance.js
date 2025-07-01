// src/stores/finance.js
import { defineStore } from 'pinia'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    balance: 0,
    transactions: [],
    savings: {
      totalSaved: 0,
      savingsGoal: 0,
      goals: []
    },
    bills: [],
    budgets: [],
    tuitionFees: [],
    tuitionPayments: [],
    scholarships: [],
    // Add loan management
    loans: [],
    loanPayments: []
  }),

  getters: {
    totalIncome: (state) => {
      return state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    },
    
    totalExpenses: (state) => {
      return state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    },

    savingsProgress: (state) => {
      if (state.savings.savingsGoal === 0) return 0
      return (state.savings.totalSaved / state.savings.savingsGoal) * 100
    },

    upcomingBills: (state) => {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      return state.bills.filter(bill => {
        const dueDate = new Date(bill.nextDueDate)
        return dueDate >= today && dueDate <= nextWeek && !bill.isPaid
      }).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    },

    overdueBills: (state) => {
      const today = new Date()
      return state.bills.filter(bill => {
        const dueDate = new Date(bill.nextDueDate)
        return dueDate < today && !bill.isPaid
      })
    },

    totalMonthlyBills: (state) => {
      return state.bills.reduce((sum, bill) => {
        if (bill.frequency === 'monthly') return sum + bill.amount
        if (bill.frequency === 'weekly') return sum + (bill.amount * 4.33)
        if (bill.frequency === 'yearly') return sum + (bill.amount / 12)
        return sum
      }, 0)
    },

    currentMonthBudgets: (state) => {
      try {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        console.log('=== BUDGET CALCULATION DEBUG ===')
        console.log('Current month:', currentMonth, 'Current year:', currentYear)
        console.log('Total budgets:', state.budgets?.length || 0)
        console.log('Total transactions:', state.transactions?.length || 0)
        
        if (!state.budgets || state.budgets.length === 0) {
          console.log('❌ No budgets found')
          return []
        }

        if (!state.transactions || state.transactions.length === 0) {
          console.log('❌ No transactions found')
          return state.budgets.map(budget => ({
            ...budget,
            spent: 0,
            remaining: budget.amount || 0,
            percentage: 0,
            status: 'good'
          }))
        }

        return state.budgets.map(budget => {
          console.log(`\n--- Processing budget: ${budget.category} (${budget.amount}) ---`)
          
          // Filter transactions for this budget category and current month
          const relevantTransactions = state.transactions.filter(t => {
            try {
              const transactionDate = new Date(t.date)
              const isExpense = t.type === 'expense'
              const sameCategory = t.category === budget.category
              const sameMonth = transactionDate.getMonth() === currentMonth
              const sameYear = transactionDate.getFullYear() === currentYear
              
              const isRelevant = isExpense && sameCategory && sameMonth && sameYear
              
              if (isRelevant) {
                console.log(`✅ Relevant transaction:`, {
                  description: t.description,
                  amount: t.amount,
                  category: t.category,
                  date: t.date,
                  type: t.type
                })
              }
              
              return isRelevant
            } catch (error) {
              console.error('❌ Error processing transaction:', error, t)
              return false
            }
          })
          
          console.log(`Found ${relevantTransactions.length} relevant transactions`)
          
          // Calculate total spent
          const spent = relevantTransactions.reduce((sum, t) => {
            const amount = Number(t.amount) || 0
            console.log(`Adding ${amount} to spent total`)
            return sum + amount
          }, 0)
          
          const budgetAmount = Number(budget.amount) || 0
          const remaining = budgetAmount - spent
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
          
          const result = {
            ...budget,
            spent,
            remaining,
            percentage,
            status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
          }
          
          console.log(`Budget result:`, {
            category: budget.category,
            budgeted: budgetAmount,
            spent: spent,
            remaining: remaining,
            percentage: percentage.toFixed(1) + '%'
          })
          
          return result
        })
      } catch (error) {
        console.error('❌ Error in currentMonthBudgets getter:', error)
        return []
      }
    },

    budgetSummary: (state, getters) => {
      try {
        const budgets = getters.currentMonthBudgets || []
        console.log('\n=== BUDGET SUMMARY CALCULATION ===')
        console.log('Processing budgets:', budgets)
        
        const totalBudgeted = budgets.reduce((sum, b) => {
          const amount = Number(b.amount) || 0
          console.log(`Adding ${amount} to total budgeted`)
          return sum + amount
        }, 0)
        
        const totalSpent = budgets.reduce((sum, b) => {
          const spent = Number(b.spent) || 0
          console.log(`Adding ${spent} to total spent`)
          return sum + spent
        }, 0)
        
        const totalRemaining = totalBudgeted - totalSpent
        
        const summary = {
          totalBudgeted,
          totalSpent,
          totalRemaining,
          overBudget: budgets.filter(b => b.status === 'over').length,
          warningBudgets: budgets.filter(b => b.status === 'warning').length
        }
        
        console.log('Final budget summary:', summary)
        return summary
      } catch (error) {
        console.error('❌ Error in budgetSummary getter:', error)
        return {
          totalBudgeted: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overBudget: 0,
          warningBudgets: 0
        }
      }
    },

    categorySpending: (state) => {
      try {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const spending = {}
        
        ;(state.transactions || [])
          .filter(t => {
            try {
              const transactionDate = new Date(t.date)
              return t.type === 'expense' &&
                     transactionDate.getMonth() === currentMonth &&
                     transactionDate.getFullYear() === currentYear
            } catch (error) {
              console.error('Error processing transaction date:', error)
              return false
            }
          })
          .forEach(t => {
            spending[t.category] = (spending[t.category] || 0) + (t.amount || 0)
          })
        
        return Object.entries(spending)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
      } catch (error) {
        console.error('Error in categorySpending getter:', error)
        return []
      }
    },

    currentSemesterFees: (state) => {
      try {
        const currentYear = new Date().getFullYear()
        return (state.tuitionFees || [])
          .filter(fee => {
            try {
              const feeYear = new Date(fee.dueDate).getFullYear()
              return feeYear >= currentYear
            } catch {
              return true // Include fees with invalid dates
            }
          })
          .map(fee => {
            const totalPaid = (state.tuitionPayments || [])
              .filter(payment => payment.feeId === fee.id)
              .reduce((sum, payment) => sum + (payment.amount || 0), 0)
            
            const remaining = (fee.amount || 0) - totalPaid
            let status = 'pending'
            
            if (totalPaid >= (fee.amount || 0)) {
              status = 'paid'
            } else if (totalPaid > 0) {
              status = 'partial'
            } else if (new Date(fee.dueDate) < new Date()) {
              status = 'overdue'
            }
            
            return {
              ...fee,
              amountPaid: totalPaid,
              remaining,
              status
            }
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      } catch (error) {
        console.error('Error in currentSemesterFees:', error)
        return []
      }
    },

    tuitionSummary: (state, getters) => {
      try {
        const fees = getters.currentSemesterFees || []
        const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0)
        const totalPaid = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0)
        const totalRemaining = totalFees - totalPaid
        const overdueFees = fees.filter(fee => fee.status === 'overdue').length

        return {
          totalFees,
          totalPaid,
          totalRemaining,
          overdueFees
        }
      } catch (error) {
        console.error('Error in tuitionSummary:', error)
        return {
          totalFees: 0,
          totalPaid: 0,
          totalRemaining: 0,
          overdueFees: 0
        }
      }
    },

    upcomingTuitionDeadlines: (state, getters) => {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      return getters.currentSemesterFees.filter(fee => {
        const dueDate = new Date(fee.dueDate)
        return dueDate >= today && dueDate <= nextWeek && fee.status !== 'paid'
      })
    },

    overdueTuitionFees: (state, getters) => {
      return getters.currentSemesterFees.filter(fee => fee.status === 'overdue')
    },

    tuitionPaymentHistory: (state) => {
      return state.tuitionPayments
        .map(payment => {
          const fee = state.tuitionFees.find(f => f.id === payment.feeId)
          return {
            ...payment,
            feeName: fee ? fee.name : 'Unknown Fee'
          }
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },

    scholarshipSummary: (state) => {
      try {
        const scholarships = state.scholarships || []
        const totalAvailable = scholarships
          .filter(s => s.status === 'available')
          .reduce((sum, s) => sum + (s.amount || 0), 0)
        
        const totalReceived = scholarships
          .filter(s => s.status === 'received')
          .reduce((sum, s) => sum + (s.amount || 0), 0)
        
        const appliedCount = scholarships.filter(s => s.status === 'applied').length
        
        const today = new Date()
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const upcomingDeadlines = scholarships.filter(s => {
          if (s.status !== 'available' && s.status !== 'applied') return false
          const deadline = new Date(s.deadline)
          return deadline >= today && deadline <= nextWeek
        }).length

        return {
          totalAvailable,
          totalReceived,
          appliedCount,
          upcomingDeadlines
        }
      } catch (error) {
        console.error('Error in scholarshipSummary:', error)
        return {
          totalAvailable: 0,
          totalReceived: 0,
          appliedCount: 0,
          upcomingDeadlines: 0
        }
      }
    },

    upcomingScholarshipDeadlines: (state) => {
      try {
        const today = new Date()
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        return (state.scholarships || []).filter(scholarship => {
          if (scholarship.status !== 'available' && scholarship.status !== 'applied') return false
          const deadline = new Date(scholarship.deadline)
          return deadline >= today && deadline <= nextWeek
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      } catch (error) {
        console.error('Error in upcomingScholarshipDeadlines:', error)
        return []
      }
    },

    // New getters for loan management
    loanSummary: (state) => {
      try {
        const loans = state.loans || []
        const totalBorrowed = loans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0)
        const totalOutstanding = loans.reduce((sum, loan) => sum + (loan.outstandingBalance || loan.principalAmount || 0), 0)
        const totalPaid = totalBorrowed - totalOutstanding
        
        // Calculate total interest paid
        const totalInterest = (state.loanPayments || [])
          .filter(payment => payment.paymentType !== 'principal')
          .reduce((sum, payment) => sum + (payment.interestAmount || 0), 0)

        return {
          totalBorrowed,
          totalOutstanding,
          totalPaid,
          totalInterest
        }
      } catch (error) {
        console.error('Error in loanSummary:', error)
        return {
          totalBorrowed: 0,
          totalOutstanding: 0,
          totalPaid: 0,
          totalInterest: 0
        }
      }
    },

    upcomingLoanPayments: (state) => {
      try {
        const today = new Date()
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        return (state.loans || [])
          .filter(loan => loan.status === 'active' && loan.nextPaymentDate)
          .filter(loan => {
            const paymentDate = new Date(loan.nextPaymentDate)
            return paymentDate >= today && paymentDate <= nextWeek
          })
          .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))
      } catch (error) {
        console.error('Error in upcomingLoanPayments:', error)
        return []
      }
    },

    overdueLoanPayments: (state) => {
      try {
        const today = new Date()
        
        return (state.loans || [])
          .filter(loan => loan.status === 'active' && loan.nextPaymentDate)
          .filter(loan => new Date(loan.nextPaymentDate) < today)
      } catch (error) {
        console.error('Error in overdueLoanPayments:', error)
        return []
      }
    }
  },

  actions: {
    addTransaction(transaction) {
      console.log('=== ADDING TRANSACTION ===')
      console.log('Input transaction:', transaction)
      
      const newTransaction = {
        id: Date.now(),
        description: String(transaction.description || '').trim(),
        amount: Number(transaction.amount) || 0,
        type: String(transaction.type || 'expense'),
        category: String(transaction.category || ''),
        date: transaction.date || new Date().toISOString()
      }
      
      console.log('Processed transaction:', newTransaction)
      
      // Validate required fields
      if (!newTransaction.description || !newTransaction.category || newTransaction.amount <= 0) {
        console.error('❌ Invalid transaction data:', newTransaction)
        throw new Error('Invalid transaction data')
      }
      
      this.transactions.unshift(newTransaction)
      
      // Update balance
      if (newTransaction.type === 'income') {
        this.balance += newTransaction.amount
        console.log(`💰 Added ${newTransaction.amount} to balance (income)`)
      } else if (newTransaction.type === 'expense') {
        this.balance -= newTransaction.amount
        console.log(`💸 Subtracted ${newTransaction.amount} from balance (expense)`)
      }
      
      console.log('New balance:', this.balance)
      console.log('Total transactions:', this.transactions.length)
      
      // Save to localStorage
      this.saveToLocalStorage()
    },

    deleteTransaction(id) {
      const transaction = this.transactions.find(t => t.id === id)
      if (transaction) {
        // Reverse the balance change
        if (transaction.type === 'income') {
          this.balance -= Number(transaction.amount)
        } else if (transaction.type === 'expense') {
          this.balance += Number(transaction.amount)
        }
        this.transactions = this.transactions.filter(t => t.id !== id)
      }
    },

    addToSavings(amount) {
      const savingsAmount = Number(amount)
      
      if (savingsAmount > this.balance) {
        throw new Error('Insufficient balance')
      }
      
      // Update savings first
      this.savings.totalSaved += savingsAmount
      
      // Then deduct from balance (don't call addTransaction as it would double-deduct)
      this.balance -= savingsAmount
      
      // Add the transaction record (but don't let it affect balance again)
      const savingsTransaction = {
        id: Date.now(),
        type: 'expense',
        category: 'Savings',
        amount: savingsAmount,
        description: 'Transfer to savings',
        date: new Date().toISOString()
      }
      
      this.transactions.unshift(savingsTransaction)
    },

    withdrawFromSavings(amount) {
      const withdrawAmount = Number(amount)
      
      if (withdrawAmount > this.savings.totalSaved) {
        throw new Error('Insufficient savings')
      }
      
      // Update savings first
      this.savings.totalSaved -= withdrawAmount
      
      // Then add to balance
      this.balance += withdrawAmount
      
      // Add the transaction record
      const withdrawalTransaction = {
        id: Date.now(),
        type: 'income',
        category: 'Savings Withdrawal',
        amount: withdrawAmount,
        description: 'Withdrawal from savings',
        date: new Date().toISOString()
      }
      
      this.transactions.unshift(withdrawalTransaction)
    },

    setSavingsGoal(goal) {
      this.savings.savingsGoal = Number(goal)
    },

    addSavingsGoal(goal) {
      const newGoal = {
        id: Date.now(),
        ...goal,
        saved: 0,
        createdAt: new Date().toISOString()
      }
      this.savings.goals.push(newGoal)
    },

    addBill(bill) {
      const newBill = {
        id: Date.now(),
        ...bill,
        amount: Number(bill.amount),
        isPaid: false,
        paymentHistory: [],
        createdAt: new Date().toISOString()
      }
      this.bills.push(newBill)
    },

    updateBill(id, updates) {
      const billIndex = this.bills.findIndex(b => b.id === id)
      if (billIndex !== -1) {
        this.bills[billIndex] = { 
          ...this.bills[billIndex], 
          ...updates,
          amount: Number(updates.amount || this.bills[billIndex].amount)
        }
      }
    },

    deleteBill(id) {
      this.bills = this.bills.filter(b => b.id !== id)
    },

    markBillAsPaid(id) {
      const bill = this.bills.find(b => b.id === id)
      if (bill) {
        // Record payment
        bill.paymentHistory.push({
          date: new Date().toISOString(),
          amount: bill.amount
        })
        
        // Add transaction using the standard method
        this.addTransaction({
          type: 'expense',
          category: 'Bills',
          amount: bill.amount,
          description: `${bill.name} payment`
        })
        
        // Calculate next due date
        const currentDue = new Date(bill.nextDueDate)
        let nextDue = new Date(currentDue)
        
        switch (bill.frequency) {
          case 'weekly':
            nextDue.setDate(currentDue.getDate() + 7)
            break
          case 'monthly':
            nextDue.setMonth(currentDue.getMonth() + 1)
            break
          case 'yearly':
            nextDue.setFullYear(currentDue.getFullYear() + 1)
            break
        }
        
        bill.nextDueDate = nextDue.toISOString()
        bill.isPaid = false // Reset for next cycle
      }
    },

    // Budget Actions
    addBudget(budget) {
      const newBudget = {
        id: Date.now(),
        ...budget,
        amount: Number(budget.amount),
        createdAt: new Date().toISOString()
      }
      this.budgets.push(newBudget)
    },

    updateBudget(id, updates) {
      const budgetIndex = this.budgets.findIndex(b => b.id === id)
      if (budgetIndex !== -1) {
        this.budgets[budgetIndex] = { 
          ...this.budgets[budgetIndex], 
          ...updates,
          amount: Number(updates.amount || this.budgets[budgetIndex].amount)
        }
      }
    },

    deleteBudget(id) {
      this.budgets = this.budgets.filter(b => b.id !== id)
    },

    addTuitionFee(fee) {
      try {
        const newFee = {
          id: Date.now(),
          name: String(fee.name || ''),
          type: String(fee.type || ''),
          amount: Number(fee.amount) || 0,
          dueDate: new Date(fee.dueDate).toISOString(),
          semester: String(fee.semester || ''),
          description: String(fee.description || ''),
          createdAt: new Date().toISOString()
        }
        
        if (!this.tuitionFees) {
          this.tuitionFees = []
        }
        
        this.tuitionFees.push(newFee)
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error adding tuition fee:', error)
        throw new Error('Failed to add tuition fee')
      }
    },

    updateTuitionFee(id, updates) {
      try {
        if (!this.tuitionFees) {
          this.tuitionFees = []
        }
        
        const feeIndex = this.tuitionFees.findIndex(f => f.id === id)
        if (feeIndex !== -1) {
          this.tuitionFees[feeIndex] = {
            ...this.tuitionFees[feeIndex],
            ...updates,
            amount: Number(updates.amount) || 0,
            dueDate: new Date(updates.dueDate).toISOString()
          }
          this.saveToLocalStorage()
        }
      } catch (error) {
        console.error('Error updating tuition fee:', error)
        throw new Error('Failed to update tuition fee')
      }
    },

    deleteTuitionFee(id) {
      try {
        if (!this.tuitionFees) {
          this.tuitionFees = []
        }
        
        this.tuitionFees = this.tuitionFees.filter(f => f.id !== id)
        
        // Also remove related payments
        if (this.tuitionPayments) {
          this.tuitionPayments = this.tuitionPayments.filter(p => p.feeId !== id)
        }
        
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error deleting tuition fee:', error)
        throw new Error('Failed to delete tuition fee')
      }
    },

    makeTuitionPayment(feeId, paymentData) {
      const fee = this.tuitionFees.find(f => f.id === feeId)
      if (!fee) {
        throw new Error('Fee not found')
      }

      const totalPaid = this.tuitionPayments
        .filter(p => p.feeId === feeId)
        .reduce((sum, p) => sum + p.amount, 0)

      const newPaymentAmount = Number(paymentData.amount)
      
      if (totalPaid + newPaymentAmount > fee.amount) {
        throw new Error('Payment amount exceeds remaining balance')
      }

      if (newPaymentAmount > this.balance) {
        throw new Error('Insufficient balance')
      }

      // Create payment record
      const payment = {
        id: Date.now(),
        feeId: feeId,
        amount: newPaymentAmount,
        method: paymentData.method,
        reference: paymentData.reference || '',
        notes: paymentData.notes || '',
        date: new Date().toISOString()
      }

      this.tuitionPayments.push(payment)

      // Update balance
      this.balance -= newPaymentAmount

      // Add transaction record
      this.addTransaction({
        description: `${fee.name} payment`,
        amount: newPaymentAmount,
        type: 'expense',
        category: 'Education',
        date: new Date().toISOString()
      })

      this.saveToLocalStorage()
    },

    addScholarship(scholarship) {
      try {
        const newScholarship = {
          id: Date.now(),
          name: String(scholarship.name || ''),
          type: String(scholarship.type || ''),
          amount: Number(scholarship.amount) || 0,
          provider: String(scholarship.provider || ''),
          deadline: new Date(scholarship.deadline).toISOString(),
          expectedResponse: scholarship.expectedResponse ? new Date(scholarship.expectedResponse).toISOString() : null,
          requirements: String(scholarship.requirements || ''),
          website: String(scholarship.website || ''),
          notes: String(scholarship.notes || ''),
          status: String(scholarship.status || 'available'),
          createdAt: new Date().toISOString()
        }
        
        if (!this.scholarships) {
          this.scholarships = []
        }
        
        this.scholarships.push(newScholarship)
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error adding scholarship:', error)
        throw new Error('Failed to add scholarship')
      }
    },

    updateScholarship(id, updates) {
      try {
        if (!this.scholarships) {
          this.scholarships = []
        }
        
        const scholarshipIndex = this.scholarships.findIndex(s => s.id === id)
        if (scholarshipIndex !== -1) {
          this.scholarships[scholarshipIndex] = {
            ...this.scholarships[scholarshipIndex],
            ...updates,
            amount: Number(updates.amount) || 0,
            deadline: new Date(updates.deadline).toISOString(),
            expectedResponse: updates.expectedResponse ? new Date(updates.expectedResponse).toISOString() : null
          }
          this.saveToLocalStorage()
        }
      } catch (error) {
        console.error('Error updating scholarship:', error)
        throw new Error('Failed to update scholarship')
      }
    },

    updateScholarshipStatus(id, status, additionalData = {}) {
      try {
        if (!this.scholarships) {
          this.scholarships = []
        }
        
        const scholarshipIndex = this.scholarships.findIndex(s => s.id === id)
        if (scholarshipIndex !== -1) {
          this.scholarships[scholarshipIndex] = {
            ...this.scholarships[scholarshipIndex],
            status,
            ...additionalData
          }
          this.saveToLocalStorage()
        }
      } catch (error) {
        console.error('Error updating scholarship status:', error)
        throw new Error('Failed to update scholarship status')
      }
    },

    deleteScholarship(id) {
      try {
        if (!this.scholarships) {
          this.scholarships = []
        }
        
        this.scholarships = this.scholarships.filter(s => s.id !== id)
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error deleting scholarship:', error)
        throw new Error('Failed to delete scholarship')
      }
    },

    // New actions for loan management
    addLoan(loan) {
      try {
        const startDate = new Date(loan.startDate)
        const graceEndDate = new Date(startDate)
        graceEndDate.setMonth(graceEndDate.getMonth() + (loan.gracePeriodMonths || 0))
        
        // Calculate monthly payment using loan formula
        const principal = Number(loan.principalAmount) || 0
        const monthlyRate = (Number(loan.interestRate) || 0) / 100 / 12
        const termMonths = Number(loan.termMonths) || 1
        
        let monthlyPayment = 0
        if (monthlyRate > 0) {
          monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                         (Math.pow(1 + monthlyRate, termMonths) - 1)
        } else {
          monthlyPayment = principal / termMonths
        }
        
        // Calculate next payment date
        const nextPaymentDate = new Date(graceEndDate)
        if (loan.status === 'active') {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
        }
        
        // Calculate estimated payoff date
        const payoffDate = new Date(graceEndDate)
        payoffDate.setMonth(payoffDate.getMonth() + termMonths)
        
        const newLoan = {
          id: Date.now(),
          name: String(loan.name || ''),
          type: String(loan.type || ''),
          lender: String(loan.lender || ''),
          principalAmount: principal,
          outstandingBalance: principal,
          interestRate: Number(loan.interestRate) || 0,
          termMonths: termMonths,
          monthlyPayment: monthlyPayment,
          startDate: new Date(loan.startDate).toISOString(),
          gracePeriodMonths: Number(loan.gracePeriodMonths) || 0,
          nextPaymentDate: loan.status === 'active' ? nextPaymentDate.toISOString() : null,
          estimatedPayoffDate: payoffDate.toISOString(),
          status: String(loan.status || 'active'),
          notes: String(loan.notes || ''),
          createdAt: new Date().toISOString()
        }
        
        if (!this.loans) {
          this.loans = []
        }
        
        this.loans.push(newLoan)
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error adding loan:', error)
        throw new Error('Failed to add loan')
      }
    },

    updateLoan(id, updates) {
      try {
        if (!this.loans) {
          this.loans = []
        }
        
        const loanIndex = this.loans.findIndex(l => l.id === id)
        if (loanIndex !== -1) {
          // Recalculate monthly payment if relevant fields changed
          if (updates.principalAmount || updates.interestRate || updates.termMonths) {
            const principal = Number(updates.principalAmount) || this.loans[loanIndex].principalAmount
            const monthlyRate = (Number(updates.interestRate) || this.loans[loanIndex].interestRate) / 100 / 12
            const termMonths = Number(updates.termMonths) || this.loans[loanIndex].termMonths
            
            let monthlyPayment = 0
            if (monthlyRate > 0) {
              monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                             (Math.pow(1 + monthlyRate, termMonths) - 1)
            } else {
              monthlyPayment = principal / termMonths
            }
            
            updates.monthlyPayment = monthlyPayment
          }
          
          this.loans[loanIndex] = {
            ...this.loans[loanIndex],
            ...updates,
            principalAmount: Number(updates.principalAmount) || this.loans[loanIndex].principalAmount,
            interestRate: Number(updates.interestRate) || this.loans[loanIndex].interestRate,
            termMonths: Number(updates.termMonths) || this.loans[loanIndex].termMonths,
            startDate: updates.startDate ? new Date(updates.startDate).toISOString() : this.loans[loanIndex].startDate
          }
          this.saveToLocalStorage()
        }
      } catch (error) {
        console.error('Error updating loan:', error)
        throw new Error('Failed to update loan')
      }
    },

    deleteLoan(id) {
      try {
        if (!this.loans) {
          this.loans = []
        }
        
        this.loans = this.loans.filter(l => l.id !== id)
        
        // Also remove related payments
        if (this.loanPayments) {
          this.loanPayments = this.loanPayments.filter(p => p.loanId !== id)
        }
        
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error deleting loan:', error)
        throw new Error('Failed to delete loan')
      }
    },

    makeLoanPayment(loanId, paymentData) {
      try {
        const loan = this.loans.find(l => l.id === loanId)
        if (!loan) {
          throw new Error('Loan not found')
        }

        const paymentAmount = Number(paymentData.amount)
        
        if (paymentAmount <= 0) {
          throw new Error('Payment amount must be greater than 0')
        }

        if (paymentAmount > this.balance) {
          throw new Error('Insufficient balance')
        }

        if (paymentAmount > loan.outstandingBalance) {
          throw new Error('Payment amount exceeds outstanding balance')
        }

        // Calculate interest and principal portions
        const monthlyRate = (loan.interestRate || 0) / 100 / 12
        const interestAmount = loan.outstandingBalance * monthlyRate
        
        let principalAmount = paymentAmount - interestAmount
        let adjustedInterestAmount = interestAmount
        
        // If payment is less than interest, it's all interest
        if (paymentAmount < interestAmount) {
          adjustedInterestAmount = paymentAmount
          principalAmount = 0
        }
        
        // If payment type is specified, adjust accordingly
        if (paymentData.paymentType === 'principal') {
          principalAmount = paymentAmount
          adjustedInterestAmount = 0
        } else if (paymentData.paymentType === 'interest') {
          principalAmount = 0
          adjustedInterestAmount = paymentAmount
        }

        // Create payment record
        const payment = {
          id: Date.now(),
          loanId: loanId,
          amount: paymentAmount,
          principalAmount: principalAmount,
          interestAmount: adjustedInterestAmount,
          paymentType: paymentData.paymentType || 'regular',
          method: paymentData.method,
          reference: paymentData.reference || '',
          notes: paymentData.notes || '',
          date: new Date().toISOString()
        }

        if (!this.loanPayments) {
          this.loanPayments = []
        }
        
        this.loanPayments.push(payment)

        // Update loan balance
        loan.outstandingBalance -= principalAmount
        
        // Update loan status if paid off
        if (loan.outstandingBalance <= 0.01) {
          loan.status = 'paid'
          loan.nextPaymentDate = null
          loan.outstandingBalance = 0
        } else {
          // Update next payment date
          const nextDate = new Date(loan.nextPaymentDate || new Date())
          nextDate.setMonth(nextDate.getMonth() + 1)
          loan.nextPaymentDate = nextDate.toISOString()
        }

        // Update balance
        this.balance -= paymentAmount

        // Add transaction record
        this.addTransaction({
          description: `${loan.name} - Loan Payment`,
          amount: paymentAmount,
          type: 'expense',
          category: 'Loan Payment',
          date: new Date().toISOString()
        })

        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error making loan payment:', error)
        throw error
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('financeData', JSON.stringify({
        balance: this.balance,
        transactions: this.transactions,
        savings: this.savings,
        bills: this.bills,
        budgets: this.budgets,
        tuitionFees: this.tuitionFees,
        tuitionPayments: this.tuitionPayments,
        scholarships: this.scholarships,
        loans: this.loans,
        loanPayments: this.loanPayments
      }))
    },

    loadFromLocalStorage() {
      const data = localStorage.getItem('financeData')
      if (data) {
        const parsed = JSON.parse(data)
        this.balance = Number(parsed.balance) || 0
        this.transactions = parsed.transactions || []
        this.savings = parsed.savings || {
          totalSaved: 0,
          savingsGoal: 0,
          goals: []
        }
        this.bills = parsed.bills || []
        this.budgets = parsed.budgets || []
        this.tuitionFees = parsed.tuitionFees || []
        this.tuitionPayments = parsed.tuitionPayments || []
        this.scholarships = parsed.scholarships || []
        this.loans = parsed.loans || []
        this.loanPayments = parsed.loanPayments || []
      }
    }
  }
})