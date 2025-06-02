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

@pendingPay_bp.route('/api/pay_pending_transactions', methods=['POST'])
def pay_pending_transactions():
    data = request.json
    buyer_id = data.get("user_id")  # dari localStorage
    transaction_id = data.get("transaction_id")  # optional, untuk bayar satu transaksi

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if transaction_id:  # Bayar satu transaksi
            cursor.execute("""
                SELECT amount FROM transactions 
                WHERE transaction_id = %s AND buyer_id = %s AND payment_status = 'PENDING'
            """, (transaction_id, buyer_id))
            trx = cursor.fetchone()

            if not trx:
                return jsonify({"success": False, "error": "Transaksi tidak ditemukan atau sudah dibayar."}), 404

            amount = trx["amount"]

            # Ambil saldo user dari tabel wallets
            cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (buyer_id,))
            wallet = cursor.fetchone()
            if not wallet or wallet["balance"] < amount:
                return jsonify({"success": False, "error": "Saldo tidak mencukupi."}), 400

            # Lakukan update
            new_balance = wallet["balance"] - amount
            cursor.execute("UPDATE transactions SET payment_status = 'COMPLETED' WHERE transaction_id = %s", (transaction_id,))
            cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, buyer_id))

        else:  # Bayar semua transaksi PENDING
            cursor.execute("""
                SELECT SUM(amount) AS total_pending 
                FROM transactions 
                WHERE buyer_id = %s AND payment_status = 'PENDING'
            """, (buyer_id,))
            result = cursor.fetchone()
            total_pending = result["total_pending"] or 0

            # Ambil saldo
            cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (buyer_id,))
            wallet = cursor.fetchone()
            if not wallet or wallet["balance"] < total_pending:
                return jsonify({"success": False, "error": "Saldo tidak mencukupi untuk melunasi semua transaksi."}), 400

            new_balance = wallet["balance"] - total_pending
            cursor.execute("""
                UPDATE transactions 
                SET payment_status = 'COMPLETED' 
                WHERE buyer_id = %s AND payment_status = 'PENDING'
            """, (buyer_id,))
            cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, buyer_id))

        connection.commit()
        return jsonify({"success": True, "message": "Transaksi berhasil dibayar.", "new_balance": new_balance})

    except Exception as e:
        connection.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


