from flask import Flask
from flask_cors import CORS
from routes.materials import materials_bp
from routes.auth import auth_bp  
from routes.course import courses_bp
from routes.user import user_bp
from routes.payment import payment_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Registrasi Blueprint
app.register_blueprint(materials_bp, url_prefix='/api/materials')
app.register_blueprint(auth_bp, url_prefix='/api')  
app.register_blueprint(courses_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(payment_bp, url_prefix='/api/payment')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
