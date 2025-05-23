import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import create_app
from db_connection import db  # SESUAIKAN dengan letak `db` kamu

from app.models import User, Wallet, Transaction  # sesuaikan

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        with app.app_context():
            db.session.query(Transaction).delete()
            db.session.query(Wallet).delete()
            db.session.query(User).delete()
            db.session.commit()
            yield client
