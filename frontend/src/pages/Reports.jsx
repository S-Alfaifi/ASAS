import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { reportsAPI } from '../services/api'
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi'

export default function Reports() {
    const { t, lang } = useLanguage()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')

    useEffect(() => { loadReports() }, [])

    const loadReports = async () => {
        try {
            const res = await reportsAPI.listReports()
            setReports(res.data.reports || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            await reportsAPI.generateReport({ title: title || undefined })
            setShowForm(false)
            setTitle('')
            loadReports()
        } catch (err) {
            alert(err.response?.data?.error || t('error'))
        } finally {
            setGenerating(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await reportsAPI.deleteReport(id)
            setReports(reports.filter(r => r.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="loading-inline"><div className="spinner" /></div>

    return (
        <div className="fade-in">
            <div className="topbar">
                <h1 className="topbar-title">{t('reports')}</h1>
                <div className="topbar-actions">
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <HiOutlinePlusCircle /> {t('generateReport')}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card slide-up" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                        <label className="form-label">{t('reportTitle')}</label>
                        <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder={lang === 'ar' ? 'تقرير تحليل المشاعر' : 'Sentiment Analysis Report'} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                            {generating ? t('loading') : t('generateReport')}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
                    </div>
                </div>
            )}

            {reports.length > 0 ? (
                <div style={{ display: 'grid', gap: 16 }}>
                    {reports.map((report) => (
                        <div className="card" key={report.id}>
                            <div className="card-header">
                                <h3 className="card-title">{report.title}</h3>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(report.id)}>
                                    <HiOutlineTrash />
                                </button>
                            </div>
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 0 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>{report.total_analyzed}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('totalAnalyses')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>
                                        {report.positive_pct}%
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('positive')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-red)' }}>
                                        {report.negative_pct}%
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('negative')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-amber)' }}>
                                        {report.neutral_pct}%
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('neutral')}</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                {new Date(report.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <div className="empty-state-text">{t('noReports')}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
