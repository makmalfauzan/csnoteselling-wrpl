document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);
        window.location.href = "dashboard.html";
    } else {
        alert(data.error);
    }
});
