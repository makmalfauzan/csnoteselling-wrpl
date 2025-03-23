from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS

user_bp = Blueprint('user', __name__)
CORS(user_bp, resources={r"/api/*": {"origins": "*"}})

# API untuk mendapatkan data profil pengguna
@user_bp.route('/profile', methods=['GET'])
def get_profile():
    username = request.args.get("username")  # Ambil username dari request

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Query untuk mengambil informasi user dari tabel users dan profiles
    cursor.execute("""
        SELECT 
            users.username, users.email, users.role,
            profiles.full_name, profiles.bio, profiles.profile_picture
        FROM users
        JOIN profiles ON users.user_id = profiles.user_id
        WHERE users.username = %s
    """, (username,))

    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Query untuk aktivitas terbaru pengguna
    cursor.execute("SELECT action, timestamp FROM activity WHERE username = %s ORDER BY timestamp DESC LIMIT 5", (username,))
    activity = cursor.fetchall()

    return jsonify({
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
        "bio": user["bio"],
        "profile_picture": user["profile_picture"],
        "recent_activity": activity
    })
