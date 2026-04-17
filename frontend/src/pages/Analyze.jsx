import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { analysisAPI } from '../services/api'

export default function Analyze() {
    const { lang } = useLanguage()
    const { isGuest } = useAuth()
    const [text, setText] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [quotaExceeded, setQuotaExceeded] = useState(false)

    const handleAnalyze = async () => {
        if (!text.trim()) return
        setLoading(true)
        setError('')
        setIsDuplicate(false)
        setQuotaExceeded(false)

        try {
            const res = await analysisAPI.analyzeText(text)
            const data = res.data

            // Check for duplicate
            if (data.duplicate) {
                setIsDuplicate(true)
            }

            setResult(data.prediction)
        } catch (err) {
            const errData = err.response?.data
            if (errData?.quota_exceeded) {
                setQuotaExceeded(true)
                setError(lang === 'ar' ? errData.error_ar : errData.error)
            } else {
                setError(errData?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'))
            }
        } finally {
            setLoading(false)
        }
    }

    const sentimentEmoji = { positive: '😊', negative: '😠', neutral: '😐' }
    const sentimentLabel = {
        positive: lang === 'ar' ? 'إيجابي' : 'Positive',
        negative: lang === 'ar' ? 'سلبي' : 'Negative',
        neutral: lang === 'ar' ? 'محايد' : 'Neutral',
    }
    const sentimentColor = { positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B' }

    return (
        <div className="fade-in">
            <div className="topbar">
                <h1 className="topbar-title">{lang === 'ar' ? 'تحليل النص' : 'Text Analysis'}</h1>
            </div>

            <div className="card">
                <textarea
                    className="analyze-textarea"
                    placeholder={lang === 'ar' ? 'أدخل النص العربي هنا...' : 'Enter Arabic text here...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={5000}
                    dir="rtl"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span className="text-muted" style={{ fontSize: 13 }}>{text.length} / 5000</span>
                    <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || !text.trim()}>
                        {loading ? (
                            <><div className="spinner" style={{ width: 16, height: 16 }} /> {lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}</>
                        ) : (
                            <>{lang === 'ar' ? 'تحليل' : 'Analyze'} 🔍</>
                        )}
                    </button>
                </div>
            </div>

            {/* Error or quota exceeded */}
            {error && (
                <div className="card" style={{
                    borderColor: quotaExceeded ? '#F59E0B' : '#EF4444',
                    textAlign: 'center', padding: 24, marginTop: 16,
                }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{quotaExceeded ? '⏳' : '⚠️'}</div>
                    <p style={{ color: quotaExceeded ? '#F59E0B' : '#EF4444', fontWeight: 500 }}>{error}</p>
                    {quotaExceeded && (
                        <a href="/register" className="btn btn-primary" style={{ marginTop: 12 }}>
                            {lang === 'ar' ? 'أنشئ حساب مجاني' : 'Create Free Account'}
                        </a>
                    )}
                </div>
            )}

            {/* Duplicate notification */}
            {isDuplicate && result && (
                <div className="card" style={{
                    border: '1px solid rgba(59,130,246,0.4)',
                    background: 'rgba(59,130,246,0.08)',
                    textAlign: 'center', padding: 16, marginTop: 16,
                }}>
                    <span style={{ fontSize: 20 }}>🔄</span>
                    <p style={{ color: '#3B82F6', fontWeight: 500, fontSize: 14, margin: '4px 0 0' }}>
                        {lang === 'ar' ? 'تم تحليل هذا النص مسبقاً — هذه هي النتيجة السابقة' : 'This text was already analyzed — showing previous result'}
                    </p>
                </div>
            )}

            {/* Result card */}
            {result && (
                <div className="card result-card fade-in" style={{ marginTop: 16 }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 52, marginBottom: 8 }}>
                            {sentimentEmoji[result.sentiment]}
                        </div>
                        <h2 style={{ color: sentimentColor[result.sentiment], marginBottom: 4 }}>
                            {sentimentLabel[result.sentiment]}
                        </h2>
                        <p className="text-muted" style={{ fontSize: 14 }}>
                            {lang === 'ar' ? 'درجة الثقة:' : 'Confidence:'} {(result.confidence * 100).toFixed(1)}%
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['positive', 'negative', 'neutral'].map((s) => {
                            const score = result[`${s}_score`] || 0
                            return (
                                <div key={s} style={{ textAlign: 'center', minWidth: 100 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                        {sentimentLabel[s]}
                                    </div>
                                    <div style={{
                                        height: 6, borderRadius: 3, background: 'var(--bg-tertiary)',
                                        overflow: 'hidden', marginBottom: 4,
                                    }}>
                                        <div style={{
                                            width: `${score * 100}%`, height: '100%',
                                            background: sentimentColor[s], borderRadius: 3,
                                            transition: 'width 0.6s ease',
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                                        {(score * 100).toFixed(1)}%
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <span className="text-muted" style={{ fontSize: 12 }}>
                            {result.processing_time_ms}ms ⚡
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
