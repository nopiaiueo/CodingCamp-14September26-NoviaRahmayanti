// Konfigurasi Limit (Opsional)
const SPENDING_LIMIT = 500000; // Contoh limit Rp 500.000

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

// Init App
function init() {
  renderUI();
  initChart();
}

// Save & Render
function saveAndRender() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderUI();
}

function renderUI() {
  // 1. Render Transaction List
  listContainer.innerHTML = '';
  
  let sortedList = [...transactions];
  const sortVal = sortSelect.value;
  if (sortVal === 'highest') {
    sortedList.sort((a, b) => b.amount - a.amount);
  } else if (sortVal === 'lowest') {
    sortedList.sort((a, b) => a.amount - b.amount);
  } else {
    sortedList.reverse(); // Default: Terbaru
  }

  sortedList.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong> <br>
        <small>${item.category}</small>
      </div>
      <div>
        <span>Rp ${item.amount.toLocaleString('id-ID')}</span>
        <button class="delete-btn" onclick="deleteTransaction(${item.id})">Hapus</button>
      </div>
    `;
    listContainer.appendChild(li);
  });

  // 2. Render Total Balance
  const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  totalBalanceEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;

  // 3. Check Limit Warning (Optional Feature)
  if (total > SPENDING_LIMIT) {
    limitWarningEl.classList.remove('hidden');
  } else {
    limitWarningEl.classList.add('hidden');
  }

  // 4. Update Chart
  updateChart();
}

// Add Transaction
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = itemNameInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!name || !amount || !category) return;

  const newTransaction = {
    id: Date.now(),
    name,
    amount,
    category
  };

  transactions.push(newTransaction);
  saveAndRender();

  // Reset Form
  form.reset();
});

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveAndRender();
}

// Chart.js Setup
function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
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
      totals[t.category] += t.amount;
    }
  });

  chartInstance.data.datasets[0].data = [totals.Food, totals.Transport, totals.Fun];
  chartInstance.update();
}

// Sorting Listener (Optional Feature)
sortSelect.addEventListener('change', renderUI);

// Dark/Light Mode Toggle (Optional Feature)
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Run Init
init();
