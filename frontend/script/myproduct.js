document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("product-list");
    const sellerId = localStorage.getItem("user_id"); // Ambil ID seller dari localStorage

    if (!sellerId) {
        console.error("Seller ID tidak ditemukan di localStorage");
        return;
    }

    const loadingScreen = document.getElementById("loading-screen");
            // Tampilkan loading
            loadingScreen.style.display = "flex";
    fetch(`http://127.0.0.1:5000/api/materials/seller/${sellerId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Gagal mengambil data produk");
        }
        return response.json();
    })
    .then(data => {
        const products = data.products; // Ambil array "products"

        if (!Array.isArray(products)) {
            throw new Error("Data produk tidak dalam format yang benar");
        }

        const productList = document.getElementById("product-list");
        productList.innerHTML = "";

        products.forEach(product => {
            const row = `
                <tr>
                    <td class="px-6 py-4">${product.title}</td>
                    <td class="px-6 py-4">${product.course_name}</td>
                    <td class="px-6 py-4">${product.category}</td>
                    <td class="px-6 py-4">${product.materi}</td>
                    <td class="px-6 py-4">${product.price}</td>
                    <td class="px-6 py-4">${product.description}</td>
                    <td class="px-6 py-4">${product.uploaded_at}</td>
                </tr>
            `;
            productList.innerHTML += row;
            // Sembunyikan loading setelah data berhasil dimuat
        loadingScreen.style.display = "none";
        });
    })
    .catch(error => {
        console.error("Error fetching products:", error);
    });

});

document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username') || 'User';
    
    // Pilih semua elemen dengan class "username"
    const usernameElements = document.querySelectorAll('.username');

    // Loop semua elemen dan ubah teksnya
    usernameElements.forEach(element => {
        element.textContent = `Halo, ${username}!`;
    });
});