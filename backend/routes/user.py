from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS

user_bp = Blueprint('user', __name__, url_prefix='/api/user')
CORS(user_bp, resources={r"/api/user/*": {"origins": "*"}})

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = request.args.get("user_id")  # Ambil user_id dari request

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400  # Tambahkan validasi jika user_id tidak ada

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT users.username, users.email, users.role,
               profiles.full_name, profiles.bio
        FROM users
        JOIN profiles ON users.user_id = profiles.user_id
        WHERE users.user_id = %s
    """, (user_id,))

    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404  # Jika user tidak ditemukan

    return jsonify({
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
        "bio": user["bio"]
    })
