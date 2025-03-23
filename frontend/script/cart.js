document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.getElementById("cart-container");
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const totalElement = document.getElementById("total");
    const shippingCost = 4.99; // Ongkos kirim tetap

    // Ambil data keranjang dari localStorage
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartUI() {
        cartContainer.innerHTML = "";
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-16">
                    <p class="text-2xl font-semibold mb-4">Your cart is empty</p>
                    <p class="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <button id="continue-shopping" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Continue Shopping
                    </button>
                </div>
            `;
            
            // Tambahkan event listener setelah elemen dibuat
            setTimeout(() => {
                const continueShoppingBtn = document.getElementById("continue-shopping");
                if (continueShoppingBtn) {
                    continueShoppingBtn.addEventListener("click", function () {
                        window.location.href = "/frontend/pages/dashboard-product.html";
                    });
                }
            }, 0);

            updateTotals();
            return;
        }

        let cartHTML = `
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="grid grid-cols-1 md:grid-cols-12 p-4 text-sm font-medium text-gray-500 border-b">
                    <div class="col-span-6">Product</div>
                    <div class="col-span-2 text-center">Price</div>
                    <div class="col-span-2 text-center">Quantity</div>
                    <div class="col-span-2 text-center">Total</div>
                </div>
        `;

        cartItems.forEach((item, index) => {
            cartHTML += `
                <div class="grid grid-cols-1 md:grid-cols-12 p-4 items-center border-b">
                    <div class="md:col-span-6 flex items-center space-x-4">
                        <img src="${item.image}" alt="${item.name}" class="h-20 w-20 rounded border">
                        <div>
                            <h3 class="font-medium">${item.name}</h3>
                            <button class="text-red-500 text-sm hover:text-red-700" onclick="removeItem(${index})">
                                🗑 Remove
                            </button>
                        </div>
                    </div>
                    <div class="md:col-span-2 text-center">$${item.price.toFixed(2)}</div>
                    <div class="md:col-span-2 flex justify-center">
                        <button class="px-2 py-1 bg-gray-200 rounded" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="px-4 py-1">${item.quantity}</span>
                        <button class="px-2 py-1 bg-gray-200 rounded" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="md:col-span-2 text-center font-medium">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `;
        });

        cartHTML += `</div>`;
        cartContainer.innerHTML = cartHTML;
        updateTotals();
    }

    function updateTotals() {
        let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let tax = subtotal * 0.08; // Pajak 8%
        let total = subtotal + tax + shippingCost;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    function updateQuantity(index, change) {
        if (cartItems[index].quantity + change < 1) return;
        cartItems[index].quantity += change;
        localStorage.setItem("cart", JSON.stringify(cartItems));
        updateCartUI();
    }

    function removeItem(index) {
        cartItems.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        updateCartUI();
    }

    document.getElementById("clear-cart").addEventListener("click", function () {
        localStorage.removeItem("cart");
        cartItems = [];
        updateCartUI();
    });

    document.getElementById("checkout").addEventListener("click", function () {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
        } else {
            alert("Proceeding to checkout...");
            // Redirect ke halaman checkout
            window.location.href = "/frontend/pages/checkout.html";
        }
    });

    updateCartUI();
});
