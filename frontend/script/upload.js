document.addEventListener("DOMContentLoaded", function () {
    const materialForm = document.getElementById("materialForm");
    const courseDropdown = document.getElementById("course_id");
    const fileInput = document.getElementById("file");

    // Fungsi untuk mengambil daftar mata kuliah dari API
    async function fetchCourses() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/courses");
            const courses = await response.json();

            courseDropdown.innerHTML = '<option value="">Pilih Mata Kuliah</option>';
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.course_id;
                option.textContent = course.course_name;
                courseDropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Gagal mengambil daftar mata kuliah:", error);
        }
    }

    // Panggil fungsi untuk mengisi dropdown course saat halaman dimuat
    fetchCourses();

    // Event Listener saat form dikirim
    materialForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("seller_id", localStorage.getItem("user_id"));  // Ambil ID seller dari localStorage
        formData.append("title", document.getElementById("title").value);
        formData.append("course_id", courseDropdown.value);
        formData.append("material", document.getElementById("material").value);
        formData.append("category", document.getElementById("category").value);
        formData.append("price", document.getElementById("price").value);
        formData.append("description", document.getElementById("description").value);

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            formData.append("filename", file.name);
            formData.append("file_size", file.size);
        } else {
            alert("Silakan pilih file untuk diupload!");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/api/uploadfile/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert("File berhasil diunggah!");
                materialForm.reset();
            } else {
                alert("Gagal mengupload: " + result.error);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Terjadi kesalahan saat mengupload file.");
        }
    });
});
