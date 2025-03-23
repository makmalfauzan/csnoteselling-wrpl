document.addEventListener("DOMContentLoaded", async function () {
    const cartContainer = document.getElementById("shopping-cart");
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const balanceElement = document.getElementById("saldo");
    const payButton = document.getElementById("pay-button");

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

        try {
            // **Kirim request pembayaran ke API**
            let response = await fetch(`http://127.0.0.1:5000/api/wallets/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    amount: totalAmount,
                    transaction_id: localStorage.getItem("transaction_id"), // Pastikan transaction_id tersimpan
                })
            });

            let result = await response.json();
            if (response.ok) {
                alert("Pembayaran berhasil! Saldo baru: " + formatCurrency(result.new_balance));
                localStorage.removeItem("cart"); // Kosongkan keranjang setelah checkout
                window.location.href = "./payment.html"; // Redirect ke halaman sukses
            } else {
                alert("Pembayaran gagal: " + result.error);
            }
        } catch (error) {
            console.error("Error during payment:", error);
            alert("Terjadi kesalahan saat pembayaran.");
        }
    }

    payButton.addEventListener("click", handlePayment);
    fetchUserBalance();
    fetchCartMaterials();
});
