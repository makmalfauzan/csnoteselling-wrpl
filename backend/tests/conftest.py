import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app  # Sekarang tanpa "backend.app"
import pytest

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        with app.app_context():
            yield client
