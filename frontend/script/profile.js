document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("user_id");
    const userNameElement = document.querySelector("#user_name");
    const roleElement = document.querySelector("#role");
    const memberSinceElement = document.querySelector("#member-since");

    // Ambil username dari localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        userNameElement.textContent = storedUsername;
    } else {
        userNameElement.textContent = "Pengguna";
    }

    if (!userId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
    }

    async function fetchUserData() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/user/profile?user_id=${userId}`);

            if (!response.ok) {
                throw new Error(`Gagal mengambil data pengguna: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Data pengguna diterima:", data);

            // Set tanggal bergabung (created_at)
            if (data.created_at) {
                const createdAt = new Date(data.created_at);
                const formattedDate = createdAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                });

                memberSinceElement.textContent = `Member sejak ${formattedDate}`;
            } else {
                memberSinceElement.textContent = "Member sejak tidak diketahui";
            }

            // Set role dari localStorage
            const userRole = localStorage.getItem("role") || "User";
            roleElement.textContent = `Sebagai ${userRole}`;

        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            alert("Terjadi kesalahan saat mengambil data pengguna.");
        }
    }

    fetchUserData();
});



document.addEventListener("DOMContentLoaded", async function () {
    const logoutButton = document.querySelector("#logout-button");
    const userId = localStorage.getItem("user_id");

    console.log("🔍 User ID dari localStorage:", userId); // Debugging: Pastikan user_id ada

    if (!userId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
    }

    async function fetchProfile() {
        try {
            const loadingScreen = document.getElementById("loading-screen");
            // Tampilkan loading
            loadingScreen.style.display = "flex";
            const url = `http://127.0.0.1:5000/api/user/profile?user_id=${encodeURIComponent(userId)}`;
            console.log("📡 Mengirim request ke:", url); // Debugging
    
            const response = await fetch(url);
            console.log("🔄 Status Response:", response.status); // Debugging
    
            if (!response.ok) {
                throw new Error(`Gagal mengambil data profil: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("✅ Data profil diterima:", data); // Debugging
    
            // Periksa apakah data profil kosong, jika iya, isi dengan nilai default
            if (!data.full_name) {
                data.full_name = "Nama belum diisi";
            }
            if (!data.bio) {
                data.bio = "Bio belum diisi";
            }
    
            // Update elemen di halaman profil
            document.getElementById("username").textContent = data.username || "Unknown User";
            document.getElementById("email").textContent = data.email || "No Email";
            document.getElementById("full_name").textContent = data.full_name;
            document.getElementById("bio").textContent = data.bio;
    
            // Gunakan gambar default jika profile picture tidak tersedia
            document.getElementById("profile_picture").src = data.profile_picture || "../assets/images/profile.png";
            // Sembunyikan loading setelah data berhasil dimuat
            loadingScreen.style.display = "none";
        } catch (error) {
            console.error("❌ Error fetching profile data:", error);
            alert("Terjadi kesalahan saat mengambil data profil.");
        }
    }
    

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            if (confirm("Apakah Anda yakin ingin keluar?")) {
                localStorage.removeItem("role");
                localStorage.removeItem("user_id");
                localStorage.removeItem("username");
                sessionStorage.removeItem("userSession");

                window.location.href = "../pages/login.html";
            }
        });
    }

    fetchProfile();
});

document.addEventListener("DOMContentLoaded", function () {
    const wishlistButton = document.querySelector("#goto-cart");

    if (wishlistButton) {
        wishlistButton.addEventListener("click", function () {
            window.location.href = "cart.html";
        });
    }
});


document.addEventListener("DOMContentLoaded", async function () {
    const editProfileButton = document.getElementById("edit-profile");
    const editProfileModal = document.getElementById("editProfileModal");
    const cancelEditButton = document.getElementById("cancelEdit");
    const saveProfileButton = document.getElementById("saveProfile");

    const editFullNameInput = document.getElementById("editFullName");
    const editBioInput = document.getElementById("editBio");

    // Saat tombol "Perbarui Profil" ditekan, tampilkan modal
    editProfileButton.addEventListener("click", () => {
        editFullNameInput.value = document.getElementById("full_name").textContent;
        editBioInput.value = document.getElementById("bio").textContent;
        editProfileModal.classList.remove("hidden");
    });

    // Tombol "Batal" untuk menutup modal tanpa menyimpan
    cancelEditButton.addEventListener("click", () => {
        editProfileModal.classList.add("hidden");
    });

    // Saat tombol "Simpan" ditekan, kirim data ke backend
    saveProfileButton.addEventListener("click", async () => {
        const newFullName = editFullNameInput.value.trim();
        const newBio = editBioInput.value.trim();
        const userId = localStorage.getItem("user_id");

        if (!newFullName || !newBio) {
            alert("Full Name dan Bio tidak boleh kosong.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/api/user/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    full_name: newFullName,
                    bio: newBio
                }),
            });

            if (!response.ok) {
                throw new Error("Gagal memperbarui profil");
            }

            const result = await response.json();
            alert("Profil berhasil diperbarui!");

            // Perbarui tampilan dengan data baru
            document.getElementById("full_name").textContent = newFullName;
            document.getElementById("bio").textContent = newBio;

            editProfileModal.classList.add("hidden"); // Tutup modal
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Terjadi kesalahan saat memperbarui profil.");
        }
    });
});
