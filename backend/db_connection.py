import os
import mysql.connector
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Ambil DATABASE_URL dari environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

def parse_database_url(database_url):
    """Parse DATABASE_URL untuk berbagai format"""
    if not database_url:
        raise ValueError("DATABASE_URL not found!")
    
    try:
        # Format: mysql://user:password@host:port/database
        if database_url.startswith("mysql://"):
            # Remove mysql:// prefix
            url = database_url[8:]
            
            # Split user:password@host:port/database
            if "@" in url:
                auth_part, host_part = url.split("@", 1)
                user, password = auth_part.split(":", 1)
            else:
                raise ValueError("Invalid DATABASE_URL format")
            
            if "/" in host_part:
                host_port, database = host_part.split("/", 1)
            else:
                raise ValueError("Invalid DATABASE_URL format - missing database")
            
            if ":" in host_port:
                host, port = host_port.split(":", 1)
                port = int(port)
            else:
                host = host_port
                port = 3306
            
            return {
                "host": host,
                "port": port,
                "user": user,
                "password": password,
                "database": database
            }
        else:
            raise ValueError("DATABASE_URL must start with mysql://")
            
    except Exception as e:
        raise ValueError(f"Error parsing DATABASE_URL: {e}")

# Parse MySQL URL
db_config = parse_database_url(DATABASE_URL)

# Koneksi ke database dengan error handling
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=db_config["host"],
            port=db_config["port"],
            user=db_config["user"],
            password=db_config["password"],
            database=db_config["database"],
            charset='utf8mb4',
            autocommit=True
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

# Test connection function
def test_connection():
    """Test database connection"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            print("✅ Database connection successful!")
            return True
        except Exception as e:
            print(f"❌ Database test failed: {e}")
            return False
    else:
        print("❌ Could not establish database connection")
        return False

if __name__ == "__main__":
    # Test connection when run directly
    test_connection()