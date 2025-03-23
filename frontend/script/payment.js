// Fungsi untuk update total harga
function updateTotalPrice() {
    let subtotal = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
        subtotal += parseInt(item.getAttribute('data-price'));
    });

    let tax = subtotal * 0.08; // Pajak 8%
    let total = subtotal + tax;

    document.getElementById('subtotal-price').innerText = `Rp ${subtotal.toLocaleString()}`;
    document.getElementById('tax-amount').innerText = `Rp ${Math.round(tax).toLocaleString()}`;
    document.getElementById('total-price').innerText = `Rp ${Math.round(total).toLocaleString()}`;

    return total;
}

// Simulasi saldo awal
let walletBalance = 25000;
document.getElementById('wallet-balance').innerText = `Rp ${walletBalance.toLocaleString()}`;

// Event listener untuk tombol bayar
document.getElementById('pay-button').addEventListener('click', function () {
    let totalPrice = updateTotalPrice();

    if (walletBalance < totalPrice) {
        alert("Saldo tidak cukup! Silakan tambah saldo.");
    } else {
        walletBalance -= totalPrice;
        document.getElementById('wallet-balance').innerText = `Rp ${walletBalance.toLocaleString()}`;
        alert("Pembayaran berhasil!");
        setTimeout(() => {
            window.location.href = "dashboard-buyer.html";
        }, 2000);
    }
});

// Tambah Saldo Modal
document.getElementById('topup-button').addEventListener('click', function () {
    document.getElementById('topup-modal').classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', function () {
    document.getElementById('topup-modal').classList.add('hidden');
});

document.getElementById('confirm-topup').addEventListener('click', function () {
    let topupAmount = parseInt(document.getElementById('topup-amount').value);
    if (!isNaN(topupAmount) && topupAmount > 0) {
        walletBalance += topupAmount;
        document.getElementById('wallet-balance').innerText = `Rp ${walletBalance.toLocaleString()}`;
        alert(`Saldo berhasil ditambahkan Rp ${topupAmount.toLocaleString()}`);
        document.getElementById('topup-modal').classList.add('hidden');
    } else {
        alert("Masukkan jumlah saldo yang valid!");
    }
});

// Panggil fungsi update harga saat halaman dimuat
updateTotalPrice();
