from flask import Blueprint, request, jsonify
from flask_cors import CORS
import datetime
import mysql.connector
from ..db_connection import get_db_connection

uploadfile_bp = Blueprint('uploadfile', __name__)
CORS(uploadfile_bp)


# API untuk mendapatkan daftar mata kuliah dari tabel courses
@uploadfile_bp.route('/courses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT course_id, course_name FROM courses")  # Ambil id dan nama mata kuliah
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(courses)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# API untuk mengunggah materi
@uploadfile_bp.route('/upload', methods=['POST'])
def upload_material():
    try:
        seller_id = request.form.get("seller_id")
        title = request.form.get("title")
        course_id = request.form.get("course_id")
        material = request.form.get("material")  # Nama materi
        category = request.form.get("category")
        price = request.form.get("price")
        description = request.form.get("description")
        filename = request.form.get("filename")
        file_size = request.form.get("file_size")

        # Buat dummy path file
        dummy_path = f"/files/{filename}"

        conn = get_db_connection()
        cursor = conn.cursor()

        # Masukkan data ke tabel `materials`
        cursor.execute("""
            INSERT INTO materials (seller_id, title, course_id, materi, category, price, description, file_path, file_size, uploaded_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (seller_id, title, course_id, material, category, price, description, dummy_path, file_size, datetime.datetime.now()))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "File uploaded & saved to database", "file_path": dummy_path})

    except Exception as e:
        return jsonify({"error": str(e)}), 500