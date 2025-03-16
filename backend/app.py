from flask import Flask, jsonify
from flask_cors import CORS  # Untuk mengatasi CORS
from db_connection import get_db_connection

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
 # Mengizinkan akses API dari frontend

@app.route('/api/materials', methods=['GET'])
def get_materials():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT material_id, title, category, description, price, status, uploaded_at FROM materials")
        materials = cursor.fetchall()
        return jsonify(materials)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
