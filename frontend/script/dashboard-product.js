document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const filterMatkul = document.querySelector('select');
    const minPriceInput = document.querySelector('input[placeholder="Min Price"]');
    const maxPriceInput = document.querySelector('input[placeholder="Max Price"]');
    const productContainer = document.querySelector(".col-span-3"); // Tempat menampilkan produk
    const paginationContainer = document.createElement("div"); // Kontainer pagination
    paginationContainer.className = "flex justify-center mt-4"; // Styling agar berada di tengah
    productContainer.after(paginationContainer); // Meletakkan pagination di bawah produk

    // Ambil parameter dari URL
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("q") || "";
    const selectedCourse = params.get("course") || "";
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    let currentPage = parseInt(params.get("page")) || 1; // Default ke halaman 1
    const productsPerPage = 9; // Jumlah produk per halaman

    searchInput.value = searchQuery;
    filterMatkul.value = selectedCourse;
    minPriceInput.value = minPrice;
    maxPriceInput.value = maxPrice;

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
    
            if (selectedCourse) {
                filterMatkul.value = selectedCourse;
            }
        } catch (error) {
            console.error("Gagal mengambil data mata kuliah:", error);
        }
    }
    
    async function fetchProducts() {
        try {
            let apiUrl = `http://127.0.0.1:5000/api/materials?course=${selectedCourse}&q=${searchQuery}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
            const response = await fetch(apiUrl);
            const products = await response.json();

            productContainer.innerHTML = "";
            paginationContainer.innerHTML = ""; // Bersihkan pagination sebelum menampilkan yang baru

            if (products.length === 0) {
                productContainer.innerHTML = `<p class="text-gray-500 text-center col-span-3">Produk tidak ditemukan</p>`;
                return;
            }

            // Hitung jumlah halaman
            const totalPages = Math.ceil(products.length / productsPerPage);
            
            // Ambil data yang sesuai dengan halaman saat ini
            const start = (currentPage - 1) * productsPerPage;
            const paginatedProducts = products.slice(start, start + productsPerPage);

            paginatedProducts.forEach(product => {
                const productCard = document.createElement("div");
                productCard.className = "bg-white p-4 rounded-lg shadow-md flex justify-between";

                productCard.innerHTML = `
                    <div>
                        <h3 class="text-blue-700 font-bold">${product.title}</h3>
                        <p class="text-gray-600 text-sm">${product.category || "Kategori tidak tersedia"}</p>
                        <p class="text-gray-500 text-sm">${product.description}</p>
                        <p class="font-bold">Rp ${product.price.toLocaleString()}</p>
                    </div>
                    <button class="text-2xl">🛒</button>
                `;

                productContainer.appendChild(productCard);
            });

            // Buat navigasi pagination
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.textContent = i;
                pageButton.className = `px-3 py-1 mx-1 border rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`;
                pageButton.addEventListener("click", () => {
                    window.location.href = `dashboard-product.html?q=${encodeURIComponent(searchQuery)}&course=${encodeURIComponent(selectedCourse)}&minPrice=${encodeURIComponent(minPrice)}&maxPrice=${encodeURIComponent(maxPrice)}&page=${i}`;
                });
                paginationContainer.appendChild(pageButton);
            }

        } catch (error) {
            console.error("Gagal mengambil produk:", error);
        }
    }

    document.querySelectorAll("select, input").forEach(element => {
        element.addEventListener("change", function () {
            const newQuery = searchInput.value;
            const newCourse = filterMatkul.value;
            const newMinPrice = minPriceInput.value;
            const newMaxPrice = maxPriceInput.value;

            window.location.href = `dashboard-product.html?q=${encodeURIComponent(newQuery)}&course=${encodeURIComponent(newCourse)}&minPrice=${encodeURIComponent(newMinPrice)}&maxPrice=${encodeURIComponent(newMaxPrice)}&page=1`;
        });
    });

    fetchCourses();
    fetchProducts();
});
