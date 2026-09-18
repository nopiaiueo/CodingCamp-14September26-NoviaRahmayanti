// Budget Limit Configuration
const SPENDING_LIMIT = 500; 

// DOM Elements
const form = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const listContainer = document.getElementById('transactionList');
const totalBalanceEl = document.getElementById('totalBalance');
const limitWarningEl = document.getElementById('limitWarning');
const sortSelect = document.getElementById('sortSelect');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// State Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

// Format Currency Strictly to USD ($)
function formatUSD(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// Initialize Application
function init() {
  renderUI();
  initChart();
}

// Save to LocalStorage & Render
function saveAndRender() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderUI();
}

function renderUI() {
  // 1. Render Transaction List
  listContainer.innerHTML = '';
  
  let sortedList = [...transactions];
  const sortVal = sortSelect ? sortSelect.value : 'newest';
  if (sortVal === 'highest') {
    sortedList.sort((a, b) => b.amount - a.amount);
  } else if (sortVal === 'lowest') {
    sortedList.sort((a, b) => a.amount - b.amount);
  } else {
    sortedList.reverse();
  }

  sortedList.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `<strong>${item.name}</strong><br><small>${item.category}</small>`;
    
    const actionDiv = document.createElement('div');
    const amountSpan = document.createElement('span');
    amountSpan.textContent = formatUSD(item.amount); // KUNCI UTAMA SIMBOL $
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTransaction(item.id));
    
    actionDiv.appendChild(amountSpan);
    actionDiv.appendChild(deleteBtn);
    
    li.appendChild(detailsDiv);
    li.appendChild(actionDiv);
    
    listContainer.appendChild(li);
  });

  // 2. Render Total Expenses
  const total = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  totalBalanceEl.textContent = formatUSD(total); // KUNCI UTAMA SIMBOL $

  // 3. Check Limit Warning
  if (limitWarningEl) {
    if (total > SPENDING_LIMIT) {
      limitWarningEl.classList.remove('hidden');
    } else {
      limitWarningEl.classList.add('hidden');
    }
  }

  // 4. Update Chart
  updateChart();
}

// Add Transaction Event
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = itemNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || isNaN(amount) || amount <= 0 || !category) return;

  const newTransaction = {
    id: Date.now(),
    name,
    amount,
    category
  };

  transactions.push(newTransaction);
  saveAndRender();

  form.reset();
});

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveAndRender();
}

// Chart.js Setup
function initChart() {
  const chartCanvas = document.getElementById('expenseChart');
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Food', 'Transport', 'Fun'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true
    }
  });
  updateChart();
}

function updateChart() {
  if (!chartInstance) return;

  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(t => {
    if (totals[t.category] !== undefined) {
      totals[t.category] += Number(t.amount);
    }
  });

  chartInstance.data.datasets[0].data = [totals.Food, totals.Transport, totals.Fun];
  chartInstance.update();
}

if (sortSelect) {
  sortSelect.addEventListener('change', renderUI);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  });
}

init();
