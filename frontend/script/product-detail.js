document.addEventListener("DOMContentLoaded", async function () {
    // Pastikan elemen-elemen HTML sudah ada
    const productImage = document.querySelector("#product-image");
    const productName = document.querySelector("#product-name");
    const productPrice = document.querySelector("#product-price");
    const productDescription = document.querySelector("#product-description");
    const productSeller = document.querySelector("#product-seller");
    const addToCartButton = document.querySelector("#add-to-cart");
    const buyNowButton = document.querySelector("#buy-now");

    // Periksa apakah elemen-elemen HTML ditemukan
    if (!productImage || !productName || !productPrice || !productDescription || !productSeller) {
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
            const loadingScreen = document.getElementById("loading-screen");
            // Tampilkan loading
            loadingScreen.style.display = "flex";
            console.log("Fetching product ID:", productId);

            const response = await fetch(`http://127.0.0.1:5000/api/materials/${productId}`);
            const data = await response.json();
            console.log("API Data:", data);

            if (!response.ok || data.error) {
                throw new Error(data.error || "Produk tidak ditemukan");
            }

            // Menampilkan data produk di halaman
            productImage.src = "https://i.pinimg.com/736x/81/21/dc/8121dc48ec937ecf919bc2c54aa961a4.jpg"; // Gambar tetap
            productName.textContent = data.title;
            productPrice.textContent = `Rp${parseFloat(data.price).toLocaleString("id-ID")}`;
            productDescription.textContent = data.description;
            productSeller.innerHTML = `By <a href="#" class="text-blue-500 hover:underline">${data.seller}</a>`;
            // Sembunyikan loading setelah data berhasil dimuat
            loadingScreen.style.display = "none";
        } catch (error) {
            console.error("Error fetching product:", error);
            alert("Produk tidak ditemukan!");
            window.location.href = "dashboard-product.html";
        }
    }

    // Fungsi untuk menangani klik tombol "Add to Cart"
    function handleAddToCart(productId) {
        const userRole = localStorage.getItem("role"); // Cek apakah user sudah login

        if (!userRole) {
            // Jika belum login, munculkan alert dan redirect ke login page
            alert("Anda harus login terlebih dahulu!");
            window.location.href = "login.html";
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            alert("Produk ini sudah ada di keranjang Anda!");
            window.location.href = "cart.html";
        } else {
            cart.push({ id: productId, quantity: 1 });
            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Produk berhasil ditambahkan ke keranjang!");
            window.location.href = "cart.html";
        }
    }

    // Fungsi untuk menangani klik tombol "Buy Now"
    function handleBuyNow(productId) {
        const userRole = localStorage.getItem("role"); // Cek apakah user sudah login

        if (!userRole) {
            // Jika belum login, munculkan alert dan redirect ke login page
            alert("Anda harus login terlebih dahulu!");
            window.location.href = "login.html";
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            // Jika produk sudah ada di keranjang, langsung arahkan ke halaman pembayaran
            window.location.href = "payment.html";
        } else {
            // Jika produk belum ada di keranjang, tambahkan produk ke keranjang dan arahkan ke halaman pembayaran
            cart.push({ id: productId, quantity: 1 });
            localStorage.setItem("cart", JSON.stringify(cart));
            window.location.href = "payment.html";
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

        // Tambahkan event listener ke tombol "Buy Now"
        if (buyNowButton) {
            buyNowButton.addEventListener("click", function () {
                handleBuyNow(productId);
        });
    }
    } else {
        alert("Produk tidak ditemukan!");
        window.location.href = "dashboard-product.html";
    }
});

// Fungsi untuk mengubah navbar sesuai role user
function updateNavbar() {
    const navbarMenu = document.getElementById("navbar-menu");
    if (!navbarMenu) return; // Pastikan elemen navbar ada

    const userRole = localStorage.getItem("role"); // Ambil role user dari localStorage
    const isLoggedIn = !!userRole; // Cek apakah user sudah login

    let navbarHTML = `
    `;

    if (isLoggedIn) {
        // Jika user adalah BUYER, tampilkan menu khusus buyer
        if (userRole === "BUYER") {
            navbarHTML = `
                <a href="dashboard-buyer.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Dashboard
                </a>
                <a href="cart.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Keranjang
                </a>
                <a href="about.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Tentang Kami
                </a>
                <a href="profile.html" class="text-base font-medium text-blue2 hover:text-gray-900 flex items-center">
                    <img src="../assets/images/profile.png" class="h-8 w-8 rounded-full border border-gray-300" alt="Profile">
                </a>
            `;
        } else {
            // Jika role selain buyer, default ke home dan profil
            navbarHTML = `
                <a href="dashboard-${userRole}.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Home
                </a>
                <a href="about.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Tentang Kami
                </a>
                <a href="profile.html" class="text-base font-medium text-blue2 hover:text-gray-900 flex items-center">
                    <img src="../assets/images/user-icon.svg" class="h-8 w-8 rounded-full border border-gray-300" alt="Profile">
                </a>
            `;
        }
    } else {
        // Jika user belum login, tampilkan menu default
        navbarHTML += `
            <a href="../index.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                Home
            </a>
            <a href="about.html" class="text-base font-medium text-blue2 hover:text-gray-900">
            Tentang Kami
            </a>
            <a href="login.html" class="md:inline-flex items-center justify-center px-4 py-1 border border-transparent rounded-4xl shadow-sm text-base font-medium text-white bg-blue2 hover:bg-indigo-700">
                Login
            </a>
        `;
    }
    navbarMenu.innerHTML = navbarHTML;
}

// Pastikan updateNavbar dijalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
    updateNavbar();
});

// Cek apakah user adalah SELLER, jika iya redirect ke dashboard seller
document.addEventListener("DOMContentLoaded", function () {
    const userRole = localStorage.getItem("role");

    if (userRole === "SELLER") {
        alert("Seller tidak dapat mengakses halaman ini!");
        window.location.href = "dashboard-seller.html"; // Redirect ke dashboard seller
    }
});

