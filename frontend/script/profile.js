document.addEventListener("DOMContentLoaded", function () {
    // Ambil elemen tombol logout
    const logoutButton = document.querySelector("#logout-button");

    // Event listener untuk tombol logout
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
            if (confirmLogout) {
                // Hapus data sesi pengguna (misalnya token auth)
                localStorage.removeItem("role");
                sessionStorage.removeItem("userSession");

                // Redirect ke halaman login
                window.location.href = "/frontend/Pages/login.html";
            }
        });
    }

    // Edit Profile Button
    const editProfileButton = document.querySelector("#edit-profile");
    if (editProfileButton) {
        editProfileButton.addEventListener("click", function () {
            alert("Fitur edit profil masih dalam pengembangan.");
        });
    }

    // Tampilkan aktivitas terbaru (contoh statis, bisa diganti dengan API)
    const activityContainer = document.querySelector("#recent-activity");
    if (activityContainer) {
        const activities = [
            { text: "Membeli Headphone Wireless", date: "2 hari lalu" },
            { text: "Menambahkan Smartwatch ke Wishlist", date: "1 minggu lalu" }
        ];

        activityContainer.innerHTML = activities
            .map(activity => `
                <div class="flex items-center gap-4">
                    <div class="rounded-md bg-blue-100 p-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" 
                            viewBox="0 0 24 24">
                            <path d="M3 3h18v2H3zM3 9h18v2H3zM3 15h18v2H3z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium">${activity.text}</p>
                        <p class="text-xs text-gray-500">${activity.date}</p>
                    </div>
                </div>
            `)
            .join("");
    }
});
