document.addEventListener("DOMContentLoaded", function () {
    const fetchButton = document.getElementById('fetchData');
    const dataList = document.getElementById('dataList');

    if (!fetchButton) {
        console.error("Element #fetchData tidak ditemukan!");
        return;
    }

    if (!dataList) {
        console.error("Element #dataList tidak ditemukan!");
        return;
    }

    fetchButton.addEventListener('click', async () => {
        try {
            // Tampilkan pesan loading
            dataList.innerHTML = "<li class='p-2 text-gray-500'>Mengambil data...</li>";

            const response = await fetch('http://127.0.0.1:5000/api/materials/');
            if (!response.ok) {
                throw new Error('Gagal mengambil data');
            }

            const data = await response.json();
            dataList.innerHTML = ''; // Kosongkan daftar sebelum menambahkan item baru

            if (data.length === 0) {
                dataList.innerHTML = "<li class='p-2 text-gray-500'>Tidak ada data tersedia</li>";
                return;
            }

            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.material_id}: ${item.title} - ${item.category} - Rp ${item.price}`;
                li.classList.add('p-2', 'border', 'border-gray-300', 'rounded', 'mt-2');
                dataList.appendChild(li);
            });

        } catch (error) {
            console.error('Error:', error);
            dataList.innerHTML = `<li class='p-2 text-red-500'>Terjadi kesalahan saat mengambil data</li>`;
        }
    });
});
