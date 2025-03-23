function formatCurrency(value) {
    return "Rp " + value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let salesData = []; // Menyimpan semua transaksi
let currentPage = 1;
const itemsPerPage = 10;

async function fetchSellerSales() {
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        console.error("User ID tidak ditemukan di localStorage.");
        document.getElementById("seller-sales").innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">User ID tidak ditemukan.</td></tr>`;
        return;
    }

    try {
        let response = await fetch(`http://127.0.0.1:5000/api/payment/seller_sales/${userId}`);
        if (!response.ok) {
            let errorText = await response.text();
            throw new Error(`Gagal mengambil riwayat penjualan: ${errorText}`);
        }

        salesData = await response.json();
        currentPage = 1; // Reset ke halaman pertama setiap fetch data baru
        renderSalesTable(); // Panggil fungsi render

    } catch (error) {
        console.error("Error fetching seller sales:", error);
        document.getElementById("seller-sales").innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">${error.message}</td></tr>`;
    }
}

function renderSalesTable() {
    let salesContainer = document.getElementById("seller-sales");
    salesContainer.innerHTML = "";

    if (salesData.length === 0) {
        salesContainer.innerHTML = `<tr><td colspan="6" class="text-center py-4">Belum ada transaksi</td></tr>`;
        return;
    }

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedSales = salesData.slice(start, end);

    let fragment = document.createDocumentFragment();

    paginatedSales.forEach(sale => {
        let row = document.createElement("tr");

        let statusClass = sale.payment_status === "COMPLETED" ? 
            "bg-green-100 text-green-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full" : 
            "bg-yellow-100 text-yellow-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full";

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.transaction_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.buyer_username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(sale.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(sale.transaction_date).toLocaleString("id-ID")}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${sale.payment_status}</span>
            </td>
        `;

        fragment.appendChild(row);
    });

    salesContainer.appendChild(fragment);
    updatePaginationButtons();
}

function updatePaginationButtons() {
    let totalPages = Math.ceil(salesData.length / itemsPerPage);

    document.getElementById("current-page").textContent = `Halaman ${currentPage} dari ${totalPages}`;
    
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = currentPage === totalPages;
}

document.getElementById("prev-btn").addEventListener("click", function() {
    if (currentPage > 1) {
        currentPage--;
        renderSalesTable();
    }
});

document.getElementById("next-btn").addEventListener("click", function() {
    let totalPages = Math.ceil(salesData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderSalesTable();
    }
});

document.addEventListener("DOMContentLoaded", fetchSellerSales);
