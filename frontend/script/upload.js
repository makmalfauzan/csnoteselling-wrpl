document.addEventListener('DOMContentLoaded', () => {
  loadWalletBalance();
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

// Fungsi format saldo ke format Rp xxx.xxx,xx
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username') || 'User';
    
  // Pilih semua elemen dengan class "username"
  const usernameElements = document.querySelectorAll('.username');

  // Loop semua elemen dan ubah teksnya
  usernameElements.forEach(element => {
    element.textContent = `Halo, ${username}!`;
  });
});
document.addEventListener('DOMContentLoaded', function () {
  const materialForm = document.getElementById('materialForm');
  const courseDropdown = document.getElementById('course_id');
  const fileInput = document.getElementById('file');

  // Fungsi untuk mengambil daftar mata kuliah dari API
  async function fetchCourses() {
    try {
      const loadingScreen = document.getElementById('loading-screen');
      // Tampilkan loading
      loadingScreen.style.display = 'flex';
      const response = await fetch('http://127.0.0.1:5000/api/courses');
      const courses = await response.json();

      courseDropdown.innerHTML = '<option value="">Pilih Mata Kuliah</option>';
      courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.course_id;
        option.textContent = course.course_name;
        courseDropdown.appendChild(option);
        // Sembunyikan loading setelah data berhasil dimuat
        loadingScreen.style.display = 'none';
      });
    } catch (error) {
      console.error('Gagal mengambil daftar mata kuliah:', error);
    }
  }

  // Panggil fungsi untuk mengisi dropdown course saat halaman dimuat
  fetchCourses();

  // Event Listener saat form dikirim
  materialForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('seller_id', localStorage.getItem('user_id'));  // Ambil ID seller dari localStorage
    formData.append('title', document.getElementById('title').value);
    formData.append('course_id', courseDropdown.value);
    formData.append('material', document.getElementById('material').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      formData.append('filename', file.name);
      formData.append('file_size', file.size);
    } else {
      alert('Silakan pilih file untuk diupload!');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/uploadfile/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        alert('File berhasil diunggah!');
        materialForm.reset();
      } else {
        alert('Gagal mengupload: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Terjadi kesalahan saat mengupload file.');
    }
  });
});
