"""FileJob Model — Tracks background file analysis jobs"""
from datetime import datetime, timezone
from app import db


class FileJob(db.Model):
    """Tracks the status of background file analysis jobs"""
    __tablename__ = 'file_jobs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    batch_id = db.Column(db.String(36), nullable=False, unique=True, index=True)
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    file_name = db.Column(db.String(255))
    total_rows = db.Column(db.Integer, default=0)
    processed_rows = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)

    # Summary fields (populated on completion)
    summary_positive = db.Column(db.Integer, default=0)
    summary_negative = db.Column(db.Integer, default=0)
    summary_neutral = db.Column(db.Integer, default=0)

    def to_dict(self):
        """Serialize to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'batch_id': self.batch_id,
            'status': self.status,
            'file_name': self.file_name,
            'total_rows': self.total_rows,
            'processed_rows': self.processed_rows,
            'progress': round(self.processed_rows / self.total_rows * 100, 1) if self.total_rows > 0 else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'error_message': self.error_message,
            'summary': {
                'total': self.total_rows,
                'positive': self.summary_positive,
                'negative': self.summary_negative,
                'neutral': self.summary_neutral,
            } if self.status == 'completed' else None,
        }
