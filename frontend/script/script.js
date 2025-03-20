// script.js - Update untuk menampilkan materials di Dashboard Produk

document.addEventListener("DOMContentLoaded", async function () {
    const productContainer = document.getElementById("product-list");
    
    if (!productContainer) {
        console.error("Element #product-list tidak ditemukan!");
        return;
    }
    
    try {
        const response = await fetch("http://127.0.0.1:5000/api/materials/");
        if (!response.ok) {
            throw new Error("Gagal mengambil data");
        }

        const materials = await response.json();
        productContainer.innerHTML = ""; // Bersihkan kontainer sebelum menampilkan data

        if (materials.length === 0) {
            productContainer.innerHTML = "<p class='text-gray-500'>Tidak ada materi tersedia</p>";
            return;
        }

        materials.forEach(material => {
            const card = `
                <div class="border border-blue3 rounded-lg p-4 shadow-sm">
                    <div class="flex justify-between items-center">
                        <a href="#" class="text-blue-600 font-semibold">${material.title}</a>
                        <button class="text-green-500 text-2xl font-bold">+</button>
                    </div>
                    <p class="text-gray-500 text-sm">${material.category}</p>
                    <p class="text-gray-400 text-xs">(Deskripsi: ${material.description})</p>
                    <p class="text-gray-900 font-semibold mt-2">Rp ${material.price}</p>
                </div>
            `;
            productContainer.innerHTML += card;
        });
    } catch (error) {
        console.error("Error:", error);
        productContainer.innerHTML = `<p class='text-red-500'>Terjadi kesalahan saat mengambil data</p>`;
    }
});
