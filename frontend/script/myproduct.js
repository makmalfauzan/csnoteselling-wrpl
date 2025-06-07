document.addEventListener('DOMContentLoaded', () => {
  loadWalletBalance();
});

async function loadWalletBalance() {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const response = await fetch(`https://thorough-amazement-production.up.railway.app/api/wallets/${userId}`);
    if (!response.ok) return;

    const data = await response.json();
    const walletContainer = document.querySelector('#wallet-container');
    if (walletContainer) {
      walletContainer.innerHTML = `
                <div class="bg-white p-4 w-full rounded-xl flex flex-col items-center">
                    <p class="text-sm font-medium text-gray-900">Saldo Anda:</p>
                    <p id="wallet-balance" class="text-xl font-bold text-indigo-600">Rp${data.saldo}</p>
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

document.addEventListener('DOMContentLoaded', function () {
  const productList = document.getElementById('product-list');
  const sellerId = localStorage.getItem('user_id'); // Ambil ID seller dari localStorage

  if (!sellerId) {
    console.error('Seller ID tidak ditemukan di localStorage');
    return;
  }

  const loadingScreen = document.getElementById('loading-screen');
  // Tampilkan loading
  loadingScreen.style.display = 'flex';
  fetch(`https://thorough-amazement-production.up.railway.app/api/materials/seller/${sellerId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk');
      }
      return response.json();
    })
    .then((data) => {
      const products = data.products; // Ambil array "products"

      if (!Array.isArray(products)) {
        throw new Error('Data produk tidak dalam format yang benar');
      }

      const productList = document.getElementById('product-list');
      productList.innerHTML = '';

      products.forEach((product) => {
        const row = `
                <tr>
                    <td class="px-6 py-4">${product.title}</td>
                    <td class="px-6 py-4">${product.course_name}</td>
                    <td class="px-6 py-4">${product.category}</td>
                    <td class="px-6 py-4">${product.materi}</td>
                    <td class="px-6 py-4">${product.price}</td>
                    <td class="px-6 py-4">${product.description}</td>
                    <td class="px-6 py-4">${product.uploaded_at}</td>
                </tr>
            `;
        productList.innerHTML += row;
        // Sembunyikan loading setelah data berhasil dimuat
        loadingScreen.style.display = 'none';
      });
    })
    .catch((error) => {
      console.error('Error fetching products:', error);
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const username = localStorage.getItem('username') || 'User';

  // Pilih semua elemen dengan class "username"
  const usernameElements = document.querySelectorAll('.username');

  // Loop semua elemen dan ubah teksnya
  usernameElements.forEach((element) => {
    element.textContent = `Halo, ${username}!`;
  });
});
