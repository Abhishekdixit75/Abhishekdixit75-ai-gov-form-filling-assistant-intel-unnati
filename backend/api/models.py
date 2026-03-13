import os
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from sqlalchemy.types import TypeDecorator
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# We expect a symmetric encryption key to be provided in .env
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "sA9EsLl_nnPyOCnLDn2oyNOYPaS_EEoWSmZ8V5tP9xM=").strip()

try:
    fernet = Fernet(ENCRYPTION_KEY.encode('utf-8'))
except ValueError:
    # Use fallback if key is invalid length
    fernet = Fernet(b'sA9EsLl_nnPyOCnLDn2oyNOYPaS_EEoWSmZ8V5tP9xM=')

class EncryptedString(TypeDecorator):
    """
    Transparently encrypts outgoing Strings and decrypts incoming Strings using AES Symmetric Encryption.
    This prevents sensitive Personally Identifiable Information (PII) from sitting in the DB as plain text.
    """
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        # Encrypt the string and return it as a string so SQLAlchemy can store it
        return fernet.encrypt(value.encode('utf-8')).decode('utf-8')

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        try:
            # Decrypt back to a standard string
            return fernet.decrypt(value.encode('utf-8')).decode('utf-8')
        except Exception:
            # If decryption fails (e.g. data is old/unencrypted), return the raw value
            return value

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile_entries = relationship("UserProfile", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    entity_key = Column(String(255), index=True)  # e.g. "aadhaar_number"
    
    # 🔒 SECURE ENCRYPTED STORAGE 
    value = Column(EncryptedString(2048)) # Larger storage for values
    confidence = Column(Float, default=1.0)
    source = Column(String(50), default="user_edit")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile_entries")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    form_type = Column(String(255))
    status = Column(String(50), default="in_progress") # in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="applications")

# Update User to include applications relationship
User.applications = relationship("Application", back_populates="user")
