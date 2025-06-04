document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
            
      const loadingScreen = document.getElementById('loading-screen2');
      loadingScreen.style.display = 'flex'; // Tampilkan loading
    
      const username = document.getElementById('name').value;
      const password = document.getElementById('password').value;
    
      try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
    
        const result = await response.json();
        console.log('Hasil Login:', result);
    
        if (response.ok) {
          alert('Login Berhasil!');
    
          localStorage.setItem('user_id', result.user_id);
          localStorage.setItem('username', result.username);
          localStorage.setItem('role', result.role);
    
          if (result.role.toLowerCase() === 'seller') {
            window.location.href = 'dashboard-seller.html';
          } else {
            window.location.href = 'dashboard-buyer.html';
          }
        } else {
          alert(result.error || 'Login gagal');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Terjadi kesalahan saat login.');
      } finally {
        loadingScreen.style.display = 'none'; // Sembunyikan loading, apapun hasilnya
      }
    });
  }
    

  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const loadingScreen = document.getElementById('loading-screen2');
      loadingScreen.style.display = 'flex'; // Tampilkan loading

      const username = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const role = document.querySelector('input[name="role"]:checked').value;

      if (password !== confirmPassword) {
        alert('Password dan Konfirmasi Password tidak cocok!');
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Registrasi Berhasil! Silakan Login.');
        loadingScreen.style.display = 'none'; // Sembunyikan loading, apapun hasilnya
        window.location.href = 'login.html';
      } else {
        alert(result.error || 'Registrasi gagal');
        loadingScreen.style.display = 'none'; // Sembunyikan loading, apapun hasilnya
      } 
    });
  }
});
