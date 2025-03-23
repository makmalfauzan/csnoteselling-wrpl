document.addEventListener("DOMContentLoaded", async function () {
    const cartContainer = document.getElementById("shopping-cart"); // Tempat menampilkan item cart
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const balanceElement = document.getElementById("saldo");
    const payButton = document.getElementById("pay-button");

    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("User tidak terautentikasi. Silakan login kembali.");
        window.location.href = "login.html";
        return;
    }

    // Ambil saldo pengguna dari backend
    async function fetchUserBalance() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/wallets/${userId}`);
            if (!response.ok) throw new Error("Gagal mengambil saldo");

            const data = await response.json();
            balanceElement.textContent = `Rp ${data.saldo.toLocaleString()}`;
        } catch (error) {
            console.error("Error fetching balance:", error);
            balanceElement.textContent = "Rp 0";
        }
    }

    // Ambil detail materi dari backend berdasarkan ID yang ada di cart
    async function fetchCartMaterials() {
        if (cartItems.length === 0) {
            updatePaymentDetails([]); // Jika keranjang kosong, set semua Rp 0
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
            updatePaymentDetails([]); // Jika error, set semua Rp 0
        }
    }

    // Menampilkan item cart di halaman pembayaran
    function displayCartItems(items) {
        cartContainer.innerHTML = "";

        if (items.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-xl font-semibold">Keranjang kosong</p>
                    <a href="/frontend/pages/dashboard-product.html" class="text-blue-500 hover:underline">
                        Belanja sekarang
                    </a>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            let cartItem = document.createElement("div");
            cartItem.className = "cart-item flex justify-between border-b py-2";
            cartItem.innerHTML = `
                <span>${item.title} (${item.quantity}x)</span>
                <span>Rp ${item.price.toLocaleString()}</span>
            `;
            cartContainer.appendChild(cartItem);
        });
    }

    // Menghitung subtotal, pajak, dan total pembayaran
    function updatePaymentDetails(items) {
        let subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let tax = subtotal * 0.08; // Pajak 8%
        let shipping = 5000; // Ongkos kirim tetap Rp 5.000
        let total = subtotal + tax + shipping;

        subtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
        taxElement.textContent = `Rp ${Math.round(tax).toLocaleString()}`;
        shippingElement.textContent = `Rp ${shipping.toLocaleString()}`;
        totalElement.textContent = `Rp ${Math.round(total).toLocaleString()}`;
    }

    // Fungsi untuk menangani pembayaran
    async function handlePayment() {
        let totalAmount = parseFloat(totalElement.textContent.replace("Rp ", "").replace(/,/g, ""));
        let saldo = parseFloat(balanceElement.textContent.replace("Rp ", "").replace(/,/g, ""));

        if (saldo < totalAmount) {
            alert("Saldo tidak cukup! Silakan tambah saldo.");
            return;
        }

        try {
            let response = await fetch(`http://127.0.0.1:5000/api/transactions/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    total_amount: totalAmount,
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
    await fetchUserBalance();
    await fetchCartMaterials();
});
