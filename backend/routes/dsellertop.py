from flask import Blueprint, jsonify
from db_connection import get_db_connection

# Ubah nama blueprint dari dbuyerrecommend_bp -> dsellertop_bp
dsellertop_bp = Blueprint('dsellertop', __name__)

@dsellertop_bp.route('/recommended', methods=['GET'])
def get_recommended():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    sql = """
    SELECT
        materi,
        title,
        price
    FROM materials
    ORDER BY RAND()
    LIMIT 4
    """
    
    cursor.execute(sql)
    data = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(data)