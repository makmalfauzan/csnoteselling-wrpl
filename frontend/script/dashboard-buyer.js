document.addEventListener("DOMContentLoaded", () => {
    loadRecommended();
    loadWalletBalance();
});


// 1. Menampilkan rekomendasi produk
async function loadRecommended() {
    try {
        const loadingScreen = document.getElementById("loading-screen");
        // Tampilkan loading
        loadingScreen.style.display = "flex";
        const response = await fetch('http://127.0.0.1:5000/api/dbuyerrecommend/recommended');
        if (!response.ok) {
            throw new Error("Gagal mengambil data rekomendasi.");
        }
        const data = await response.json();
        const container = document.getElementById('recommended-container');

        if (!container) {
            console.error("Elemen container tidak ditemukan.");
            return;
        }

        container.innerHTML = ''; // Bersihkan container sebelum menambahkan elemen baru

        data.forEach(product => {
            const productCard = document.createElement("a");
            productCard.href = `./product-detail.html?id=${product.material_id}`;
            productCard.className = "bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col text-center border border-gray-200 w-full max-w-xs";

            const imageUrl = product.image || "https://i.pinimg.com/736x/81/21/dc/8121dc48ec937ecf919bc2c54aa961a4.jpg";

            productCard.innerHTML = `
                <img src="${imageUrl}" 
                     alt="${product.title}" 
                     class="w-40 h-40 object-cover rounded-md mb-4 shadow-sm border border-gray-300 mx-auto">

                <h3 class="text-lg font-bold text-gray-800">${product.title}</h3>
                <p class="text-sm text-gray-500 font-medium mt-1">${product.category || "Kategori tidak tersedia"}</p>
                <p class="text-xs text-gray-700 font-medium mt-1 italic">Dijual oleh: <span class="text-blue-600 font-semibold">${product.seller_username || "Unknown Seller"}</span></p>
                <p class="text-sm text-gray-600 mt-2 px-4 text-justify line-clamp-3">
                    ${product.description || "Deskripsi tidak tersedia"}
                </p>
                <p class="text-xl font-semibold text-blue-600 mt-auto mb-4">Rp${formatCurrency(product.price)}</p>
                
                <a href="./product-detail.html?id=${product.material_id}">
                    <button class="w-full bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition shadow-md flex items-center justify-center space-x-2">
                        <span>🛒</span>
                        <span>Beli Sekarang</span>
                    </button>
                </a>
            `;

            container.appendChild(productCard);
            // Sembunyikan loading setelah data berhasil dimuat
                loadingScreen.style.display = "none";
        });

    } catch (error) {
        console.error('Error fetching recommended products:', error);
    }
}

// Fungsi format harga ke dalam format Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2
    }).format(amount);
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadRecommended);


document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username') || 'User';
    
    // Pilih semua elemen dengan class "username"
    const usernameElements = document.querySelectorAll('.username');

    // Loop semua elemen dan ubah teksnya
    usernameElements.forEach(element => {
        element.textContent = `Halo, ${username}!`;
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const shopNowButton = document.getElementById("shop-now");

    if (shopNowButton) {
        shopNowButton.addEventListener("click", function(event) {
            event.preventDefault(); // Mencegah navigasi langsung
            
            // Menampilkan pop-up
            alert("Event belum tersedia");
            
            // Redirect setelah pop-up ditutup
            window.location.href = "dashboard-product.html";
        });
    }
});



// Fitur quick stats
async function updateQuickStats() {
    try {
        // Ambil buyer_id dari localStorage
        const buyerId = localStorage.getItem("user_id");
        if (!buyerId) {
            console.error("Buyer ID tidak ditemukan di localStorage.");
            return;
        }

        // Fetch data dari API Recent Orders
        const response = await fetch(`http://127.0.0.1:5000/api/payment/buyer_orders/${buyerId}`);
        if (!response.ok) {
            throw new Error("Gagal mengambil data recent orders.");
        }
        const recentOrders = await response.json();
        document.getElementById("recent-orders-count").textContent = recentOrders.length;

        // Ambil data cart dari localStorage
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        document.getElementById("wishlist-count").textContent = cart.length;

    } catch (error) {
        console.error("Error updating quick stats:", error);
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", updateQuickStats);

document.addEventListener("DOMContentLoaded", function () {
    updateWishlistCount();
});


// 🔹 Update Wishlist Count dari Local Storage
function updateWishlistCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("wishlist-count").textContent = cart.length;
}


// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", updateQuickStats);


// 3. Menampilkan saldo wallet di sidebar
// Fungsi untuk menampilkan saldo di sidebar
async function loadWalletBalance() {
    try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        const response = await fetch(`http://127.0.0.1:5000/api/wallets/${userId}`);
        if (!response.ok) return;

        const data = await response.json();
        const walletContainer = document.querySelector("#wallet-container");
        if (walletContainer) {
            walletContainer.innerHTML = `
                <div class="bg-white p-4 w-full rounded-xl flex flex-col items-center">
                    <p class="text-sm font-medium text-gray-900">Saldo Anda:</p>
                    <p id="wallet-balance" class="text-xl font-bold text-indigo-600">Rp${formatCurrency(data.saldo)}</p>
                    <button id="topup-button" class="ml-4 bg-indigo-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-indigo-700">Isi Saldo</button>
                </div>`;

            // Menambahkan event listener untuk tombol "Isi Saldo" setelah elemen terbuat
            document.getElementById("topup-button")?.addEventListener("click", () => {
                document.getElementById("topup-modal")?.classList.remove("hidden");
            });
        }
    } catch (error) {
        console.error("Error loading wallet balance:", error);
    }
}

// Fungsi format saldo ke format Rp xxx.xxx,xx
function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// 4. Pencarian kursus
async function searchCourses(query) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/courses?q=${encodeURIComponent(query)}`);
        const courses = await response.json();
        console.log(courses);
    } catch (error) {
        console.error('Error searching courses:', error);
    }
}

document.getElementById('search-input')?.addEventListener('input', (e) => {
    searchCourses(e.target.value);
});

// 5. Sidebar toggle untuk mobile
const sidebar = document.querySelector(".sidebar");
document.querySelector(".fa-bars")?.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
});

// 6. Event listener untuk tombol top-up saldo
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("topup-button")?.addEventListener("click", () => {
        document.getElementById("topup-modal").classList.remove("hidden");
    });

    document.getElementById("close-modal")?.addEventListener("click", () => {
        document.getElementById("topup-modal").classList.add("hidden");
    });

    document.getElementById("confirm-topup")?.addEventListener("click", async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            alert("User ID tidak ditemukan. Silakan login ulang.");
            return;
        }

        let topupAmount = parseFloat(document.getElementById("topup-amount").value);
        if (isNaN(topupAmount) || topupAmount <= 0) {
            alert("Masukkan jumlah saldo yang valid!");
            return;
        }

        try {
            let response = await fetch("http://127.0.0.1:5000/api/wallets/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, amount: topupAmount })
            });
            let result = await response.json();
            if (response.ok && result.success) {
                alert("Saldo berhasil ditambahkan!");
                loadWalletBalance();
                document.getElementById("topup-modal").classList.add("hidden");
            } else {
                alert("Top-up gagal: " + (result.error || "Terjadi kesalahan."));
            }
        } catch (error) {
            console.error("Error during top-up:", error);
            alert("Terjadi kesalahan saat mengisi saldo.");
        }
    });
});

let ordersData = []; // Menyimpan semua transaksi
let currentPage = 1;
const itemsPerPage = 10;

async function fetchBuyerOrders() {
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        console.error("User ID tidak ditemukan di localStorage.");
        document.getElementById("buyer-orders").innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">User ID tidak ditemukan.</td></tr>`;
        return;
    }

    try {
        let response = await fetch(`http://127.0.0.1:5000/api/payment/buyer_orders/${userId}`);
        if (!response.ok) {
            let errorText = await response.text();
            throw new Error(`Gagal mengambil riwayat pembelian: ${errorText}`);
        }

        ordersData = await response.json();
        currentPage = 1; // Reset ke halaman pertama setiap fetch data baru
        renderOrdersTable(); // Panggil fungsi render

    } catch (error) {
        console.error("Error fetching buyer orders:", error);
        document.getElementById("buyer-orders").innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">${error.message}</td></tr>`;
    }
}

function renderOrdersTable() {
    let ordersContainer = document.getElementById("buyer-orders");
    ordersContainer.innerHTML = "";

    if (ordersData.length === 0) {
        ordersContainer.innerHTML = `<tr><td colspan="6" class="text-center py-4">Belum ada transaksi</td></tr>`;
        return;
    }

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedOrders = ordersData.slice(start, end);

    let fragment = document.createDocumentFragment();

    paginatedOrders.forEach(order => {
        let row = document.createElement("tr");

        let statusClass = order.payment_status === "COMPLETED" ? 
            "bg-green-100 text-green-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full" : 
            "bg-yellow-100 text-yellow-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full";

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.transaction_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.seller_username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(order.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(order.transaction_date).toLocaleString("id-ID")}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${order.payment_status}</span>
            </td>
        `;

        fragment.appendChild(row);
    });

    ordersContainer.appendChild(fragment);
    updatePaginationButtons();
}

function updatePaginationButtons() {
    let totalPages = Math.ceil(ordersData.length / itemsPerPage);

    document.getElementById("current-page").textContent = `Halaman ${currentPage} dari ${totalPages}`;
    
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = currentPage === totalPages;
}

document.getElementById("prev-btn").addEventListener("click", function() {
    if (currentPage > 1) {
        currentPage--;
        renderOrdersTable();
    }
});

document.getElementById("next-btn").addEventListener("click", function() {
    let totalPages = Math.ceil(ordersData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderOrdersTable();
    }
});

document.addEventListener("DOMContentLoaded", fetchBuyerOrders);
