document.addEventListener('DOMContentLoaded', function () {
  console.log('Halaman seller dashboard dimuat.');
  fetchSellerSales();
});

document.addEventListener('DOMContentLoaded', () => {
  loadWalletBalance();
});

document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username') || 'User';
    
  // Pilih semua elemen dengan class "username"
  const usernameElements = document.querySelectorAll('.username');

  // Loop semua elemen dan ubah teksnya
  usernameElements.forEach(element => {
    element.textContent = `Halo, ${username}!`;
  });
});

async function loadWalletBalance() {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const response = await fetch(`http://127.0.0.1:5000/api/wallets/${userId}`);
    if (!response.ok) return;

    const data = await response.json();
    const walletContainer = document.querySelector('#wallet-container');
    if (walletContainer) {
      walletContainer.innerHTML = `
                <div class="bg-white p-4 w-full rounded-xl flex flex-col items-center">
                    <p class="text-sm font-medium text-gray-900">Saldo Anda:</p>
                    <p id="wallet-balance" class="text-xl font-bold text-indigo-600">Rp${(data.saldo)}</p>
                    <button id="topup-button" class="ml-4 bg-indigo-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-indigo-700">Withdraw</button>
                </div>`;

      // Menambahkan event listener untuk tombol "Isi Saldo" setelah elemen terbuat
      document.getElementById('topup-button')?.addEventListener('click', () => {
        document.getElementById('topup-modal')?.classList.remove('hidden');
      });
    }
  } catch (error) {
    console.error('Error loading wallet balance:', error);
  }
}

async function fetchSellerProducts() {
  let userId = localStorage.getItem('user_id');

  if (!userId) {
    console.error('User ID tidak ditemukan di localStorage.');
    return;
  }

  try {
    const loadingScreen = document.getElementById('loading-screen');
    // Tampilkan loading
    loadingScreen.style.display = 'flex';
    let response = await fetch(`http://127.0.0.1:5000/api/materials/seller_products/${userId}`);

    if (!response.ok) {
      let errorText = await response.text();
      throw new Error(`Gagal mengambil total produk: ${errorText}`);
    }

    let data = await response.json();
    console.log('Total Products Data:', data); // Debugging untuk melihat hasil API

    // 🔹 Update ke Dashboard
    document.querySelector('#total-products').textContent = data.total_products;
    // Sembunyikan loading setelah data berhasil dimuat
    loadingScreen.style.display = 'none';
  } catch (error) {
    console.error('Error fetching total products:', error);
  }
}

// 🔹 Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchSellerProducts);


let salesData = []; // Menyimpan semua transaksi
let currentPage = 1;
const itemsPerPage = 10;

async function fetchSellerSales() {
  let userId = localStorage.getItem('user_id');

  if (!userId) {
    console.error('User ID tidak ditemukan di localStorage.');
    document.getElementById('seller-sales').innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-600">User ID tidak ditemukan.</td></tr>';
    return;
  }

  try {
    let response = await fetch(`http://127.0.0.1:5000/api/payment/seller_sales/${userId}`);
    if (!response.ok) {
      let errorText = await response.text();
      throw new Error(`Gagal mengambil riwayat penjualan: ${errorText}`);
    }

    salesData = await response.json();
    console.log('Data dari API:', salesData); // 🔹 Debug: Data berhasil diambil

    // 🔹 Hitung Total Sales
    let totalSales = salesData.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    console.log('Total Sales:', totalSales);

    // 🔹 Hitung Total Customers (buyer unik)
    let uniqueBuyers = new Set(salesData.map(sale => sale.buyer_id)).size;
    console.log('Total Customers:', uniqueBuyers);

    // 🔹 Update ke Dashboard
    document.getElementById('total-sales').textContent = formatCurrency(totalSales);
    document.getElementById('total-customers').textContent = uniqueBuyers;

    // 🔹 Render tabel transaksi seller
    renderSalesTable();

  } catch (error) {
    console.error('Error fetching seller sales:', error);
    document.getElementById('seller-sales').innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">${error.message}</td></tr>`;
  }
}

function formatCurrency(value) {
  return 'Rp' + value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderSalesTable() {
  let salesContainer = document.getElementById('seller-sales');
  salesContainer.innerHTML = '';

  if (salesData.length === 0) {
    salesContainer.innerHTML = '<tr><td colspan="6" class="text-center py-4">Belum ada transaksi</td></tr>';
    return;
  }

  let start = (currentPage - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  let paginatedSales = salesData.slice(start, end);

  let fragment = document.createDocumentFragment();

  paginatedSales.forEach(sale => {
    let row = document.createElement('tr');

    let statusClass = sale.payment_status === 'COMPLETED' ? 
      'bg-green-100 text-green-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full' : 
      'bg-yellow-100 text-yellow-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';

    row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.transaction_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.buyer_username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(sale.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(sale.transaction_date).toLocaleString('id-ID')}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${sale.payment_status}</span>
            </td>
        `;

    fragment.appendChild(row);
  });

  salesContainer.appendChild(fragment);
  updatePaginationButtons();
}

function updatePaginationButtons() {
  let totalPages = Math.ceil(salesData.length / itemsPerPage);

  document.getElementById('current-page').textContent = `Halaman ${currentPage} dari ${totalPages}`;
    
  document.getElementById('prev-btn').disabled = currentPage === 1;
  document.getElementById('next-btn').disabled = currentPage === totalPages;
}

document.getElementById('prev-btn').addEventListener('click', function() {
  if (currentPage > 1) {
    currentPage--;
    renderSalesTable();
  }
});

document.getElementById('next-btn').addEventListener('click', function() {
  let totalPages = Math.ceil(salesData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderSalesTable();
  }
});
