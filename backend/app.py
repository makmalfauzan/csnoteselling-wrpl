from flask import Flask, jsonify
from flask_cors import CORS
from .db_connection import test_connection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app(testing=False):
    app = Flask(__name__)

    # Konfigurasi untuk testing
    if testing:
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # CORS configuration - allow all origins for development
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Import blueprints dengan error handling
    try:
        from routes.materials import materials_bp
        app.register_blueprint(materials_bp, url_prefix='/api')
        print("✅ Materials blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import materials blueprint: {e}")

    try:
        from routes.auth import auth_bp  
        app.register_blueprint(auth_bp, url_prefix='/api')
        print("✅ Auth blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import auth blueprint: {e}")

    try:
        # Coba import course.py atau courses.py
        try:
            from routes.course import courses_bp
        except ImportError:
            from routes.courses import courses_bp
        app.register_blueprint(courses_bp, url_prefix='/api')
        print("✅ Courses blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import courses blueprint: {e}")

    try:
        from routes.user import user_bp
        app.register_blueprint(user_bp, url_prefix='/api/user')
        print("✅ User blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import user blueprint: {e}")

    try:
        from routes.payment import payment_bp
        app.register_blueprint(payment_bp, url_prefix='/api')
        print("✅ Payment blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import payment blueprint: {e}")

    try:
        from routes.dbuyerrecommend import dbuyerrecommend_bp
        app.register_blueprint(dbuyerrecommend_bp, url_prefix='/api/dbuyerrecommend')
        print("✅ Buyer recommend blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import dbuyerrecommend blueprint: {e}")

    try:
        from routes.wallet import wallets_bp
        app.register_blueprint(wallets_bp, url_prefix='/api/wallets')
        print("✅ Wallets blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import wallets blueprint: {e}")

    try:
        from routes.uploadfile import uploadfile_bp
        app.register_blueprint(uploadfile_bp, url_prefix='/api/uploadfile')
        print("✅ Upload file blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import uploadfile blueprint: {e}")

    try:
        from routes.ordersbuyer import orders_bp
        app.register_blueprint(orders_bp)
        print("✅ Orders blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import orders blueprint: {e}")

    try:
        from routes.seller_ttlproduct import seller_bp
        app.register_blueprint(seller_bp)
        print("✅ Seller blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import seller_ttlproduct blueprint: {e}")

    try:
        from routes.seller_products import seller_products_bp
        app.register_blueprint(seller_products_bp)
        print("✅ Seller products blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import seller_products blueprint: {e}")

    try:
        from routes.pending_payment import pendingPay_bp
        app.register_blueprint(pendingPay_bp)
        print("✅ Pending payment blueprint registered")
    except ImportError as e:
        print(f"❌ Failed to import pending_payment blueprint: {e}")

    # Basic routes
    @app.route('/')
    def home():
        return jsonify({
            "message": "CS Note Selling API is running!",
            "status": "success",
            "version": "1.0"
        })

    @app.route('/health')
    def health_check():
        db_status = test_connection()
        return jsonify({
            "status": "healthy" if db_status else "unhealthy",
            "database": "connected" if db_status else "disconnected",
            "api": "running"
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Endpoint not found",
            "status": 404
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal server error",
            "status": 500
        }), 500

    return app

# Untuk run biasa
if __name__ == '__main__':
    print("Starting CS Note Selling API...")
    print("Testing database connection...")
    
    if test_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed!")
    
    app = create_app()
    app.run(
        debug=True, 
        port=int(os.getenv('FLASK_RUN_PORT', 5000)), 
        host='0.0.0.0'
    )