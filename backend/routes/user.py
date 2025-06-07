from flask import Blueprint, jsonify, request
from ..db_connection import get_db_connection
from flask_cors import CORS

user_bp = Blueprint('user', __name__, url_prefix='/api/user')
CORS(user_bp, resources={r"/api/user/*": {"origins": "*"}})

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Ambil data user dari tabel users (termasuk created_at)
    cursor.execute("SELECT username, email, role, created_at FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404  # Jika user tidak ada

    # Cek apakah user sudah punya profil
    cursor.execute("SELECT full_name, bio FROM profiles WHERE user_id = %s", (user_id,))
    profile = cursor.fetchone()

    if not profile:
        # Jika belum ada, buat profil kosong
        cursor.execute("INSERT INTO profiles (user_id, full_name, bio) VALUES (%s, '', '')", (user_id,))
        conn.commit()

        # Set profil kosong untuk dikembalikan
        profile = {"full_name": "", "bio": ""}

    # Gabungkan data user dan profil
    return jsonify({
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "full_name": profile["full_name"],
        "bio": profile["bio"],
        "created_at": user["created_at"]  # Tambahkan created_at ke response
    })

@user_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    data = request.json
    user_id = data.get("user_id")
    full_name = data.get("full_name")
    bio = data.get("bio")

    if not user_id or not full_name or not bio:
        return jsonify({"error": "Semua field harus diisi"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Pastikan user ada di tabel users
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "User tidak ditemukan"}), 404

    # Perbarui atau buat data di tabel profiles
    cursor.execute("SELECT * FROM profiles WHERE user_id = %s", (user_id,))
    profile = cursor.fetchone()

    if profile:
        cursor.execute(
            "UPDATE profiles SET full_name = %s, bio = %s WHERE user_id = %s",
            (full_name, bio, user_id),
        )
    else:
        cursor.execute(
            "INSERT INTO profiles (user_id, full_name, bio) VALUES (%s, %s, %s)",
            (user_id, full_name, bio),
        )

    conn.commit()
    return jsonify({"message": "Profil berhasil diperbarui"})
