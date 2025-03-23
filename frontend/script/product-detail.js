document.addEventListener("DOMContentLoaded", async function () {
    // Pastikan elemen-elemen HTML sudah ada
    const productName = document.querySelector("#product-name");
    const productPrice = document.querySelector("#product-price");
    const productDescription = document.querySelector("#product-description");
    const productSeller = document.querySelector("#product-seller");
    const addToCartButton = document.querySelector("#add-to-cart");

    // Periksa apakah elemen-elemen HTML ditemukan
    if (!productName || !productPrice || !productDescription || !productSeller) {
        console.error("Error: Beberapa elemen tidak ditemukan di halaman.");
        return;
    }

    // Fungsi untuk mengambil ID produk dari URL
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    // Fungsi untuk mengambil data produk dari API Flask
    async function fetchProductDetail(productId) {
        try {
            console.log("Fetching product ID:", productId);

            const response = await fetch(`http://127.0.0.1:5000/api/materials/${productId}`);
            const data = await response.json();
            console.log("API Data:", data);

            if (!response.ok || data.error) {
                throw new Error(data.error || "Produk tidak ditemukan");
            }

            // Menampilkan data produk di halaman
            productName.textContent = data.title;
            productPrice.textContent = `Rp ${parseFloat(data.price).toLocaleString("id-ID")}`;
            productDescription.textContent = data.description;
            productSeller.innerHTML = `By <a href="#" class="text-blue-500 hover:underline">${data.seller}</a>`;

        } catch (error) {
            console.error("Error fetching product:", error);
            alert("Produk tidak ditemukan!");
            window.location.href = "/frontend/Pages/dashboard-product.html";
        }
    }

    // Fungsi untuk menangani klik tombol "Add to Cart"
    function handleAddToCart(productId) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            alert("Produk ini sudah ada di keranjang Anda!");
        } else {
            cart.push({ id: productId, quantity: 1 });
            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Produk berhasil ditambahkan ke keranjang!");
        }
    }

    // Ambil ID produk dari URL dan muat detail produk
    const productId = getProductIdFromURL();
    if (productId) {
        await fetchProductDetail(productId);

        // Tambahkan event listener ke tombol "Add to Cart"
        if (addToCartButton) {
            addToCartButton.addEventListener("click", function () {
                handleAddToCart(productId);
            });
        }
    } else {
        alert("Produk tidak ditemukan!");
        window.location.href = "/frontend/Pages/dashboard-product.html";
    }
});
