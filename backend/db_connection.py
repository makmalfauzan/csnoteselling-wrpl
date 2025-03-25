import os
import mysql.connector
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Ambil DATABASE_URL dari environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Parse MySQL URL
if DATABASE_URL:
    db_config = {
        "host": DATABASE_URL.split("@")[1].split(":")[0],
        "port": DATABASE_URL.split(":")[-1].split("/")[0],
        "user": DATABASE_URL.split("//")[1].split(":")[0],
        "password": DATABASE_URL.split(":")[2].split("@")[0],
        "database": DATABASE_URL.split("/")[-1]
    }
else:
    raise ValueError("DATABASE_URL not found!")

# Koneksi ke database
def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

# Penanganan error
def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
