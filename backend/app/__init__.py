"""ASAS Flask Application Factory"""
import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.analysis import analysis_bp
    from app.routes.history import history_bp
    from app.routes.reports import reports_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(analysis_bp, url_prefix='/api/analyze')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Create database tables
    with app.app_context():
        from app.models import user, analysis, report  # noqa: F401
        from app.models import ai_model  # noqa: F401
        from app.models import file_job  # noqa: F401
        db.create_all()

        # Seed default admin accounts
        _seed_admins()

        # Seed default AI models
        _seed_models()

        # Initialize the active sentiment model
        from app.services.sentiment import SentimentService
        from app.models.ai_model import AIModel
        active = AIModel.query.filter_by(is_active=True).first()
        model_name = active.huggingface_id if active else app.config.get('MODEL_NAME')
        SentimentService.initialize(model_name=model_name)

    # Health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'ASAS API is running'}

    return app


def _seed_admins():
    """Create default admin accounts if they don't exist"""
    from app.models.user import User

    admins = [
        {'username': 'admin', 'email': 'admin@asas.com', 'password': 'Admin@2025'},
        {'username': 'admin2', 'email': 'admin2@asas.com', 'password': 'Admin@2025'},
        {'username': 'admin3', 'email': 'admin3@asas.com', 'password': 'Admin@2025'},
    ]

    for admin_data in admins:
        existing = User.query.filter_by(email=admin_data['email']).first()
        if not existing:
            user = User(
                username=admin_data['username'],
                email=admin_data['email'],
                role='admin',
                language_pref='ar',
            )
            user.set_password(admin_data['password'])
            db.session.add(user)
            print(f"  [+] Admin account created: {admin_data['email']}")

    db.session.commit()


def _seed_models():
    """Seed default AI models into the registry"""
    from app.models.ai_model import AIModel
    import json

    models = [
        {
            'name': 'CamelBERT-DA Sentiment',
            'huggingface_id': 'CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment',
            'description': 'BERT model fine-tuned on Arabic dialect data for 3-class sentiment analysis. Best for Modern Standard Arabic and dialects.',
            'description_ar': 'نموذج BERT مدرب على بيانات اللهجات العربية لتحليل المشاعر بثلاث فئات. الأفضل للعربية الفصحى واللهجات.',
            'architecture': 'BERT (CamelBERT-DA)',
            'source': 'CAMeL-Lab / NYU Abu Dhabi',
            'is_active': True,
            'label_map': json.dumps({'POS': 'positive', 'NEG': 'negative', 'NEUT': 'neutral'}),
        },
        {
            'name': 'XLM-RoBERTa Multilingual Sentiment',
            'huggingface_id': 'cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual',
            'description': 'XLM-RoBERTa multilingual model fine-tuned on ~198M tweets for sentiment analysis. Supports 8+ languages including Arabic.',
            'description_ar': 'نموذج XLM-RoBERTa متعدد اللغات مدرب على 198 مليون تغريدة لتحليل المشاعر. يدعم 8 لغات منها العربية.',
            'architecture': 'XLM-RoBERTa Base',
            'source': 'Cardiff NLP',
            'is_active': False,
            'label_map': json.dumps({'Positive': 'positive', 'Negative': 'negative', 'Neutral': 'neutral'}),
        },
    ]

    for m in models:
        existing = AIModel.query.filter_by(huggingface_id=m['huggingface_id']).first()
        if not existing:
            model = AIModel(**m)
            db.session.add(model)
            print(f"  [+] AI Model registered: {m['name']}")

    db.session.commit()
