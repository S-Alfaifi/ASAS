"""Auth Routes — Registration, Login, Profile, Guest"""
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validation
    if not username or len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    if not email or '@' not in email:
        return jsonify({'error': 'Valid email is required'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Check duplicates
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Create user
    user = User(
        username=username,
        email=email,
        language_pref=data.get('language_pref', 'ar'),
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Auto-login after registration
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Account created successfully',
        'token': token,
        'user': user.to_dict(),
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login and get access token"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if data.get('username'):
        user.username = data['username'].strip()
    if data.get('language_pref') in ('ar', 'en'):
        user.language_pref = data['language_pref']

    db.session.commit()

    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200


@auth_bp.route('/guest', methods=['POST'])
def guest_login():
    """Create a temporary guest session or resume an existing one"""
    data = request.get_json() or {}
    guest_token = data.get('guest_token')

    if guest_token:
        try:
            existing_guest = User.query.filter_by(id=int(guest_token), role='guest').first()
            if existing_guest and existing_guest.is_active:
                token = create_access_token(identity=str(existing_guest.id))
                return jsonify({
                    'message': 'Guest session resumed',
                    'token': token,
                    'user': existing_guest.to_dict(),
                    'limits': {'max_analyses': 10, 'max_file_uploads': 1, 'max_file_size_mb': 2},
                }), 200
        except (ValueError, TypeError):
            pass

    guest_id = uuid.uuid4().hex[:8]
    guest = User(
        username=f'guest_{guest_id}',
        email=f'guest_{guest_id}@guest.asas',
        role='guest',
        language_pref='ar',
    )
    guest.set_password(uuid.uuid4().hex)  # random password they can't use

    db.session.add(guest)
    db.session.commit()

    token = create_access_token(identity=str(guest.id))

    return jsonify({
        'message': 'Guest session started',
        'token': token,
        'user': guest.to_dict(),
        'limits': {'max_analyses': 10, 'max_file_uploads': 1, 'max_file_size_mb': 2},
    }), 201


@auth_bp.route('/guest/quota', methods=['GET'])
@jwt_required()
def guest_quota():
    """Check remaining guest quota"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'guest':
        return jsonify({'is_guest': False}), 200

    from app.models.analysis import AnalysisInput
    analyses_used = AnalysisInput.query.filter_by(user_id=user_id, source_type='manual').count()
    files_used = AnalysisInput.query.filter(
        AnalysisInput.user_id == user_id,
        AnalysisInput.source_type == 'file'
    ).with_entities(AnalysisInput.batch_id).distinct().count()

    return jsonify({
        'is_guest': True,
        'analyses_used': analyses_used,
        'analyses_limit': 10,
        'analyses_remaining': max(0, 10 - analyses_used),
        'files_used': files_used,
        'files_limit': 1,
        'files_remaining': max(0, 1 - files_used),
    }), 200

