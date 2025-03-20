document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("product-list"); // Gunakan ID khusus untuk bagian produk

    async function fetchMaterials() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/materials");
            const materials = await response.json();

            // Ambil hanya 9 produk pertama
            const limitedMaterials = materials.slice(0, 9);

            // Kosongkan container sebelum menampilkan data baru
            container.innerHTML = "";

            // Jika tidak ada produk, tampilkan pesan
            if (limitedMaterials.length === 0) {
                container.innerHTML = `<p class="text-gray-500 text-center col-span-3">Produk tidak tersedia</p>`;
                return;
            }

            // Generate kartu produk
            limitedMaterials.forEach(material => {
                const card = document.createElement("div");
                card.className = "border border-gray-300 rounded-lg p-4 shadow-md bg-white flex flex-col justify-between ";

                card.innerHTML = `

                        <div class="flex justify-between items-center">
                            <a href="#" class="text-blue-600 font-semibold">${material.name}</a>
                            <button class="text-green-500 text-2xl font-bold">+</button>
                        </div>
                        <p class="text-gray-500 text-sm">${material.category }</p>
                        <p class="text-gray-400 text-xs"> ${material.seller }</p>
                        <p class="text-gray-900 font-semibold mt-2">Rp ${material.price.toLocaleString()}</p>
                `;
                container.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching materials:", error);
            container.innerHTML = `<p class="text-red-500 text-center col-span-3">Gagal memuat produk</p>`;
        }
    }

    fetchMaterials();
});
