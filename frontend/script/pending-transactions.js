document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username') || 'User';
    
    // Pilih semua elemen dengan class "username"
    const usernameElements = document.querySelectorAll('.username');

    // Loop semua elemen dan ubah teksnya
    usernameElements.forEach(element => {
        element.textContent = `Halo, ${username}!`;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    loadWalletBalance();
    loadPendingTransactions();

    document.getElementById("bayarPendingBtn")?.addEventListener("click", async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) return alert("User ID tidak ditemukan.");
        
        try {
            const response = await fetch("http://127.0.0.1:5000/api/pay_pending_transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId })
            });

            const result = await response.json();
            if (result.success) {
                alert("Semua transaksi berhasil dibayar!");
                window.location.href = "./dashboard-buyer.html#recent-orders";
            } else {
                alert("Gagal bayar: " + result.error);
            }
        } catch (error) {
            console.error("Error bayar semua:", error);
            alert("Terjadi kesalahan saat membayar semua transaksi.");
        }
    });
});

// Load saldo wallet
async function loadWalletBalance() {
    try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        const loadingScreen = document.getElementById("loading-screen");
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

            document.getElementById("topup-button")?.addEventListener("click", () => {
                document.getElementById("topup-modal")?.classList.remove("hidden");
            });
        }

        loadingScreen.style.display = "none";
    } catch (error) {
        console.error("Gagal load wallet:", error);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Load pending transactions
async function loadPendingTransactions() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
        const response = await fetch(`http://127.0.0.1:5000/pending-transactions?user_id=${userId}`);
        const text = await response.text();
        const transactions = JSON.parse(text);

        const tableBody = document.getElementById("pending-transactions");
        tableBody.innerHTML = "";

        transactions.forEach(transaction => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-900">${transaction.transaction_id}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${transaction.title}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${transaction.seller}</td>
                <td class="px-6 py-4 text-sm text-gray-900">Rp ${Number(transaction.amount).toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${new Date(transaction.transaction_date).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-red-500 font-semibold text-sm">${transaction.payment_status}</td>
                <td class="px-6 py-4 text-sm">
                    <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        onclick="payNowSingle(${transaction.transaction_id})">Pay</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Gagal load transaksi:", error);
    }
}

// Fungsi bayar satu transaksi saja
async function payNowSingle(transactionId) {
    const userId = localStorage.getItem("user_id");
    if (!userId) return alert("User ID tidak ditemukan.");

    try {
        const response = await fetch("http://127.0.0.1:5000/api/pay_pending_transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, transaction_id: transactionId }) // Kirim spesifik ID
        });

        const result = await response.json();
        if (result.success) {
            alert("Transaksi berhasil dibayar!");
            loadWalletBalance();
            loadPendingTransactions();
        } else {
            alert("Gagal membayar transaksi: " + result.error);
        }

    } catch (error) {
        console.error("Error saat bayar:", error);
        alert("Terjadi kesalahan saat membayar transaksi.");
    }
}

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