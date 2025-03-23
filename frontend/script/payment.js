document.addEventListener("DOMContentLoaded", async function () {
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const balanceElement = document.getElementById("balance");
    const payButton = document.getElementById("pay-button");

    const shippingCost = 4.99; // Ongkos kirim tetap
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let userRole = localStorage.getItem("role") || "BUYER";
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("User tidak terautentikasi. Silakan login kembali.");
        window.location.href = "login.html";
        return;
    }

    async function fetchUserBalance() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}/balance`);
            const data = await response.json();
            return data.balance;
        } catch (error) {
            console.error("Error fetching balance:", error);
            return 0;
        }
    }

    async function fetchCartMaterials() {
        if (cartItems.length === 0) {
            updatePaymentDetails([], 0);
            return;
        }

        try {
            const materialIds = cartItems.map(item => item.id).join(",");
            const response = await fetch(`http://127.0.0.1:5000/api/materials/batch?ids=${materialIds}`);
            const materials = await response.json();

            let updatedCart = cartItems.map(item => {
                let material = materials.find(mat => mat.material_id == item.id);
                return material ? { ...material, quantity: item.quantity } : null;
            }).filter(item => item !== null);

            let userBalance = await fetchUserBalance();
            updatePaymentDetails(updatedCart, userBalance);
        } catch (error) {
            console.error("Error fetching cart details:", error);
        }
    }

    function updatePaymentDetails(items, balance) {
        let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let tax = subtotal * 0.08; // Pajak 8%
        let total = subtotal + tax + shippingCost;

        subtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
        taxElement.textContent = `Rp ${tax.toLocaleString()}`;
        shippingElement.textContent = `Rp ${shippingCost.toLocaleString()}`;
        totalElement.textContent = `Rp ${total.toLocaleString()}`;
        balanceElement.textContent = `Rp ${balance.toLocaleString()}`;

        // Cek apakah saldo cukup untuk membayar
        if (balance < total) {
            payButton.disabled = true;
            payButton.textContent = "Saldo Tidak Cukup";
            payButton.classList.add("cursor-not-allowed", "bg-gray-400");
        } else {
            payButton.disabled = false;
            payButton.textContent = "Bayar Sekarang";
            payButton.classList.remove("cursor-not-allowed", "bg-gray-400");
        }
    }

    async function handlePayment() {
        let subtotal = parseFloat(subtotalElement.textContent.replace("Rp ", "").replace(/,/g, ""));
        let tax = parseFloat(taxElement.textContent.replace("Rp ", "").replace(/,/g, ""));
        let total = parseFloat(totalElement.textContent.replace("Rp ", "").replace(/,/g, ""));

        try {
            let response = await fetch(`http://127.0.0.1:5000/api/transactions/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    total_amount: total,
                    items: cartItems
                })
            });

            let result = await response.json();
            if (result.success) {
                alert("Pembayaran berhasil!");
                localStorage.removeItem("cart"); // Kosongkan keranjang setelah checkout
                window.location.href = "success.html"; // Redirect ke halaman sukses
            } else {
                alert("Pembayaran gagal: " + result.message);
            }
        } catch (error) {
            console.error("Error during payment:", error);
            alert("Terjadi kesalahan saat pembayaran.");
        }
    }

    payButton.addEventListener("click", handlePayment);
    await fetchCartMaterials();
});
