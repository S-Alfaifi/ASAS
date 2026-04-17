"""User Model"""
from datetime import datetime, timezone
from app import db
import bcrypt


class User(db.Model):
    """User account model"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    language_pref = db.Column(db.String(5), default='ar')  # 'ar' or 'en'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    analyses = db.relationship('AnalysisInput', backref='user', lazy='dynamic')
    reports = db.relationship('Report', backref='user', lazy='dynamic')

    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        """Verify password against hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        """Serialize user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'language_pref': self.language_pref,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
        }
