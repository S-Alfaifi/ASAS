"""Analysis Models"""
from datetime import datetime, timezone
from app import db


class AnalysisInput(db.Model):
    """Stores text inputs submitted for analysis"""
    __tablename__ = 'analysis_inputs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    input_text = db.Column(db.Text, nullable=False)
    cleaned_text = db.Column(db.Text)
    source_type = db.Column(db.String(20), default='manual')  # 'manual', 'file', 'api'
    file_name = db.Column(db.String(255))
    batch_id = db.Column(db.String(36))  # Groups file upload entries
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationship
    result = db.relationship('AnalysisResult', backref='input', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'input_text': self.input_text,
            'cleaned_text': self.cleaned_text,
            'source_type': self.source_type,
            'file_name': self.file_name,
            'batch_id': self.batch_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'result': self.result.to_dict() if self.result else None,
        }


class AnalysisResult(db.Model):
    """Stores sentiment analysis results"""
    __tablename__ = 'analysis_results'

    id = db.Column(db.Integer, primary_key=True)
    input_id = db.Column(db.Integer, db.ForeignKey('analysis_inputs.id'), nullable=False, unique=True)
    sentiment = db.Column(db.String(20), nullable=False)  # 'positive', 'negative', 'neutral'
    confidence = db.Column(db.Float, nullable=False)
    positive_score = db.Column(db.Float, default=0.0)
    negative_score = db.Column(db.Float, default=0.0)
    neutral_score = db.Column(db.Float, default=0.0)
    processing_time_ms = db.Column(db.Integer)
    model_version = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        """Serialize to dictionary"""
        return {
            'id': self.id,
            'input_id': self.input_id,
            'sentiment': self.sentiment,
            'confidence': round(self.confidence, 4),
            'positive_score': round(self.positive_score, 4),
            'negative_score': round(self.negative_score, 4),
            'neutral_score': round(self.neutral_score, 4),
            'processing_time_ms': self.processing_time_ms,
            'model_version': self.model_version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
