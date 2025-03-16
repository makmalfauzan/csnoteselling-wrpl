from flask import Blueprint, request, jsonify
from config.db import db, cursor

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    cursor.execute("SELECT user_id, role, password, is_verified FROM users WHERE username = %s", (data['username'],))
    user = cursor.fetchone()

    if user and user["password"] == data["password"]:
        if user["is_verified"] == 'TRUE':
            return jsonify({"message": "Login berhasil!", "role": user["role"], "user_id": user["user_id"]})
        return jsonify({"error": "Akun belum diverifikasi"}), 403

    return jsonify({"error": "Username atau password salah"}), 401
