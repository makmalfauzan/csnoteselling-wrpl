from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS

pendingPay_bp = Blueprint('pendingPay', __name__)
CORS(pendingPay_bp)

@pendingPay_bp.route('/pending-transactions', methods=['GET'])
def get_pending_transactions():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID diperlukan"}), 400

        query = '''
        SELECT t.transaction_id, m.material_id, m.title, u.username AS seller, 
               t.amount, t.transaction_date, t.payment_status
        FROM transactions t
        JOIN materials m ON t.material_id = m.material_id
        JOIN users u ON t.seller_id = u.user_id
        WHERE t.payment_status = 'PENDING' AND t.buyer_id = %s
        '''
        
        cursor.execute(query, (user_id,))
        transactions = cursor.fetchall()
        
        return jsonify(transactions)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()
