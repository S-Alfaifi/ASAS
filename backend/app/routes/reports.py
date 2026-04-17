"""Report Routes — Generate and manage summary reports"""
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.analysis import AnalysisInput, AnalysisResult
from app.models.report import Report

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('', methods=['GET'])
@jwt_required()
def list_reports():
    """List all reports for the user"""
    user_id = int(get_jwt_identity())
    reports = Report.query.filter_by(user_id=user_id) \
        .order_by(Report.created_at.desc()).all()

    return jsonify({
        'reports': [r.to_dict() for r in reports],
    }), 200


@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_report():
    """Generate a summary report from analysis history"""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', f'Report - {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")}')

    # Date range filter
    date_from = None
    date_to = None
    if data.get('date_from'):
        date_from = datetime.fromisoformat(data['date_from'])
    if data.get('date_to'):
        date_to = datetime.fromisoformat(data['date_to'])

    # Query analyses
    query = db.session.query(AnalysisResult).join(AnalysisInput).filter(
        AnalysisInput.user_id == user_id
    )

    if date_from:
        query = query.filter(AnalysisInput.created_at >= date_from)
    if date_to:
        query = query.filter(AnalysisInput.created_at <= date_to)

    results = query.all()

    if not results:
        return jsonify({'error': 'No analyses found for the given period'}), 404

    # Calculate stats
    total = len(results)
    pos = sum(1 for r in results if r.sentiment == 'positive')
    neg = sum(1 for r in results if r.sentiment == 'negative')
    neu = sum(1 for r in results if r.sentiment == 'neutral')
    avg_conf = sum(r.confidence for r in results) / total

    report = Report(
        user_id=user_id,
        title=title,
        description=data.get('description', ''),
        total_analyzed=total,
        positive_count=pos,
        negative_count=neg,
        neutral_count=neu,
        avg_confidence=avg_conf,
        date_from=date_from,
        date_to=date_to,
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({
        'message': 'Report generated successfully',
        'report': report.to_dict(),
    }), 201


@reports_bp.route('/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    """Get a single report"""
    user_id = int(get_jwt_identity())
    report = Report.query.filter_by(id=report_id, user_id=user_id).first()

    if not report:
        return jsonify({'error': 'Report not found'}), 404

    return jsonify({'report': report.to_dict()}), 200


@reports_bp.route('/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report(report_id):
    """Delete a report"""
    user_id = int(get_jwt_identity())
    report = Report.query.filter_by(id=report_id, user_id=user_id).first()

    if not report:
        return jsonify({'error': 'Report not found'}), 404

    db.session.delete(report)
    db.session.commit()

    return jsonify({'message': 'Report deleted'}), 200
