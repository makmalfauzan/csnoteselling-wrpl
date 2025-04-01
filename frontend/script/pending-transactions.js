document.addEventListener("DOMContentLoaded", () => {
    loadWalletBalance();
});



// 3. Menampilkan saldo wallet di sidebar
// Fungsi untuk menampilkan saldo di sidebar
async function loadWalletBalance() {
    try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;
        const loadingScreen = document.getElementById("loading-screen");
            // Tampilkan loading
            loadingScreen.style.display = "flex";
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
        // Sembunyikan loading setelah data berhasil dimuat
        loadingScreen.style.display = "none";
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

document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        console.error("User ID not found in localStorage");
        return;
    }

    const apiUrl = `http://127.0.0.1:5000/pending-transactions?user_id=${userId}`;

    fetch(apiUrl)
        .then(response => response.text()) // Ambil response sebagai text terlebih dahulu
        .then(text => {
            try {
                return JSON.parse(text); // Coba parse sebagai JSON
            } catch (error) {
                console.error("Response is not valid JSON:", text);
                throw error;
            }
        })
        .then(transactions => {
            console.log("Data transaksi diterima:", transactions);
            const tableBody = document.getElementById("pending-transactions");
            tableBody.innerHTML = "";

            transactions.forEach(transaction => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.transaction_id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.seller}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${Number(transaction.amount).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(transaction.transaction_date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">${transaction.payment_status}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onclick="payNow(${transaction.material_id})">Pay</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching transactions:", error));
});

function payNow(materialId, transactionId) {
    const userRole = localStorage.getItem("role"); // Cek apakah user sudah login

    if (!userRole) {
        // Jika belum login, munculkan alert dan redirect ke login page
        alert("Anda harus login terlebih dahulu!");
        window.location.href = "login.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Menambahkan material ke cart dengan status PENDING dan transactionId
    const existingItem = cart.find(item => item.id === materialId);

    if (existingItem) {
        alert("Produk ini sudah ada di keranjang Anda!");
    } else {
        cart.push({
            id: materialId, 
            quantity: 1, 
            status: 'PENDING', 
            transactionId: transactionId
        });
        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Produk berhasil ditambahkan ke keranjang dengan status PENDING!");
    }

    window.location.href = "payment.html";
}


