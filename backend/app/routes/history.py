"""History Routes — View and manage past analyses"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.analysis import AnalysisInput

history_bp = Blueprint('history', __name__)


@history_bp.route('', methods=['GET'])
@jwt_required()
def get_history():
    """Get paginated analysis history"""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    source_type = request.args.get('source', None)
    sentiment = request.args.get('sentiment', None)

    per_page = min(per_page, 100)  # Cap at 100

    query = AnalysisInput.query.filter_by(user_id=user_id)

    if source_type:
        query = query.filter_by(source_type=source_type)

    if sentiment:
        from app.models.analysis import AnalysisResult
        query = query.join(AnalysisResult).filter(AnalysisResult.sentiment == sentiment)

    query = query.order_by(AnalysisInput.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
    }), 200


@history_bp.route('/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    """Get a single analysis detail"""
    user_id = int(get_jwt_identity())
    item = AnalysisInput.query.filter_by(id=analysis_id, user_id=user_id).first()

    if not item:
        return jsonify({'error': 'Analysis not found'}), 404

    return jsonify({'analysis': item.to_dict()}), 200


@history_bp.route('/<int:analysis_id>', methods=['DELETE'])
@jwt_required()
def delete_analysis(analysis_id):
    """Delete a single analysis"""
    user_id = int(get_jwt_identity())
    item = AnalysisInput.query.filter_by(id=analysis_id, user_id=user_id).first()

    if not item:
        return jsonify({'error': 'Analysis not found'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Analysis deleted'}), 200


@history_bp.route('/batch/<batch_id>', methods=['GET'])
@jwt_required()
def get_batch(batch_id):
    """Get all analyses from a file upload batch"""
    user_id = int(get_jwt_identity())
    items = AnalysisInput.query.filter_by(
        user_id=user_id, batch_id=batch_id
    ).order_by(AnalysisInput.created_at.asc()).all()

    if not items:
        return jsonify({'error': 'Batch not found'}), 404

    sentiments = [i.result.sentiment for i in items if i.result]
    summary = {
        'batch_id': batch_id,
        'total': len(items),
        'positive': sentiments.count('positive'),
        'negative': sentiments.count('negative'),
        'neutral': sentiments.count('neutral'),
        'file_name': items[0].file_name if items else None,
    }

    return jsonify({
        'summary': summary,
        'items': [item.to_dict() for item in items],
    }), 200
