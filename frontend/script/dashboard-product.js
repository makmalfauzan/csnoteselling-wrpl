document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const filterMatkul = document.querySelector('select');
    const minPriceInput = document.querySelector('input[placeholder="Min Price"]');
    const maxPriceInput = document.querySelector('input[placeholder="Max Price"]');
    const productContainer = document.querySelector(".col-span-3");
    const selectedFilterContainer = document.querySelector(".selected-filters");

    let paginationContainer = document.querySelector(".pagination-container");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.className = "w-full flex justify-center items-center mt-6 mb-10 space-x-2";
        productContainer.after(paginationContainer);
    }

    function getParams() {
        return new URLSearchParams(window.location.search);
    }

    async function fetchCourses() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/courses");
            const courses = await response.json();

            filterMatkul.innerHTML = `<option value="">Mata Kuliah</option>`;
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.course_id;
                option.textContent = course.course_name;
                filterMatkul.appendChild(option);
            });

            const params = getParams();
            if (params.get("course")) {
                filterMatkul.value = params.get("course");
            }
        } catch (error) {
            console.error("Gagal mengambil data mata kuliah:", error);
        }
    }

    async function fetchProducts() {
        try {
            const params = getParams();
            const searchQuery = params.get("q") || "";
            const selectedCourse = params.get("course") || "";
            const minPrice = params.get("minPrice") || "";
            const maxPrice = params.get("maxPrice") || "";
            let currentPage = parseInt(params.get("page")) || 1;
            const productsPerPage = 9;
    
            let apiUrl = `http://127.0.0.1:5000/api/materials?page=${currentPage}&limit=${productsPerPage}&course=${selectedCourse}&q=${searchQuery}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
            const response = await fetch(apiUrl);
            const products = await response.json();
    
            productContainer.innerHTML = "";
            paginationContainer.innerHTML = "";
    
            updateSelectedFilter();
    
            if (products.length === 0) {
                productContainer.innerHTML = `<p class="text-red-500 text-center col-span-3">Produk tidak ditemukan</p>`;
                return;
            }
    
            const totalPages = Math.ceil(products.length / productsPerPage);
            const start = (currentPage - 1) * productsPerPage;
            const paginatedProducts = products.slice(start, start + productsPerPage);
    
            paginatedProducts.forEach(product => {
                const productCard = document.createElement("a");
                productCard.href = `./product-detail.html?id=${product.material_id}`;
                productCard.className = "bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col text-center border border-gray-200 w-full max-w-xs";
    
                const imageUrl = `https://i.pinimg.com/736x/81/21/dc/8121dc48ec937ecf919bc2c54aa961a4.jpg`;
    
                productCard.innerHTML = `
                    <img src="${imageUrl}" 
                         alt="${product.title}" 
                         class="w-40 h-40 object-cover rounded-md mb-4 shadow-sm border border-gray-300 mx-auto">
            
                    <h3 class="text-lg font-bold text-gray-800">${product.title}</h3>
                    <p class="text-sm text-gray-500 font-medium mt-1">${product.category || "Kategori tidak tersedia"}</p>
                    <p class="text-xs text-gray-700 font-medium mt-1 italic">Dijual oleh: <span class="text-blue-600 font-semibold">${product.seller || "Unknown Seller"}</span></p>
                    <p class="text-sm text-gray-600 mt-2 px-4 text-justify line-clamp-3">
                        ${product.description || "Deskripsi tidak tersedia"}
                    </p>
                    <p class="text-xl font-semibold text-blue-600 mt-auto mb-4">Rp ${product.price.toLocaleString()}</p>
                    
                    <!-- Perbaiki Link ke Halaman Detail Produk -->
                    <a href="./product-detail.html?id=${product.material_id}">
                        <button class="w-full bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition shadow-md flex items-center justify-center space-x-2">
                            <span>🛒</span>
                            <span>Beli Sekarang</span>
                        </button>
                    </a>
                `;
    
                productContainer.appendChild(productCard);
            });
    
            setupPagination(totalPages, currentPage);
        } catch (error) {
            console.error("Gagal mengambil produk:", error);
        }
    }
    

    function setupPagination(totalPages, currentPage) {
        paginationContainer.innerHTML = "";
        const params = getParams();

        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "«";
            prevButton.className = "px-4 py-2 rounded bg-white border border-gray-300 hover:bg-blue-400 hover:text-white transition";
            prevButton.addEventListener("click", () => {
                params.set("page", currentPage - 1);
                history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                fetchProducts();
            });
            paginationContainer.appendChild(prevButton);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.className = `px-4 py-2 rounded border border-gray-300 ${
                i === currentPage ? 'bg-blue-600 text-blue-400 font-bold' : 'bg-white hover:bg-blue-500 hover:text-white'
            }`;
            pageButton.addEventListener("click", () => {
                params.set("page", i);
                history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                fetchProducts();
            });
            paginationContainer.appendChild(pageButton);
        }
    }

    function updateSelectedFilter() {
        selectedFilterContainer.innerHTML = "";
        const params = getParams();
    
        // **Pastikan input dan filter diperbarui**
        searchInput.value = params.get("q") || "";
        filterMatkul.value = params.get("course") || "";
        minPriceInput.value = params.get("minPrice") || "";
        maxPriceInput.value = params.get("maxPrice") || "";
    
        const filters = [
            { key: "q", label: "🔍 Pencarian", value: params.get("q") || "" },
            { key: "course", label: "📚 Mata Kuliah", value: params.get("course") ? filterMatkul.options[filterMatkul.selectedIndex].text : "" },
            { key: "minPrice", label: "💰 Min Harga", value: params.get("minPrice") ? `Rp ${parseInt(params.get("minPrice")).toLocaleString()}` : "" },
            { key: "maxPrice", label: "💰 Max Harga", value: params.get("maxPrice") ? `Rp ${parseInt(params.get("maxPrice")).toLocaleString()}` : "" }
        ];
    
        filters.forEach(filter => {
            if (filter.value) {
                const filterItem = document.createElement("div");
                filterItem.className = "flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm";
                filterItem.innerHTML = `<span>${filter.label}: <strong>${filter.value}</strong></span>
                    <button class="text-red-500 hover:text-red-700 transition duration-200">✖</button>`;
    
                filterItem.querySelector("button").addEventListener("click", () => {
                    params.delete(filter.key);
                    params.set("page", 1);
                    history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                    
                    // **Kosongkan input setelah filter dihapus**
                    if (filter.key === "q") searchInput.value = "";
                    if (filter.key === "course") filterMatkul.value = "";
                    if (filter.key === "minPrice") minPriceInput.value = "";
                    if (filter.key === "maxPrice") maxPriceInput.value = "";
    
                    fetchProducts();
                    updateSelectedFilter();
                });
    
                selectedFilterContainer.appendChild(filterItem);
            }
        });
    
        // Jika tidak ada filter, tampilkan pesan kosong
        if (selectedFilterContainer.innerHTML === "") {
            selectedFilterContainer.innerHTML = `<p class="text-gray-500 text-sm">Tidak ada filter aktif.</p>`;
        }
    }
    

    document.querySelectorAll("select, input").forEach(element => {
        element.addEventListener("change", function () {
            const params = getParams();
            params.set("q", searchInput.value);
            params.set("course", filterMatkul.value);
            params.set("minPrice", minPriceInput.value);
            params.set("maxPrice", maxPriceInput.value);
            params.set("page", 1);
            history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
            fetchProducts();
            updateSelectedFilter();
        });
    });

    fetchCourses();
    function updateNavbar() {
        const navbarMenu = document.getElementById("navbar-menu");
        const userRole = localStorage.getItem("role"); // Ambil role dari localStorage
        const isLoggedIn = !!userRole; // Jika ada role, berarti user login
    
        let navbarHTML = ` `;
    
        if (isLoggedIn) {
            // Jika user SUDAH login
            navbarHTML = `
                <a href="/frontend/Pages/dashboard-${userRole}.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Home
                </a>
                <a href="/frontend/Pages/cart.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Keranjang
                </a>
                <a href="/frontend/Pages/about.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Tentang Kami
                </a>
                <a href="/frontend/Pages/profile.html" class="text-base font-medium text-blue2 hover:text-gray-900 flex items-center">
                    <img src="/frontend/assets/images/user-icon.svg" class="h-8 w-8 rounded-full border border-gray-300" alt="Profile">
                </a>
            `;
        } else {
            // Jika user BELUM login
            navbarHTML += `
                <a href="/frontend/index.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                    Home
                </a>
                <a href="/frontend/Pages/about.html" class="text-base font-medium text-blue2 hover:text-gray-900">
                Tentang Kami
                </a>
                <a href="/frontend/Pages/login.html" class="px-4 py-1 border border-transparent rounded-4xl shadow-sm text-base font-medium text-white bg-blue2 hover:bg-indigo-700">
                    Login
                </a>
            `;
        }
    
        navbarMenu.innerHTML = navbarHTML;
    }
    
    // Panggil fungsi untuk update navbar saat halaman dimuat
    updateNavbar();
    
    fetchProducts();
});

window.addEventListener("popstate", function () {
    fetchProducts();
    updateSelectedFilter();
});

document.addEventListener("DOMContentLoaded", function () {
    const searchBar = document.querySelector(".search-bar-container"); // Sesuaikan dengan class di HTML
    const navbarHeight = document.querySelector("header").offsetHeight; // Ambil tinggi navbar

    window.addEventListener("scroll", function () {
        if (window.scrollY > navbarHeight) {
            searchBar.classList.add("fixed", "top-[60px]", "left-0", "w-full", "bg-white", "shadow-lg", "z-50", "p-3");
        } else {
            searchBar.classList.remove("fixed", "top-[60px]", "left-0", "w-full", "shadow-lg", "z-50", "p-3");
            searchBar.classList.add("bg-white"); // Pastikan warna tetap putih
        }
    });
});

document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("search-input");
    const filterMatkul = document.getElementById("filter-course");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const applyFilterBtn = document.getElementById("apply-filter");

    async function fetchCourses() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/courses");
            const courses = await response.json();

            filterMatkul.innerHTML = `<option value="">Mata Kuliah</option>`;
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.course_id;
                option.textContent = course.course_name;
                filterMatkul.appendChild(option);
            });

            const params = getParams();
            if (params.get("course")) {
                filterMatkul.value = params.get("course");
            }
        } catch (error) {
            console.error("Gagal mengambil data mata kuliah:", error);
        }
    }

    function getParams() {
        return new URLSearchParams(window.location.search);
    }

    function applyFilters() {
        const params = new URLSearchParams();
        const searchQuery = searchInput.value.trim();
        const selectedCourse = filterMatkul.value;
        const minPrice = minPriceInput.value;
        const maxPrice = maxPriceInput.value;

        if (searchQuery) params.set("q", searchQuery);
        if (selectedCourse) params.set("course", selectedCourse);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        params.set("page", 1); // Reset ke halaman pertama saat filter diterapkan
        history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);

        fetchProducts();
        updateSelectedFilter();
    }

    // Tambahkan event listener ke tombol "Terapkan Filter"
    applyFilterBtn.addEventListener("click", applyFilters);

    // Muat daftar mata kuliah saat halaman pertama kali dimuat
    fetchCourses();
});

document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById("back-to-dashboard");

    if (backButton) {
        backButton.addEventListener("click", function () {
            const userRole = localStorage.getItem("role"); // Ambil role user dari localStorage

            if (userRole) {
                window.location.href = `/frontend/Pages/dashboard-${userRole}.html`; // Arahkan ke dashboard sesuai role
            } else {
                window.location.href = "/frontend/index.html"; // Jika tidak ada role, arahkan ke halaman utama
            }
        });
    }
});
