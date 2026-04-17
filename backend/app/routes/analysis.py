"""Analysis Routes — Text analysis and file upload"""
import uuid
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
from app import db
from app.models.user import User
from app.models.analysis import AnalysisInput, AnalysisResult
from app.models.file_job import FileJob
from app.services.preprocessing import ArabicPreprocessor
from app.services.sentiment import SentimentService
import threading
from werkzeug.utils import secure_filename
from datetime import datetime, timezone

analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/text', methods=['POST'])
@jwt_required()
def analyze_text():
    """Analyze a single Arabic text"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'Text is required'}), 400

    if len(text) > 5000:
        return jsonify({'error': 'Text too long. Maximum 5000 characters.'}), 400

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # --- Guest quota check ---
    if user and user.role == 'guest':
        used = AnalysisInput.query.filter_by(user_id=user_id, source_type='manual').count()
        if used >= 10:
            return jsonify({
                'error': 'Guest limit reached (10 analyses). Create an account for unlimited access.',
                'error_ar': 'انتهت التجارب المجانية (10 تحليلات). أنشئ حساباً للوصول غير المحدود.',
                'quota_exceeded': True,
            }), 429

    # --- Duplicate detection ---
    existing = AnalysisInput.query.filter_by(
        user_id=user_id, input_text=text
    ).order_by(AnalysisInput.created_at.desc()).first()

    if existing and existing.result:
        return jsonify({
            'message': 'This text was already analyzed',
            'duplicate': True,
            'analysis': existing.to_dict(),
            'prediction': {
                'sentiment': existing.result.sentiment,
                'confidence': existing.result.confidence,
                'positive_score': existing.result.positive_score,
                'negative_score': existing.result.negative_score,
                'neutral_score': existing.result.neutral_score,
                'processing_time_ms': existing.result.processing_time_ms,
                'model_version': existing.result.model_version,
                'sentiment_ar': {'positive': 'إيجابي', 'negative': 'سلبي', 'neutral': 'محايد'}.get(existing.result.sentiment, ''),
            },
        }), 200

    # Preprocess
    cleaned = ArabicPreprocessor.preprocess(text)

    if not cleaned or not ArabicPreprocessor.is_arabic(cleaned):
        return jsonify({'error': 'Please provide valid Arabic text'}), 400

    # Predict sentiment
    prediction = SentimentService.predict(cleaned)

    # Save to database
    analysis_input = AnalysisInput(
        user_id=user_id,
        input_text=text,
        cleaned_text=cleaned,
        source_type='manual',
    )
    db.session.add(analysis_input)
    db.session.flush()  # Get the ID

    result = AnalysisResult(
        input_id=analysis_input.id,
        sentiment=prediction['sentiment'],
        confidence=prediction['confidence'],
        positive_score=prediction['positive_score'],
        negative_score=prediction['negative_score'],
        neutral_score=prediction['neutral_score'],
        processing_time_ms=prediction['processing_time_ms'],
        model_version=prediction['model_version'],
    )
    db.session.add(result)
    db.session.commit()

    return jsonify({
        'message': 'Analysis complete',
        'analysis': analysis_input.to_dict(),
        'prediction': prediction,
    }), 200


@analysis_bp.route('/file', methods=['POST'])
@jwt_required()
def analyze_file():
    """Upload and analyze a CSV/Excel file of Arabic texts"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    # Check file extension
    allowed = {'.csv', '.xlsx', '.xls'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed)}'}), 400

    # Read the file
    try:
        if ext == '.csv':
            df = pd.read_csv(file, encoding='utf-8-sig')
        else:
            df = pd.read_excel(file)
    except Exception as e:
        return jsonify({'error': f'Could not read file: {str(e)}'}), 400

    if df.empty:
        return jsonify({'error': 'File is empty'}), 400

    if len(df) > 5000:
        return jsonify({'error': 'Maximum 5000 rows allowed per file'}), 400

    # Find the text column (first column with Arabic text)
    text_col = None
    for col in df.columns:
        sample = str(df[col].dropna().iloc[0]) if len(df[col].dropna()) > 0 else ''
        if ArabicPreprocessor.is_arabic(sample):
            text_col = col
            break

    if text_col is None:
        # Fallback: use the first column
        text_col = df.columns[0]

    # Find a date/time column if it exists
    time_col = None
    for col in df.columns:
        if col == text_col:
            continue
        sample = str(df[col].dropna().iloc[0]) if len(df[col].dropna()) > 0 else ''
        try:
            if any(char in sample for char in ['-', '/', ':', '202']):
                pd.to_datetime(sample)
                time_col = col
                break
        except:
            pass

    user_id = int(get_jwt_identity())
    batch_id = str(uuid.uuid4())
    total_rows = len(df)

    job = FileJob(
        user_id=user_id,
        batch_id=batch_id,
        file_name=file.filename,
        total_rows=total_rows,
        status='processing'
    )
    db.session.add(job)
    db.session.commit()

    # Define background processing task
    def process_file_bg(app_context, j_id, dataframe, user_idx, b_id, t_col, tm_col, f_name):
        with app_context:
            try:
                job_record = FileJob.query.get(j_id)
                results_batch = []
                positive_count = 0
                negative_count = 0
                neutral_count = 0
                processed = 0

                for _, row in dataframe.iterrows():
                    text = str(row[t_col]).strip()
                    if not text or text == 'nan':
                        processed += 1
                        continue

                    cleaned = ArabicPreprocessor.preprocess(text)
                    if not cleaned:
                        processed += 1
                        continue

                    prediction = SentimentService.predict(cleaned)
                    
                    if prediction['sentiment'] == 'positive':
                        positive_count += 1
                    elif prediction['sentiment'] == 'negative':
                        negative_count += 1
                    else:
                        neutral_count += 1

                    custom_created_at = None
                    if tm_col and pd.notna(row[tm_col]):
                        try:
                            custom_created_at = pd.to_datetime(row[tm_col], utc=True).to_pydatetime()
                        except:
                            pass

                    analysis_input = AnalysisInput(
                        user_id=user_idx,
                        input_text=text,
                        cleaned_text=cleaned,
                        source_type='file',
                        file_name=f_name,
                        batch_id=b_id,
                    )
                    if custom_created_at:
                        analysis_input.created_at = custom_created_at
                        
                    db.session.add(analysis_input)
                    db.session.flush()

                    result = AnalysisResult(
                        input_id=analysis_input.id,
                        sentiment=prediction['sentiment'],
                        confidence=prediction['confidence'],
                        positive_score=prediction['positive_score'],
                        negative_score=prediction['negative_score'],
                        neutral_score=prediction['neutral_score'],
                        processing_time_ms=prediction['processing_time_ms'],
                        model_version=prediction['model_version'],
                    )
                    db.session.add(result)
                    
                    processed += 1
                    # Periodically update progress
                    if processed % 50 == 0:
                        job_record.processed_rows = processed
                        db.session.commit()
                        db.session.refresh(job_record)

                # Final updates
                job_record.processed_rows = processed
                job_record.status = 'completed'
                job_record.completed_at = datetime.now(timezone.utc)
                job_record.summary_positive = positive_count
                job_record.summary_negative = negative_count
                job_record.summary_neutral = neutral_count
                
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                job_record = FileJob.query.get(j_id)
                if job_record:
                    job_record.status = 'failed'
                    job_record.error_message = str(e)
                    job_record.completed_at = datetime.now(timezone.utc)
                    db.session.commit()

    app_context = current_app.app_context()
    thread = threading.Thread(
        target=process_file_bg,
        args=(app_context, job.id, df, user_id, batch_id, text_col, time_col, file.filename)
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        'message': 'File upload successful. Processing in background.',
        'job_id': job.id,
        'batch_id': batch_id
    }), 202

@analysis_bp.route('/file/status/<int:job_id>', methods=['GET'])
@jwt_required()
def job_status(job_id):
    """Get the status of a background file analysis job"""
    user_id = int(get_jwt_identity())
    job = FileJob.query.get(job_id)

    if not job:
        return jsonify({'error': 'Job not found'}), 404

    if job.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(job.to_dict()), 200
