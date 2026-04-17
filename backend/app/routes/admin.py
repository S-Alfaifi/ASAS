"""Admin Routes — User management, system stats, model info"""
from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.user import User
from app.models.analysis import AnalysisInput, AnalysisResult
from app.models.report import Report
from app.models.ai_model import AIModel
from app.services.sentiment import SentimentService
from app.services.preprocessing import ArabicPreprocessor
import pandas as pd
import os
from datetime import datetime, timezone

admin_bp = Blueprint('admin', __name__)


def admin_required(fn):
    """Decorator to restrict access to admin users only"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


# ──────────────── USERS ────────────────

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    """List all users with stats"""
    users = User.query.order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        analysis_count = AnalysisInput.query.filter_by(user_id=u.id).count()
        result.append({
            **u.to_dict(),
            'analysis_count': analysis_count,
        })
    return jsonify({'users': result, 'total': len(result)}), 200


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user role or status"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    if 'role' in data and data['role'] in ('user', 'admin'):
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({'message': 'User updated', 'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user and all their data"""
    current_user_id = int(get_jwt_identity())
    if user_id == current_user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Delete user's analyses, results, and reports
    inputs = AnalysisInput.query.filter_by(user_id=user_id).all()
    for inp in inputs:
        db.session.delete(inp)
    Report.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f'User {user.username} deleted'}), 200


# ──────────────── SYSTEM STATS ────────────────

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def system_stats():
    """Global system statistics"""
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_analyses = AnalysisInput.query.count()
    total_reports = Report.query.count()

    # Sentiment distribution (global)
    sentiment_counts = db.session.query(
        AnalysisResult.sentiment,
        func.count(AnalysisResult.id)
    ).group_by(AnalysisResult.sentiment).all()

    distribution = {'positive': 0, 'negative': 0, 'neutral': 0}
    for sentiment, count in sentiment_counts:
        distribution[sentiment] = count

    # Average confidence (global)
    avg_confidence = db.session.query(
        func.avg(AnalysisResult.confidence)
    ).scalar() or 0

    # Average processing time
    avg_time = db.session.query(
        func.avg(AnalysisResult.processing_time_ms)
    ).scalar() or 0

    # Top users by analysis count
    top_users = db.session.query(
        User.username,
        func.count(AnalysisInput.id).label('count')
    ).join(AnalysisInput).group_by(User.id).order_by(
        func.count(AnalysisInput.id).desc()
    ).limit(5).all()

    # Source type breakdown
    source_counts = db.session.query(
        AnalysisInput.source_type,
        func.count(AnalysisInput.id)
    ).group_by(AnalysisInput.source_type).all()
    sources = {s: c for s, c in source_counts}

    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'total_analyses': total_analyses,
        'total_reports': total_reports,
        'sentiment_distribution': distribution,
        'avg_confidence': round(avg_confidence, 4),
        'avg_processing_time_ms': round(avg_time, 1),
        'top_users': [{'username': u, 'count': c} for u, c in top_users],
        'source_breakdown': sources,
    }), 200


# ──────────────── MODEL INFO ────────────────

@admin_bp.route('/model', methods=['GET'])
@admin_required
def model_info():
    """Get AI model status and info"""
    # Pull dynamic info from the active model record
    active_model = AIModel.query.filter_by(is_active=True).first()
    return jsonify({
        'model_name': SentimentService.get_current_model() or 'Not loaded',
        'is_ready': SentimentService.is_ready(),
        'labels': ['positive', 'negative', 'neutral'],
        'max_length': 512,
        'framework': 'PyTorch + HuggingFace Transformers',
        'architecture': active_model.architecture if active_model else 'Unknown',
        'source': active_model.source if active_model else 'Unknown',
    }), 200

@admin_bp.route('/evaluate_model', methods=['POST'])
@admin_required
def evaluate_model():
    """Run performance check against 999 golden dataset rows"""
    import time
    file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model_performance_golden.csv')
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return jsonify({'error': f'Golden dataset not found: {str(e)}'}), 404

    start_time = time.time()
    correct = 0
    total = 0
    errors_by_class = {'positive': 0, 'negative': 0, 'neutral': 0}
    totals_by_class = {'positive': 0, 'negative': 0, 'neutral': 0}
    wrong_guesses = []
    
    for _, row in df.iterrows():
        text = str(row['Text'])
        true_label = str(row['True_Label']).lower()
        cleaned = ArabicPreprocessor.preprocess(text)
        if not cleaned:
            continue
            
        prediction = SentimentService.predict(cleaned)
        pred_label = prediction['sentiment']
        
        totals_by_class[true_label] += 1
        total += 1
        
        if pred_label == true_label:
            correct += 1
        else:
            errors_by_class[true_label] += 1
            wrong_guesses.append({
                'text': text,
                'true_label': true_label,
                'pred_label': pred_label,
                'confidence': prediction.get('confidence', 0)
            })

    end_time = time.time()
    elapsed_seconds = round(end_time - start_time, 2)
    accuracy = (correct / total * 100) if total > 0 else 0

    return jsonify({
        'total_evaluated': total,
        'correct': correct,
        'wrong': total - correct,
        'accuracy': round(accuracy, 2),
        'errors_by_class': errors_by_class,
        'totals_by_class': totals_by_class,
        'wrong_guesses': wrong_guesses,
        'elapsed_seconds': elapsed_seconds,
        'message': 'Model performance evaluated successfully'
    }), 200

# ──────────────── ALL ANALYSES ────────────────

@admin_bp.route('/analyses', methods=['GET'])
@admin_required
def all_analyses():
    """Browse all analyses across all users"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    sentiment = request.args.get('sentiment', None)
    user_id = request.args.get('user_id', None, type=int)

    per_page = min(per_page, 100)

    query = db.session.query(AnalysisInput, User.username).join(
        User, AnalysisInput.user_id == User.id
    )

    if sentiment:
        query = query.join(AnalysisResult).filter(AnalysisResult.sentiment == sentiment)
    if user_id:
        query = query.filter(AnalysisInput.user_id == user_id)

    query = query.order_by(AnalysisInput.created_at.desc())
    total = query.count()

    # Manual pagination
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = (total + per_page - 1) // per_page

    results = []
    for inp, username in items:
        d = inp.to_dict()
        d['username'] = username
        results.append(d)

    return jsonify({
        'items': results,
        'total': total,
        'page': page,
        'pages': pages,
        'per_page': per_page,
    }), 200


# ──────────────── PROMOTE TO ADMIN ────────────────

@admin_bp.route('/promote-self', methods=['POST'])
@jwt_required()
def promote_self():
    """One-time setup: promote current user to admin if no admins exist"""
    admin_exists = User.query.filter_by(role='admin').first()
    if admin_exists:
        return jsonify({'error': 'Admin already exists. Use existing admin to manage roles.'}), 403

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    user.role = 'admin'
    db.session.commit()

    return jsonify({'message': f'{user.username} promoted to admin', 'user': user.to_dict()}), 200


# ──────────────── MODEL REGISTRY ────────────────

@admin_bp.route('/models', methods=['GET'])
@admin_required
def list_models():
    """List all registered AI models"""
    models = AIModel.query.order_by(AIModel.is_active.desc(), AIModel.added_at.desc()).all()
    return jsonify({
        'models': [m.to_dict() for m in models],
        'current_model': SentimentService.get_current_model(),
    }), 200


@admin_bp.route('/models/<int:model_id>/activate', methods=['POST'])
@admin_required
def activate_model(model_id):
    """Switch to a different AI model (hot-swap)"""
    model = AIModel.query.get(model_id)
    if not model:
        return jsonify({'error': 'Model not found'}), 404

    # Attempt to load the new model
    result = SentimentService.switch_model(model.huggingface_id)

    if result['success']:
        # Deactivate all other models
        AIModel.query.update({AIModel.is_active: False})
        model.is_active = True
        model.is_downloaded = True
        model.last_used_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({
            'message': f'Switched to {model.name}',
            'model': model.to_dict(),
            'load_time_seconds': result['load_time_seconds'],
        }), 200
    else:
        return jsonify({'error': f'Failed to load model: {result["error"]}'}), 500


@admin_bp.route('/models', methods=['POST'])
@admin_required
def add_model():
    """Register a new AI model"""
    data = request.get_json() or {}
    required = ['name', 'huggingface_id']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    existing = AIModel.query.filter_by(huggingface_id=data['huggingface_id']).first()
    if existing:
        return jsonify({'error': 'Model already registered'}), 409

    model = AIModel(
        name=data['name'],
        huggingface_id=data['huggingface_id'],
        description=data.get('description', ''),
        description_ar=data.get('description_ar', ''),
        architecture=data.get('architecture', 'Unknown'),
        source=data.get('source', 'HuggingFace'),
        label_map=data.get('label_map', '{}'),
    )
    db.session.add(model)
    db.session.commit()

    return jsonify({'message': 'Model registered', 'model': model.to_dict()}), 201


@admin_bp.route('/models/<int:model_id>', methods=['DELETE'])
@admin_required
def delete_model(model_id):
    """Delete a model from the registry"""
    model = AIModel.query.get(model_id)
    if not model:
        return jsonify({'error': 'Model not found'}), 404
    if model.is_active:
        return jsonify({'error': 'Cannot delete the active model. Switch to another model first.'}), 400

    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': f'Model {model.name} deleted'}), 200
