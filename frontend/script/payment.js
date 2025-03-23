document.addEventListener("DOMContentLoaded", async function () {
    const cartContainer = document.getElementById("shopping-cart");
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const balanceElement = document.getElementById("saldo");
    const payButton = document.getElementById("pay-button");
    const transactionList = document.getElementById("transaction-list"); // Untuk daftar transaksi seller

    function formatCurrency(value) {
        return "Rp" + value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("User tidak terautentikasi. Silakan login kembali.");
        window.location.href = "login.html";
        return;
    }

    async function fetchUserBalance() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/wallets/${userId}`);
            if (!response.ok) throw new Error("Gagal mengambil saldo");

            const data = await response.json();
            balanceElement.textContent = formatCurrency(data.saldo);
        } catch (error) {
            console.error("Error fetching balance:", error);
            balanceElement.textContent = formatCurrency(0);
        }
    }

    async function fetchCartMaterials() {
        if (cartItems.length === 0) {
            updatePaymentDetails([]);
            return;
        }

        try {
            const materialIds = cartItems.map(item => item.id).join(",");
            const response = await fetch(`http://127.0.0.1:5000/api/materials/batch?ids=${materialIds}`);
            if (!response.ok) throw new Error("Gagal mengambil produk");

            const materials = await response.json();
            let updatedCart = cartItems.map(item => {
                let material = materials.find(mat => mat.material_id == item.id);
                return material ? { ...material, quantity: item.quantity } : null;
            }).filter(item => item !== null);

            displayCartItems(updatedCart);
            updatePaymentDetails(updatedCart);
        } catch (error) {
            console.error("Error fetching cart details:", error);
            updatePaymentDetails([]);
        }
    }

    function displayCartItems(items) {
        cartContainer.innerHTML = "";
        items.forEach(item => {
            let cartItem = document.createElement("div");
            cartItem.className = "cart-item flex justify-between border-b py-2";
            cartItem.innerHTML = `
                <span>${item.title} (${item.quantity}x)</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            `;
            cartContainer.appendChild(cartItem);
        });
    }

    function updatePaymentDetails(items) {
        let subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let tax = subtotal * 0.08;
        let shipping = 5000;
        let total = subtotal + tax + shipping;

        subtotalElement.textContent = formatCurrency(subtotal);
        taxElement.textContent = formatCurrency(tax);
        shippingElement.textContent = formatCurrency(shipping);
        totalElement.textContent = formatCurrency(total);
    }

    async function handlePayment() {
        let totalAmount = parseFloat(totalElement.textContent.replace("Rp", "").replace(/\./g, "").replace(",", "."));
        let userBalance = parseFloat(balanceElement.textContent.replace("Rp", "").replace(/\./g, "").replace(",", "."));

        if (userBalance < totalAmount) {
            alert("Saldo tidak cukup! Silakan tambah saldo.");
            return;
        }

        let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        if (cartItems.length === 0) {
            alert("Keranjang belanja kosong!");
            return;
        }

        let formattedCart = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));

        try {
            let response = await fetch("http://127.0.0.1:5000/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    items: formattedCart
                })
            });

            if (!response.ok) {
                let errorText = await response.text();
                throw new Error(`Request gagal dengan status ${response.status}: ${errorText}`);
            }

            let result = await response.json();
            if (result.success) {
                alert("Pembayaran berhasil! Saldo baru: " + formatCurrency(result.new_balance));

                // **Panggil fungsi untuk mengambil transaksi seller**
                fetchSellerTransactions();

                localStorage.removeItem("cart");
                window.location.href = "./dashboard-product.html";
            } else {
                alert("Pembayaran gagal: " + result.error);
            }
        } catch (error) {
            console.error("Error selama pembayaran:", error);
            alert("Terjadi kesalahan saat pembayaran. Periksa konsol untuk detail lebih lanjut.");
        }
    }

    async function fetchSellerTransactions() {
        try {
            let response = await fetch(`http://127.0.0.1:5000/api/seller_transactions/${userId}`);
            if (!response.ok) throw new Error("Gagal mengambil transaksi seller");

            let transactions = await response.json();

            transactionList.innerHTML = "<h3>Transaksi Seller:</h3>";
            transactions.forEach(tx => {
                let item = document.createElement("p");
                item.textContent = `Produk: ${tx.material_id}, Pendapatan: ${formatCurrency(tx.amount)}`;
                transactionList.appendChild(item);
            });

        } catch (error) {
            console.error("Error fetching seller transactions:", error);
        }
    }

    payButton.addEventListener("click", handlePayment);
    fetchUserBalance();
    fetchCartMaterials();
    fetchSellerTransactions(); // Panggil saat halaman dimuat

    /*** ========== PERBAIKAN FITUR ISI SALDO (TOP-UP) ========== ***/
    const topupButton = document.getElementById("topup-button");
    const topupModal = document.getElementById("topup-modal");
    const closeModalButton = document.getElementById("close-modal");
    const confirmTopupButton = document.getElementById("confirm-topup");
    const topupAmountInput = document.getElementById("topup-amount");

    topupButton.addEventListener("click", function () {
        topupModal.classList.remove("hidden");
    });

    closeModalButton.addEventListener("click", function () {
        topupModal.classList.add("hidden");
    });

    async function handleTopup() {
        let topupAmount = parseFloat(topupAmountInput.value);

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

                fetchUserBalance();
                topupModal.classList.add("hidden");
                topupAmountInput.value = "";
            } else {
                alert("Top-up gagal: " + (result.error || "Terjadi kesalahan."));
            }
        } catch (error) {
            console.error("Error during top-up:", error);
            alert("Terjadi kesalahan saat mengisi saldo.");
        }
    }

    confirmTopupButton.addEventListener("click", handleTopup);
});
