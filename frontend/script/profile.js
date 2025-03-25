document.addEventListener("DOMContentLoaded", async function () {
    // Ambil elemen dari HTML
    const profileName = document.querySelector("#profile-name");
    const profileEmail = document.querySelector("#profile-email");
    const profileBio = document.querySelector("#profile-bio");
    const profileJoinDate = document.querySelector("#profile-join-date");
    const profileImage = document.querySelector("#profile-image");
    const recentActivityContainer = document.querySelector("#recent-activity");
    const logoutButton = document.querySelector("#logout-button");

    // Fungsi untuk mengambil data profil dari API Flask
    async function fetchProfile() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/profile"); // Sesuaikan dengan endpoint Flask
            if (!response.ok) {
                throw new Error("Gagal mengambil data profil");
            }

            const data = await response.json();

            // Periksa jika data ada
            if (!data.username || !data.full_name) {
                console.warn("Data profil tidak ditemukan atau tidak lengkap.");
                return;
            }

            // Update tampilan profil dengan data dari server
            profileName.textContent = data.full_name || data.username; // Prioritaskan full_name
            profileEmail.textContent = data.email;
            profileBio.textContent = data.bio || "Belum ada bio.";
            profileJoinDate.textContent = `Member sejak ${new Date(data.join_date).toLocaleDateString("id-ID")}`;
            profileImage.src = data.profile_picture || "https://via.placeholder.com/96"; // Jika tidak ada gambar, pakai placeholder

            // Update aktivitas terbaru (jika ada)
            recentActivityContainer.innerHTML = "";
            if (data.recent_activity.length > 0) {
                data.recent_activity.forEach(activity => {
                    const activityItem = document.createElement("div");
                    activityItem.className = "flex items-center gap-4";
                    activityItem.innerHTML = `
                        <div class="rounded-md bg-blue-100 p-2">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" 
                                viewBox="0 0 24 24">
                                <path d="M3 3h18v2H3zM3 9h18v2H3zM3 15h18v2H3z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium">${activity.action}</p>
                            <p class="text-xs text-gray-500">${new Date(activity.timestamp).toLocaleDateString("id-ID")}</p>
                        </div>
                    `;
                    recentActivityContainer.appendChild(activityItem);
                });
            } else {
                recentActivityContainer.innerHTML = `<p class="text-gray-500 text-sm">Belum ada aktivitas terbaru.</p>`;
            }

        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    // Logout Function
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
            if (confirmLogout) {
                localStorage.removeItem("role"); // Hapus role dari localStorage
                localStorage.removeItem("user_id");
                localStorage.removeItem("username");
                sessionStorage.removeItem("userSession"); // Hapus session (jika ada)

                // Redirect ke halaman login
                window.location.href = "/Pages/login.html";
            }
        });
    }

    // Panggil fungsi untuk mengambil data profil saat halaman dimuat
    fetchProfile();
});
