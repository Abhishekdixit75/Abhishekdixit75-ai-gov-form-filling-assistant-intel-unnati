import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

load_dotenv()

USER = os.getenv("DB_USER", "root")
PASSWORD = os.getenv("DB_PASSWORD", "")
HOST = os.getenv("DB_HOST", "localhost")
PORT = os.getenv("DB_PORT", "3306")
NAME = os.getenv("DB_NAME", "unnati_db")

URL = f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{NAME}"

print(f"Testing connection to: {HOST}:{PORT}/{NAME} as {USER}...")

try:
    engine = create_engine(URL)
    with engine.connect() as conn:
        print("Success! Connection established.")
        result = conn.execute(text("SHOW TABLES;"))
        tables = [row[0] for row in result]
        print(f"Existing tables: {tables}")
        
        if "users" not in tables:
            print("WARNING: 'users' table MISSING.")
        else:
            print("'users' table OK.")
            
except OperationalError as e:
    print("\n[ERROR] Connection Failed!")
    print(f"Details: {e.orig}")
    print("\nTROUBLESHOOTING:")
    print("1. Check if MySQL server is running.")
    print("2. Check if database 'unnati_db' exists (Run: CREATE DATABASE unnati_db;).")
    print(f"3. Verify password for user '{USER}'.")
except Exception as e:
    print(f"\n[ERROR] Unexpected error: {e}")
