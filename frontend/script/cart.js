document.addEventListener("DOMContentLoaded", async function () {
    const cartContainer = document.getElementById("cart-container");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");
    const clearCartButton = document.getElementById("clear-cart"); // Tombol clear cart

    function formatCurrency(value) {
        return "Rp " + value.toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    

    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    async function fetchCartDetails() {
        const loadingScreen = document.getElementById("loading-screen");
            // Tampilkan loading
            loadingScreen.style.display = "flex";

        if (cartItems.length === 0) {
            updateCartUI([]);
            loadingScreen.style.display = "none"; // Sembunyikan loading saat cart kosong
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

            updateCartUI(updatedCart);
            
        } catch (error) {
            console.error("Error fetching cart details:", error);
            updateCartUI([]);
        } finally {
            // Sembunyikan loading setelah try/catch
            loadingScreen.style.display = "none";
        }
    }

    function updateCartUI(items) {
        cartContainer.innerHTML = "";

        if (items.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-16">
                    <p class="text-2xl font-semibold mb-4">Your cart is empty</p>
                    <p class="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <button id="continue-shopping" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Continue Shopping
                    </button>
                </div>
            `;

            setTimeout(() => {
                const continueShoppingBtn = document.getElementById("continue-shopping");
                if (continueShoppingBtn) {
                    continueShoppingBtn.addEventListener("click", function () {
                        window.location.href = "/frontend/pages/dashboard-product.html";
                    });
                }
            }, 0);
            updateTotals([]);
            return;
        }

        let cartHTML = `
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="grid grid-cols-1 md:grid-cols-12 p-4 text-sm font-medium text-gray-500 border-b">
                    <div class="col-span-6">Product</div>
                    <div class="col-span-2 text-center">Quantity</div>
                    <div class="col-span-2 text-center">Price</div>
                </div>
        `;

        items.forEach((item, index) => {
            cartHTML += `
                <div class="grid grid-cols-1 md:grid-cols-12 p-4 items-center border-b">
                    <div class="md:col-span-6 flex items-center space-x-4">
                        <img src="${item.image || 'https://i.pinimg.com/736x/81/21/dc/8121dc48ec937ecf919bc2c54aa961a4.jpg'}" alt="${item.title}" class="h-20 w-20 rounded border">
                        <div>
                            <h3 class="font-medium">${item.title}</h3>
                            <p class="text-gray-500 text-sm">${item.category}</p>
                            <button class="text-red-500 text-sm hover:text-red-700 remove-btn" data-index="${index}">
                                🗑 Remove
                            </button>
                        </div>
                    </div>
                    <div class="md:col-span-2 flex justify-center">
                        <span class="px-4 py-1">${item.quantity}</span>
                    </div>
                    <div class="md:col-span-2 text-center font-medium">${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `;
        });

        cartHTML += `</div>`;
        cartContainer.innerHTML = cartHTML;

        // Tambahkan event listener untuk remove button
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = this.dataset.index;
                removeItem(index);
            });
        });

        updateTotals(items);
    }

    function updateTotals(items) {
        let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;
        subtotalElement.textContent = formatCurrency(subtotal);
        totalElement.textContent = formatCurrency(total);
    }

    // Fungsi untuk menghapus item dari cart
    function removeItem(index) {
        cartItems.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        fetchCartDetails();
    }

    // Fungsi untuk mengosongkan seluruh cart
    function clearCart() {
        localStorage.removeItem("cart");
        cartItems = [];
        fetchCartDetails();
    }

    // Tambahkan event listener untuk tombol clear cart
    if (clearCartButton) {
        clearCartButton.addEventListener("click", clearCart);
    }

    document.getElementById("checkout").addEventListener("click", function () {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
        } else {
            window.location.href = "/frontend/pages/payment.html";
        }
    });

    fetchCartDetails();
});
