from flask import Blueprint, jsonify
from db_connection import get_db_connection
from flask_cors import CORS

# Membuat Blueprint untuk materials

courses_bp = Blueprint('courses', __name__)
CORS(courses_bp)

@courses_bp.route('/courses', methods=['GET'])
def get_courses():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT course_id, course_name FROM course")
    courses = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(courses)  # Kirim data ke frontend
