import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useBackgroundJobs } from '../context/BackgroundJobContext'
import { dashboardAPI, analysisAPI } from '../services/api'
import Plot from 'react-plotly.js'
import { 
    HiOutlineChartBar, HiOutlineCalendar, HiOutlineShieldCheck, 
    HiOutlineTrendingUp, HiOutlinePaperClip, HiOutlineX, HiOutlineTrash 
} from 'react-icons/hi'
import { FiSend } from 'react-icons/fi'
import TypewriterLoader from '../components/TypewriterLoader'

export default function Dashboard() {
    const { t, lang } = useLanguage()
    const navigate = useNavigate()
    const { startJob, activeJobs, completedJobs, clearCompleted } = useBackgroundJobs()
    const [stats, setStats] = useState(null)
    const [trends, setTrends] = useState([])
    const [initialLoading, setInitialLoading] = useState(true)

    // Unified Analysis State
    const [text, setText] = useState('')
    const [file, setFile] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [results, setResults] = useState(null)
    const [error, setError] = useState('')
    
    const fileInputRef = useRef(null)

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        let interval;
        if (isAnalyzing) {
            setElapsedTime(0);
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 0.1);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const loadData = async () => {
        try {
            const [statsRes, trendsRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getTrends(30),
            ])
            setStats(statsRes.data)
            setTrends(trendsRes.data.trends || [])
        } catch (err) {
            console.error('Dashboard load error:', err)
        } finally {
            setInitialLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const selected = e.target.files[0]
        if (selected) {
            setFile(selected)
            setText('') 
            setResults(null)
            setError('')
        }
    }

    const handleClearFile = (e) => {
        e.stopPropagation()
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async () => {
        if (!text.trim() && !file) return
        
        setIsAnalyzing(true)
        setError('')
        setResults(null)
        
        // Wait a slight moment so loader shows smoothly
        await new Promise(r => setTimeout(r, 600));

        try {
            let res;
            if (file) {
                 res = await analysisAPI.uploadFile(file)
                 startJob(res.data.job_id, { file_name: file.name, batch_id: res.data.batch_id })
                 setFile(null)
                 if (fileInputRef.current) fileInputRef.current.value = ''
                 // Optionally automatically push them to /upload or just let them stay on Dashboard
            } else {
                 res = await analysisAPI.analyzeText(text)
                 setResults({ type: 'text', data: res.data })
                 loadData() // Refresh stats only on text
            }
        } catch (err) {
            setError(err.response?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'))
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    if (initialLoading) return <div className="loading-inline"><div className="spinner" /></div>

    const dist = stats?.sentiment_distribution || { positive: 0, negative: 0, neutral: 0 }
    const sentimentEmoji = { positive: '😊', negative: '😠', neutral: '😐' }
    const sentimentLabel = {
        positive: lang === 'ar' ? 'إيجابي' : 'Positive',
        negative: lang === 'ar' ? 'سلبي' : 'Negative',
        neutral: lang === 'ar' ? 'محايد' : 'Neutral',
    }
    const sentimentColor = { positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B' }

    // Chart configs
    const currentDist = results?.type === 'file' && results.data.summary 
        ? results.data.summary 
        : dist;

    const pieData = [{
        values: [currentDist.positive, currentDist.negative, currentDist.neutral],
        labels: [t('positive'), t('negative'), t('neutral')],
        type: 'pie',
        marker: { colors: ['#10B981', '#EF4444', '#F59E0B'] },
        hole: 0.45,
        textinfo: 'percent+label',
        textfont: { color: '#F1F5F9', size: 13, family: lang === 'ar' ? 'Noto Sans Arabic' : 'Inter' },
    }]

    const pieLayout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: false,
        margin: { t: 20, b: 20, l: 20, r: 20 },
        height: 280,
        font: { color: '#94A3B8', family: lang === 'ar' ? 'Noto Sans Arabic' : 'Inter' },
    }

    const currentTrendTitle = results?.type === 'file' ? t('sentimentDist') : t('trends');

    const trendData = trends.length > 0 ? [
        { x: trends.map(t => t.date), y: trends.map(t => t.positive), name: t('positive'), type: 'scatter', mode: 'lines+markers', line: { color: '#10B981', width: 2, shape: 'spline' }, marker: { size: 6 } },
        { x: trends.map(t => t.date), y: trends.map(t => t.negative), name: t('negative'), type: 'scatter', mode: 'lines+markers', line: { color: '#EF4444', width: 2, shape: 'spline' }, marker: { size: 6 } },
        { x: trends.map(t => t.date), y: trends.map(t => t.neutral), name: t('neutral'), type: 'scatter', mode: 'lines+markers', line: { color: '#F59E0B', width: 2, shape: 'spline' }, marker: { size: 6 } },
    ] : []

    const trendLayout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 20, b: 40, l: 40, r: 20 },
        height: 280,
        xaxis: { color: '#64748B', gridcolor: 'rgba(255,255,255,0.04)', zeroline: false },
        yaxis: { color: '#64748B', gridcolor: 'rgba(255,255,255,0.04)', zeroline: false },
        legend: { font: { color: '#94A3B8', family: lang === 'ar' ? 'Noto Sans Arabic' : 'Inter' }, orientation: 'h', y: -0.2 },
        font: { family: lang === 'ar' ? 'Noto Sans Arabic' : 'Inter' },
    }

    return (
        <div className="fade-in" style={{ paddingBottom: 40 }}>
            {/* Unified Input Section (Modern UI) */}
            <div style={{ maxWidth: 860, margin: '20px auto 40px auto' }}>
                <h1 style={{ textAlign: 'center', marginBottom: 24, fontSize: '2rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {t('dashboard')} 
                </h1>

                <div style={{
                    position: 'relative',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 24,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'border-color 0.3s ease',
                }}>
                    <textarea
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#e2e8f0',
                            fontSize: '1.1rem',
                            resize: 'none',
                            outline: 'none',
                            minHeight: file ? '40px' : '100px',
                            padding: '8px',
                            fontFamily: 'inherit',
                            display: file ? 'none' : 'block'
                        }}
                        dir="rtl"
                        placeholder={lang === 'ar' ? "أدخل النص للتحليل أو قم بإرفاق ملف (CSV/Excel)..." : "Analyze text or attach a file (CSV/Excel)..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isAnalyzing || file}
                    />

                    {/* File Drop Indicator inside the box */}
                    {file && (
                        <div style={{
                            display: 'flex', alignItems: 'center', background: 'rgba(59, 130, 246, 0.15)',
                            padding: '12px 16px', borderRadius: 12, border: '1px dashed rgba(59, 130, 246, 0.5)',
                            margin: '8px', color: '#60A5FA'
                        }}>
                            <span style={{ fontSize: 24, marginRight: 12, marginLeft: 12 }}>📄</span>
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 600 }}>{file.name}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <button onClick={handleClearFile} style={{
                                background: 'transparent', border: 'none', color: '#EF4444', 
                                cursor: 'pointer', padding: 8, fontSize: 18, borderRadius: '50%'
                            }}>
                                <HiOutlineX />
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '0 8px' }}>
                        <div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }}
                                accept=".csv,.xlsx,.xls"
                            />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                disabled={isAnalyzing}
                                style={{
                                    background: 'transparent', border: 'none', padding: 10,
                                    color: '#94A3B8', cursor: 'pointer', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    backgroundColor: file ? 'rgba(255,255,255,0.05)' : 'transparent'
                                }}
                                title={lang === 'ar' ? 'إرفاق ملف' : 'Attach file'}
                                className="hover-bg-slate-700"
                            >
                                <HiOutlinePaperClip size={22} />
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleSubmit} 
                            disabled={isAnalyzing || (!text.trim() && !file)}
                            style={{
                                background: isAnalyzing || (!text.trim() && !file) ? 'rgba(59, 130, 246, 0.3)' : '#275EFE',
                                border: 'none', color: '#fff', padding: '10px 20px',
                                borderRadius: 20, fontWeight: 600, cursor: isAnalyzing || (!text.trim() && !file) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 14px rgba(39, 94, 254, 0.4)'
                            }}
                        >
                            {isAnalyzing ? (
                                <span style={{ fontSize: 14 }}>{elapsedTime.toFixed(1)}s</span>
                            ) : (
                                <>
                                    {lang === 'ar' ? 'إرسال' : 'Submit'} <FiSend size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="auth-error" style={{ marginTop: 16, textAlign: 'center', borderRadius: 16 }}>
                        {error}
                    </div>
                )}
                
                {/* Active Jobs Section in Dashboard */}
                {activeJobs.length > 0 && (
                    <div className="card" style={{ marginTop: 24, padding: 16, borderRadius: 24, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 className="card-title" style={{ marginBottom: 16 }}>{t('activeJobs')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activeJobs.map(job => (
                                <div key={job.id} style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 500 }}>📄 {job.file_name}</span>
                                        <span style={{ fontSize: 13, color: '#3B82F6' }}>{job.progress}%</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        <div style={{ width: `${job.progress}%`, height: '100%', background: '#3B82F6', transition: 'width 0.5s ease' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                        <span>{t('jobProcessing')}</span>
                                        <span>{job.processed_rows} / {job.total_rows}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Completed Jobs Section in Dashboard */}
                {completedJobs.length > 0 && (
                    <div className="card" style={{ marginTop: 24, padding: 16, borderRadius: 24, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 className="card-title">{t('completedJobs')}</h3>
                            <button onClick={clearCompleted} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <HiOutlineTrash /> {t('clearCompleted')}
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {completedJobs.map(job => (
                                <div key={job.id} style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <span style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>📄 {job.file_name}</span>
                                            {job.status === 'completed' ? (
                                                <span style={{ fontSize: 13, color: '#10B981', display: 'flex', gap: 8 }}>
                                                    ✅ {t('jobCompleted')} 
                                                    <span style={{ color: 'var(--text-secondary)' }}>({job.total_rows} rows)</span>
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 13, color: '#EF4444' }}>
                                                    ❌ {t('jobFailed')}: {job.error_message}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {job.status === 'completed' && (
                                            <button onClick={() => navigate(`/history?batch=${job.batch_id}`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13, borderRadius: 12 }}>
                                                {t('viewResults')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Loading Anim */}
            {isAnalyzing && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                    <TypewriterLoader />
                    <div style={{ marginTop: 24, fontSize: 18, color: '#94A3B8', fontWeight: 500 }}>
                        {lang === 'ar' ? 'جاري التحليل المعمق...' : 'Deep analysis in progress...'} 
                        <span style={{ color: '#275EFE', marginLeft: 8 }}>{elapsedTime.toFixed(1)}s</span>
                    </div>
                </div>
            )}

            {/* Results Component */}
            {results && !isAnalyzing && (
                <div style={{ maxWidth: 1000, margin: '0 auto 40px auto' }} className="fade-in">
                    <h2 style={{ marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        {lang === 'ar' ? 'نتائج التحليل' : 'Analysis Results'}
                        <span style={{ float: lang === 'ar' ? 'left' : 'right', fontSize: 14, color: '#94A3B8', fontWeight: 400, marginTop: 6 }}>
                             ⏱️ {lang === 'ar' ? 'الوقت المستغرق:' : 'Took:'} {(elapsedTime).toFixed(1)}s
                        </span>
                    </h2>

                    {results.type === 'text' && results.data.prediction && (
                        <div className="card result-card" style={{ textAlign: 'center', padding: '30px', borderRadius: 20 }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>
                                {sentimentEmoji[results.data.prediction.sentiment]}
                            </div>
                            <h2 style={{ color: sentimentColor[results.data.prediction.sentiment], fontSize: '2rem', marginBottom: 8 }}>
                                {sentimentLabel[results.data.prediction.sentiment]}
                            </h2>
                            <p className="text-muted" style={{ fontSize: 16, marginBottom: 24 }}>
                                {lang === 'ar' ? 'درجة الثقة:' : 'Confidence:'} {(results.data.prediction.confidence * 100).toFixed(1)}%
                            </p>

                            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {['positive', 'negative', 'neutral'].map((s) => {
                                    const score = results.data.prediction[`${s}_score`] || 0
                                    return (
                                        <div key={s} style={{ textAlign: 'center', minWidth: 120 }}>
                                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                                {sentimentLabel[s]}
                                            </div>
                                            <div style={{
                                                height: 8, borderRadius: 4, background: 'var(--bg-tertiary)',
                                                overflow: 'hidden', marginBottom: 6,
                                            }}>
                                                <div style={{
                                                    width: `${score * 100}%`, height: '100%',
                                                    background: sentimentColor[s], borderRadius: 4,
                                                }} />
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>
                                                {(score * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    
                    {results.type === 'file' && results.data.summary && (
                        <div className="result-container">
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                <div className="stat-card green" style={{ borderRadius: 16 }}>
                                    <div className="stat-value" style={{ fontSize: '2.5rem' }}>{results.data.summary.positive}</div>
                                    <div className="stat-label">{t('positive')}</div>
                                </div>
                                <div className="stat-card red" style={{ borderRadius: 16 }}>
                                    <div className="stat-value" style={{ fontSize: '2.5rem' }}>{results.data.summary.negative}</div>
                                    <div className="stat-label">{t('negative')}</div>
                                </div>
                                <div className="stat-card amber" style={{ borderRadius: 16 }}>
                                    <div className="stat-value" style={{ fontSize: '2.5rem' }}>{results.data.summary.neutral}</div>
                                    <div className="stat-label">{t('neutral')}</div>
                                </div>
                            </div>
                            
                            {results.data.results?.length > 0 && (
                                <div className="card" style={{ marginTop: 24, borderRadius: 16 }}>
                                    <div className="card-header">
                                        <h3 className="card-title">{lang === 'ar' ? 'العينات المحللة' : 'Analyzed Samples'} ({results.data.results.length})</h3>
                                    </div>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '60%' }}>{lang === 'ar' ? 'النص' : 'Text'}</th>
                                                <th>{t('result')}</th>
                                                <th>{t('confidence')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.data.results.slice(0, 20).map((item, i) => (
                                                <tr key={i}>
                                                    <td className="text-col" dir="rtl">{item.text}</td>
                                                    <td>
                                                        <span className={`sentiment-badge sentiment-${item.sentiment}`}>
                                                            {item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😠' : '😐'}
                                                            {' '}{lang === 'ar' ? item.sentiment_ar : item.sentiment}
                                                        </span>
                                                    </td>
                                                    <td>{(item.confidence * 100).toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Dashboard General Stats - pushed down */}
            {!isAnalyzing && (
                <div style={{ maxWidth: 1000, margin: '0 auto', transition: 'opacity 0.3s' }}>
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon"><HiOutlineChartBar /></div>
                            <div className="stat-value">{stats?.total_analyses || 0}</div>
                            <div className="stat-label">{t('totalAnalyses')}</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-icon"><HiOutlineCalendar /></div>
                            <div className="stat-value">{stats?.today_analyses || 0}</div>
                            <div className="stat-label">{t('todayAnalyses')}</div>
                        </div>
                        <div className="stat-card amber">
                            <div className="stat-icon"><HiOutlineShieldCheck /></div>
                            <div className="stat-value">{((stats?.avg_confidence || 0) * 100).toFixed(0)}%</div>
                            <div className="stat-label">{t('avgConfidence')}</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-icon"><HiOutlineTrendingUp /></div>
                            <div className="stat-value">{dist.positive}</div>
                            <div className="stat-label">{t('positive')}</div>
                        </div>
                    </div>

                    {/* Dashboard Charts */}
                    <div className="charts-grid" style={{ marginTop: 24 }}>
                        <div className="chart-card">
                            <div className="card-header">
                                <h3 className="card-title">{t('sentimentDist')}</h3>
                            </div>
                            {(dist.positive + dist.negative + dist.neutral) > 0 ? (
                                <Plot data={pieData} layout={pieLayout} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📊</div>
                                    <div className="empty-state-text">{t('noData')}</div>
                                </div>
                            )}
                        </div>
                        <div className="chart-card">
                            <div className="card-header">
                                <h3 className="card-title">{t('trends')}</h3>
                            </div>
                            {trendData.length > 0 ? (
                                <Plot data={trendData} layout={trendLayout} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📈</div>
                                    <div className="empty-state-text">{t('noData')}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Analyses Array */}
                    <div className="card" style={{ marginTop: 24 }}>
                        <div className="card-header">
                            <h3 className="card-title">{t('recentAnalyses')}</h3>
                        </div>
                        {stats?.recent_analyses?.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50%' }}>{lang === 'ar' ? 'النص' : 'Text'}</th>
                                        <th>{t('result')}</th>
                                        <th>{t('confidence')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_analyses.map((item) => (
                                        <tr key={item.id}>
                                            <td className="text-col" dir="rtl">{item.input_text}</td>
                                            <td>
                                                <span className={`sentiment-badge sentiment-${item.result?.sentiment || 'neutral'}`}>
                                                    {item.result?.sentiment === 'positive' ? '😊' : item.result?.sentiment === 'negative' ? '😠' : '😐'}
                                                    {' '}{lang === 'ar' ? (item.result?.sentiment === 'positive' ? 'إيجابي' : item.result?.sentiment === 'negative' ? 'سلبي' : 'محايد') : (item.result?.sentiment || 'neutral')}
                                                </span>
                                            </td>
                                            <td>{((item.result?.confidence || 0) * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📝</div>
                                <div className="empty-state-text">{t('noData')}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
