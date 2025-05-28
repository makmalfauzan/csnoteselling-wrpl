document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("product-list");
    const loadingScreen = document.getElementById("loading-screen");

    
    async function fetchMaterials() {
        try {
            // Tampilkan loading
            loadingScreen.style.display = "flex";
            const response = await fetch("http://backend:5000/api/materials");
            const materials = await response.json();

            console.log("Data dari API:", materials); // Debugging

            const limitedMaterials = materials.slice(0, 9);
            container.innerHTML = "";

            if (limitedMaterials.length === 0) {
                container.innerHTML = `<p class="text-gray-500 text-center col-span-3">Produk tidak tersedia</p>`;
                return;
            }

            limitedMaterials.forEach(material => {
                const card = document.createElement("a"); // Gunakan <a> sebagai wrapper utama
                card.href = `./pages/product-detail.html?id=${material.material_id}`;
                card.className = "border border-gray-300 rounded-lg p-4 shadow-md transition transform hover:-translate-y-1 hover:shadow-lg bg-white flex flex-col justify-between cursor-pointer no-underline text-black";
            
                const name = material.title || "Nama tidak tersedia";
                const category = material.category || "Kategori tidak tersedia";
                const seller = material.seller || "Penjual tidak diketahui";
                const price = material.price ? `Rp ${material.price.toLocaleString()}` : "Harga tidak tersedia";
            
                card.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="text-blue-600 font-semibold">${name}</span>
                        <div class="text-2xl text-green-500">🛒</div>
                    </div>
                    <p class="text-gray-500 text-sm">${category}</p>
                    <p class="text-gray-400 text-xs">Penjual: ${seller}</p>
                    <p class="text-gray-900 font-semibold mt-2">${price}</p>
                `;
            
                container.appendChild(card);
                // Sembunyikan loading setelah data berhasil dimuat
                loadingScreen.style.display = "none";
            });

        } catch (error) {
            console.error("Error fetching materials:", error);
            container.innerHTML = `<p class="text-red-500 text-center col-span-3">Gagal memuat produk</p>`;
        }
    }

    fetchMaterials();
});


document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-btn");
    const filterMatkul = document.getElementById("filter-matkul");

    // Ambil daftar course dari database
    async function fetchCourses() {
        try {
            const response = await fetch("http://backend:5000/api/courses"); // Endpoint Flask
            if (!response.ok) {
                throw new Error("Gagal mengambil data course");
            }
            const courses = await response.json();
            console.log("Data Course:", courses); // Debugging

            // Tambahkan opsi ke dropdown
            filterMatkul.innerHTML = `<option value="">Mata Kuliah</option>`; // Reset sebelum menambahkan
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.course_id || course.id; // Pastikan field sesuai database
                option.textContent = course.course_name || course.name;
                filterMatkul.appendChild(option);
                
            });
        } catch (error) {
            console.error("Gagal mengambil data mata kuliah:", error);
        }
    }

    fetchCourses(); // Panggil fungsi untuk mengambil daftar course

    // Event listener untuk search button
    searchButton.addEventListener("click", function () {
        const query = searchInput.value.trim();
        const selectedCourse = filterMatkul.value; // Ambil course_id yang dipilih

        if (!query) {
            alert("Silakan masukkan kata kunci pencarian.");
            return;
        }

        // Redirect ke dashboard-product.html dengan query parameter
        window.location.href = `/frontend/Pages/dashboard-product.html?q=${encodeURIComponent(query)}&course=${encodeURIComponent(selectedCourse)}`;

    });
});



