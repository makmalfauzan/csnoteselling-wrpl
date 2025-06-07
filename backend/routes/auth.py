from flask import Blueprint, request, jsonify
from flask_cors import CORS
from ..db_connection import get_db_connection
import traceback  # Untuk debug error di terminal

# Membuat Blueprint untuk auth
auth_bp = Blueprint('auth', __name__)
CORS(auth_bp, resources={r"/api/*": {"origins": "*"}})  # Izinkan CORS untuk API ini

# API Register
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        role = data.get("role", "buyer")  # Default ke buyer jika tidak diisi

        if not username or not password:
            return jsonify({"error": "Username dan password wajib diisi"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Cek apakah username sudah ada
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({"error": "Username sudah digunakan"}), 400

        # Simpan user baru tanpa hash password
        cursor.execute(
            "INSERT INTO users (username, email, password, role, is_verified) VALUES (%s, %s, %s, %s, %s)",
            (username, email, password, role, 'TRUE')
        )
        conn.commit()

        return jsonify({"message": "Registrasi berhasil", "user": {"username": username, "role": role}}), 201

    except Exception as e:
        print("Error saat registrasi:", str(e))  # Debugging error di terminal Flask
        print(traceback.format_exc())  # Tambahkan ini
        return jsonify({"error": "Terjadi kesalahan di server"}), 500


# API Login
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT user_id, username, password, role FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            print(f"Login gagal: User {username} tidak ditemukan")  # Debugging
            return jsonify({"error": "User tidak ditemukan"}), 401  

        if user["password"] != password:
            print(f"Login gagal: Password salah untuk user {username}")  # Debugging
            return jsonify({"error": "Password salah"}), 401  

        # Debug: Cetak role user di terminal Flask
        print(f"User {username} login dengan role: {user['role']}")  

        return jsonify({
            "message": "Login sukses",
            "user_id": user["user_id"],  # Tambahkan user_id dalam respons
            "username": user["username"],
            "role": user["role"]
        })

    except Exception as e:
        print("Error saat login:", str(e))  # Debugging error di terminal Flask
        print(traceback.format_exc())  # Tambahkan ini
        return jsonify({"error": "Terjadi kesalahan di server"}), 500
