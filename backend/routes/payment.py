from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS
from datetime import datetime
from decimal import Decimal

payment_bp = Blueprint('payment', __name__)
CORS(payment_bp)

# **Endpoint untuk mendapatkan saldo user**
@payment_bp.route('/wallet', methods=['GET'])
def get_wallet_balance():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID diperlukan"}), 400

        cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()

        if result:
            return jsonify({"balance": result['balance']})
        else:
            return jsonify({"error": "Saldo tidak ditemukan"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# **Endpoint untuk checkout transaksi**
@payment_bp.route('/checkout', methods=['POST'])
def checkout():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        data = request.json
        user_id = data.get("user_id")
        items = data.get("items")  # List produk yang dibeli

        if not user_id or not items:
            return jsonify({"error": "User ID dan item diperlukan"}), 400

        # Cek apakah ada transaksi PENDING yang sudah ada untuk produk yang ada dalam keranjang
        pending_transactions = []
        for item in items:
            material_id = item.get("id")
            cursor.execute("""
                SELECT * FROM transactions WHERE buyer_id = %s AND material_id = %s AND payment_status = 'PENDING'
            """, (user_id, material_id))
            pending_transactions += cursor.fetchall()

        if pending_transactions:
            return jsonify({"error": "Anda sudah memiliki transaksi PENDING untuk produk-produk ini. Silakan lunasi terlebih dahulu."}), 400

        # Ambil saldo buyer dengan LOCK untuk menghindari race condition
        cursor.execute("SELECT balance FROM wallets WHERE user_id = %s FOR UPDATE", (user_id,))
        wallet = cursor.fetchone()

        if not wallet:
            return jsonify({"error": "Saldo tidak ditemukan"}), 404

        balance = Decimal(str(wallet["balance"]))
        total_cost = Decimal("0")
        seller_earnings = {}  # Menyimpan saldo tambahan untuk setiap seller

        # **Ambil harga tiap produk dan hitung total biaya**
        for item in items:
            material_id = item.get("id")
            quantity = item.get("quantity", 1)

            cursor.execute("SELECT price, seller_id FROM materials WHERE material_id = %s", (material_id,))
            material = cursor.fetchone()

            if not material:
                return jsonify({"error": f"Produk {material_id} tidak ditemukan"}), 404

            amount = Decimal(str(material["price"])) * quantity
            seller_id = material["seller_id"]
            total_cost += amount

            # Pastikan seller_id valid
            if not seller_id:
                return jsonify({"error": f"Produk {material_id} tidak memiliki seller"}), 400

            # Hitung saldo yang akan ditambahkan ke seller
            if seller_id in seller_earnings:
                seller_earnings[seller_id] += amount
            else:
                seller_earnings[seller_id] = amount

        # **Cek apakah saldo mencukupi**
        if balance < total_cost:
            # Jika saldo tidak cukup, masukkan transaksi dengan status PENDING
            transaction_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            for item in items:
                material_id = item.get("id")
                quantity = item.get("quantity", 1)

                cursor.execute("SELECT price, seller_id FROM materials WHERE material_id = %s", (material_id,))
                material = cursor.fetchone()

                if material:
                    amount = Decimal(str(material["price"])) * quantity
                    seller_id = material["seller_id"]

                    cursor.execute("""
                        INSERT INTO transactions (material_id, buyer_id, seller_id, amount, transaction_date, payment_status)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (material_id, user_id, seller_id, amount, transaction_date, "PENDING"))

            conn.commit()
            return jsonify({
                "success": True,
                "message": "Saldo tidak mencukupi. Transaksi disimpan dengan status PENDING.",
                "new_balance": str(balance),
                "seller_balances": seller_earnings
            })

        # **Kurangi saldo buyer dan buat transaksi untuk setiap item jika saldo cukup**
        new_balance = balance - total_cost
        cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, user_id))

        # **Buat transaksi untuk setiap item**
        transaction_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        for item in items:
            material_id = item.get("id")
            quantity = item.get("quantity", 1)

            cursor.execute("SELECT price, seller_id FROM materials WHERE material_id = %s", (material_id,))
            material = cursor.fetchone()

            if material:
                amount = Decimal(str(material["price"])) * quantity
                seller_id = material["seller_id"]

                cursor.execute("""
                    INSERT INTO transactions (material_id, buyer_id, seller_id, amount, transaction_date, payment_status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (material_id, user_id, seller_id, amount, transaction_date, "COMPLETED"))

        # **Tambahkan saldo kepada seller**
        updated_seller_balances = {}  # Untuk mengembalikan saldo seller yang baru

        for seller_id, earning in seller_earnings.items():
            cursor.execute("SELECT balance FROM wallets WHERE user_id = %s FOR UPDATE", (seller_id,))
            seller_wallet = cursor.fetchone()

            if seller_wallet:
                new_seller_balance = seller_wallet["balance"] + earning
                cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_seller_balance, seller_id))
                updated_seller_balances[seller_id] = str(new_seller_balance)
            else:
                # Jika seller belum punya wallet, buatkan wallet baru
                cursor.execute("INSERT INTO wallets (user_id, balance) VALUES (%s, %s)", (seller_id, earning))
                updated_seller_balances[seller_id] = str(earning)

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Transaksi berhasil!",
            "new_balance": str(new_balance),
            "seller_balances": updated_seller_balances
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@payment_bp.route('/update_payment_status', methods=['POST'])
def update_payment_status():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        data = request.json
        transaction_id = data.get("transaction_id")
        user_id = data.get("user_id")

        if not transaction_id or not user_id:
            return jsonify({"error": "Transaction ID dan User ID diperlukan"}), 400

        # Cek apakah transaksi PENDING
        cursor.execute("""
            SELECT * FROM transactions WHERE transaction_id = %s AND buyer_id = %s AND payment_status = 'PENDING'
        """, (transaction_id, user_id))
        transaction = cursor.fetchone()

        if not transaction:
            return jsonify({"error": "Transaksi tidak ditemukan atau sudah lunas"}), 404

        # Update status transaksi menjadi COMPLETED
        cursor.execute("""
            UPDATE transactions 
            SET payment_status = 'COMPLETED' 
            WHERE transaction_id = %s
        """, (transaction_id,))

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Status pembayaran berhasil diperbarui ke COMPLETED"
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# **API untuk mengambil transaksi seller**
@payment_bp.route('/seller_transactions/<int:user_id>', methods=['GET'])
def get_seller_transactions(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT material_id, amount, transaction_date FROM transactions 
            WHERE seller_id = %s AND payment_status = 'COMPLETED'
        """, (user_id,))
        
        transactions = cursor.fetchall()
        return jsonify(transactions)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@payment_bp.route('/payment/seller_sales/<int:seller_id>', methods=['GET'])
def get_seller_sales(seller_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT t.transaction_id, t.buyer_id, u.username AS buyer_username, 
                   m.title, t.amount, t.transaction_date, t.payment_status
            FROM transactions t
            JOIN materials m ON t.material_id = m.material_id
            JOIN users u ON t.buyer_id = u.user_id
            WHERE m.seller_id = %s
            ORDER BY t.transaction_date DESC
        """, (seller_id,))
        
        transactions = cursor.fetchall()
        return jsonify(transactions)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@payment_bp.route('/payment/buyer_orders/<int:buyer_id>', methods=['GET'])
def get_buyer_orders(buyer_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT t.transaction_id, m.seller_id, u.username AS seller_username, 
                   m.title, t.amount, t.transaction_date, t.payment_status
            FROM transactions t
            JOIN materials m ON t.material_id = m.material_id
            JOIN users u ON m.seller_id = u.user_id
            WHERE t.buyer_id = %s
            ORDER BY t.transaction_date DESC
        """, (buyer_id,))
        
        transactions = cursor.fetchall()
        return jsonify(transactions)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


