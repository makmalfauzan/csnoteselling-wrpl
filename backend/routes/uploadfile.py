# routes/uploadfile.py
from flask import Blueprint, request, jsonify
import os
from db_connection import get_db_connection  # Menggunakan koneksi yang sama

uploadfile_bp = Blueprint('uploadfile_bp', __name__)

UPLOAD_FOLDER = 'uploads'

@uploadfile_bp.route('/upload', methods=['POST'])
def upload_file():
    # Cek apakah request mengandung file
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    # Pastikan folder uploads ada
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    # Simpan file secara fisik
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Ambil data tambahan dari form (pastikan field sesuai di HTML)
    title = request.form.get('title', '')
    description = request.form.get('description', '')
    price = request.form.get('price', 0)

    # Simpan metadata ke database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO materials (title, filename, description, price)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (title, file.filename, description, price))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

    return jsonify({'message': 'File uploaded and data saved successfully'}), 200