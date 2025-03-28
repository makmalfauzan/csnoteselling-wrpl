document.addEventListener("DOMContentLoaded", async function () {
    const logoutButton = document.querySelector("#logout-button");
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
    }

    async function fetchProfile() {
        try {
            console.log("Fetching profile for user_id:", userId); // Debugging log

            const response = await fetch(`http://127.0.0.1:5000/api/user/profile?user_id=${userId}`);
            
            if (!response.ok) {
                throw new Error(`Gagal mengambil data profil: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                alert("Error: " + data.error);
                return;
            }

            console.log("Profile data received:", data); // Debugging log

            // Update elemen di halaman profil
            document.getElementById("username").textContent = data.username;
            document.getElementById("email").textContent = data.email;
            document.getElementById("full_name").textContent = data.full_name;
            document.getElementById("bio").textContent = data.bio;

            // Gunakan gambar default sebagai profile picture
            document.getElementById("profile_picture").src = "https://randomuser.me/api/portraits/men/1.jpg";

        } catch (error) {
            console.error("Error fetching profile data:", error);
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

                window.location.href = "/frontend/Pages/login.html";
            }
        });
    }

    fetchProfile();
});
