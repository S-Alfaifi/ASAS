"""Report Model"""
from datetime import datetime, timezone
from app import db


class Report(db.Model):
    """Stores generated summary reports"""
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    total_analyzed = db.Column(db.Integer, default=0)
    positive_count = db.Column(db.Integer, default=0)
    negative_count = db.Column(db.Integer, default=0)
    neutral_count = db.Column(db.Integer, default=0)
    avg_confidence = db.Column(db.Float, default=0.0)
    date_from = db.Column(db.DateTime)
    date_to = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        """Serialize to dictionary"""
        total = self.total_analyzed or 1  # Avoid division by zero
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'total_analyzed': self.total_analyzed,
            'positive_count': self.positive_count,
            'negative_count': self.negative_count,
            'neutral_count': self.neutral_count,
            'positive_pct': round((self.positive_count / total) * 100, 1),
            'negative_pct': round((self.negative_count / total) * 100, 1),
            'neutral_pct': round((self.neutral_count / total) * 100, 1),
            'avg_confidence': round(self.avg_confidence, 4),
            'date_from': self.date_from.isoformat() if self.date_from else None,
            'date_to': self.date_to.isoformat() if self.date_to else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
