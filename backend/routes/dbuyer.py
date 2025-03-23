from flask import Blueprint, request, jsonify
from db_connection import get_db_connection

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/courses', methods=['GET'])
def get_courses():
    # Ambil query string 'q' jika ada
    search_query = request.args.get('q', '')
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if search_query:
        # Jika ada query, filter course berdasarkan kata kunci
        sql = "SELECT * FROM courses WHERE course_name LIKE %s"
        cursor.execute(sql, ('%' + search_query + '%',))
    else:
        # Jika tidak ada query, tampilkan semua courses
        sql = "SELECT * FROM courses"
        cursor.execute(sql)
    
    courses = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(courses)