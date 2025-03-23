from flask import Blueprint, request, jsonify
import os
import uuid
from db_connection import get_db_connection

uploadfile_bp = Blueprint('uploadfile_bp', __name__)
UPLOAD_FOLDER = os.path.abspath('uploads')
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@uploadfile_bp.route('/upload', methods=['POST'])
def upload_file():
    # Debug: Print data form untuk memastikan parameter terkirim
    print("Request Form Data:", request.form.to_dict())

    # Pastikan seller_id dan course_id ada
    seller_id = request.form.get('seller_id')
    course_id = request.form.get('course_id')
    if not seller_id or not course_id:
        return jsonify({"message": "seller_id and course_id are required"}), 400

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
    subject = request.form.get('subject', '')
    materi = request.form.get('materi', '')
    jenis = request.form.get('jenis', '')
    category = request.form.get('category', 'Others')
    description = request.form.get('description', '')
    price = request.form.get('price', 0)
    status = request.form.get('status', 'ACTIVE')

    # Hitung ukuran file (dalam byte)
    file_size = os.path.getsize(file_path)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Pastikan kolom-kolom yang di-insert sesuai dengan struktur tabel di DB
        sql = """
            INSERT INTO materials 
            (seller_id, course_id, title, subject, materi, jenis, category, description, file_path, file_size, price, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (seller_id, course_id, title, subject, materi, jenis, category, description, file_path, file_size, price, status))
        conn.commit()
    except Exception as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'File uploaded and data saved successfully'}), 200