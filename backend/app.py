from flask import Flask
from flask_cors import CORS
from routes.materials import materials_bp
from routes.auth import auth_bp  # Pastikan ini ada!

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Registrasi Blueprint
app.register_blueprint(materials_bp, url_prefix='/api/materials')
app.register_blueprint(auth_bp, url_prefix='/api')  # Pastikan ini ada!

if __name__ == '__main__':
    app.run(debug=True, port=5000)
