import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

USER = os.getenv("DB_USER", "root")
PASSWORD = os.getenv("DB_PASSWORD", "")
HOST = os.getenv("DB_HOST", "localhost")
PORT = os.getenv("DB_PORT", "3306")
NAME = os.getenv("DB_NAME", "unnati_db")

URL = f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{NAME}"

print(f"Connecting to: {NAME}...")
engine = create_engine(URL)

with engine.connect() as conn:
    print("Dropping tables...")
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    conn.execute(text("DROP TABLE IF EXISTS user_profiles;"))
    conn.execute(text("DROP TABLE IF EXISTS users;"))
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    print("Tables dropped.")
