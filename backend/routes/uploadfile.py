from flask import Blueprint, request, jsonify
import os
import uuid
from db_connection import get_db_connection
from decimal import Decimal
from flask_cors import CORS

uploadfile_bp = Blueprint('uploadfile_bp', __name__)
UPLOAD_FOLDER = os.path.abspath('uploads')
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@uploadfile_bp.route('/upload', methods=['POST'])
def upload_file():
    # Debug: Print data form untuk memastikan parameter terkirim
    print("Request Form Data:", request.form.to_dict())

    # Ambil seller_id (WAJIB ada)
    seller_id = request.form.get('seller_id')
    if not seller_id:
        return jsonify({"message": "seller_id is required"}), 400

    # Cek apakah file ada di request
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'message': 'File type not allowed'}), 400

    # Pastikan folder uploads ada
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Generate nama file unik
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Ambil data tambahan dari form
    title = request.form.get('title', '')
    course = request.form.get('course', '')      # di DB namanya 'course'
    materi = request.form.get('materi', '')
    category = request.form.get('category', 'Others')
    description = request.form.get('description', '')
    price_str = request.form.get('price', '0').replace(',', '.')
    status = request.form.get('status', 'ACTIVE')

    # Parsing price menjadi Decimal
    try:
        price_decimal = Decimal(price_str)
    except Exception as e:
        return jsonify({"message": "Price format invalid", "error": str(e)}), 400

    # Hitung ukuran file (dalam byte)
    file_size = os.path.getsize(file_path)

    # Simpan ke DB
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Pastikan kolom sesuai dengan tabel: seller_id, title, course, materi, category, description,
        # file_path, file_size, price, status
        sql = """
            INSERT INTO materials
            (seller_id, title, course, materi, category, description, file_path, file_size, price, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            seller_id,
            title,
            course,
            materi,
            category,
            description,
            file_path,
            file_size,
            price_decimal,
            status
        ))
        conn.commit()
    except Exception as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'File uploaded and data saved successfully'}), 200