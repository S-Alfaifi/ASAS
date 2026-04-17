"""Dashboard Routes — Stats and charts data"""
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.analysis import AnalysisInput, AnalysisResult
from app.services.sentiment import SentimentService

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get dashboard overview statistics"""
    user_id = int(get_jwt_identity())

    # Total analyses
    total = AnalysisInput.query.filter_by(user_id=user_id).count()

    # Sentiment distribution
    sentiment_counts = db.session.query(
        AnalysisResult.sentiment,
        func.count(AnalysisResult.id)
    ).join(AnalysisInput).filter(
        AnalysisInput.user_id == user_id
    ).group_by(AnalysisResult.sentiment).all()

    distribution = {'positive': 0, 'negative': 0, 'neutral': 0}
    for sentiment, count in sentiment_counts:
        distribution[sentiment] = count

    # Average confidence
    avg_confidence = db.session.query(
        func.avg(AnalysisResult.confidence)
    ).join(AnalysisInput).filter(
        AnalysisInput.user_id == user_id
    ).scalar() or 0

    # Today's analyses
    today = datetime.now(timezone.utc).date()
    today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    today_count = AnalysisInput.query.filter(
        AnalysisInput.user_id == user_id,
        AnalysisInput.created_at >= today_start,
    ).count()

    # Recent analyses (last 5)
    recent = AnalysisInput.query.filter_by(user_id=user_id) \
        .order_by(AnalysisInput.created_at.desc()).limit(5).all()

    return jsonify({
        'total_analyses': total,
        'today_analyses': today_count,
        'sentiment_distribution': distribution,
        'avg_confidence': round(avg_confidence, 4),
        'recent_analyses': [a.to_dict() for a in recent],
        'model_ready': SentimentService.is_ready(),
    }), 200


@dashboard_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_trends():
    """Get sentiment trends over the last 30 days"""
    user_id = int(get_jwt_identity())
    days = request.args.get('days', 30, type=int)
    days = min(days, 365)

    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    results = db.session.query(
        func.date(AnalysisInput.created_at).label('date'),
        AnalysisResult.sentiment,
        func.count(AnalysisResult.id).label('count')
    ).join(AnalysisResult).filter(
        AnalysisInput.user_id == user_id,
        AnalysisInput.created_at >= start_date,
    ).group_by(
        func.date(AnalysisInput.created_at),
        AnalysisResult.sentiment
    ).order_by('date').all()

    # Format for chart
    trends = {}
    for date, sentiment, count in results:
        date_str = str(date)
        if date_str not in trends:
            trends[date_str] = {'date': date_str, 'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0}
        trends[date_str][sentiment] = count
        trends[date_str]['total'] += count

    return jsonify({
        'trends': list(trends.values()),
        'period_days': days,
    }), 200
