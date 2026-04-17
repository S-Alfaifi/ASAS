"""AI Model Registry — tracks available sentiment models"""
from datetime import datetime, timezone
from app import db


class AIModel(db.Model):
    """Registry of available AI sentiment models"""
    __tablename__ = 'ai_models'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    huggingface_id = db.Column(db.String(255), nullable=False, unique=True)
    description = db.Column(db.Text)
    description_ar = db.Column(db.Text)
    architecture = db.Column(db.String(100))
    source = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=False, index=True)
    is_downloaded = db.Column(db.Boolean, default=False)
    added_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_used_at = db.Column(db.DateTime)

    # Label mapping JSON (stored as string)
    label_map = db.Column(db.Text, default='{}')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'huggingface_id': self.huggingface_id,
            'description': self.description,
            'description_ar': self.description_ar,
            'architecture': self.architecture,
            'source': self.source,
            'is_active': self.is_active,
            'is_downloaded': self.is_downloaded,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
        }
