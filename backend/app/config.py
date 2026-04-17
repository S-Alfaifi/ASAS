"""Application Configuration"""
import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PARENT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))


class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'asas-secret-key-change-in-production-2025')

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(PARENT_DIR, "asas.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'asas-jwt-secret-key-2025')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # File uploads
    UPLOAD_FOLDER = os.path.join(PARENT_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max

    # AI Model
    MODEL_NAME = 'CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment'
    MODEL_MAX_LENGTH = 512

    # CORS
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']
