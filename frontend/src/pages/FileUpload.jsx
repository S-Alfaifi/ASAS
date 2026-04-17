import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useLanguage } from '../context/LanguageContext'
import { useBackgroundJobs } from '../context/BackgroundJobContext'
import { analysisAPI, historyAPI } from '../services/api'
import { HiOutlineCloudUpload, HiOutlineInformationCircle, HiOutlineTrash } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import Plot from 'react-plotly.js'

export default function FileUpload() {
    const { t, lang } = useLanguage()
    const { startJob, activeJobs, completedJobs, removeJob, clearCompleted } = useBackgroundJobs()
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const onDrop = useCallback((accepted) => {
        if (accepted.length > 0) {
            setFile(accepted[0])
            setError('')
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
    })

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setError('')
        try {
            const res = await analysisAPI.uploadFile(file)
            startJob(res.data.job_id, { file_name: file.name, batch_id: res.data.batch_id })
            setFile(null)
        } catch (err) {
            setError(err.response?.data?.error || t('error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fade-in">
            <div className="topbar">
                <h1 className="topbar-title">{t('upload')}</h1>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div className="card">
                    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                        <input {...getInputProps()} />
                        <div className="dropzone-icon"><HiOutlineCloudUpload /></div>
                        <div className="dropzone-text">{t('dropFile')}</div>
                        <div className="dropzone-sub">{t('supportedFormats')}</div>
                    </div>

                    {file && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                    📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                </span>
                                <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                                    {loading ? (
                                        <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {t('uploading')}</>
                                    ) : (
                                        t('uploadBtn')
                                    )}
                                </button>
                            </div>
                            
                            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <HiOutlineInformationCircle size={24} color="#3B82F6" style={{ flexShrink: 0 }} />
                                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    {t('processingWarning')}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}
                </div>

                {/* Active Jobs Section */}
                {activeJobs.length > 0 && (
                    <div className="card" style={{ marginTop: 24, padding: 16 }}>
                        <h3 className="card-title" style={{ marginBottom: 16 }}>{t('activeJobs')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activeJobs.map(job => (
                                <div key={job.id} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 500 }}>📄 {job.file_name}</span>
                                        <span style={{ fontSize: 13, color: '#3B82F6' }}>{job.progress}%</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
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

                {/* Completed Jobs Section */}
                {completedJobs.length > 0 && (
                    <div className="card" style={{ marginTop: 24, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 className="card-title">{t('completedJobs')}</h3>
                            <button onClick={clearCompleted} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <HiOutlineTrash /> {t('clearCompleted')}
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {completedJobs.map(job => (
                                <div key={job.id} style={{ padding: 16, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
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
                                            <Link to={`/history?batch=${job.batch_id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                                                {t('viewResults')}
                                            </Link>
                                        )}
                                    </div>
                                    
                                    {job.status === 'completed' && job.summary && (
                                        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border-color)' }}>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ color: '#10B981', fontWeight: 'bold' }}>{job.summary.positive}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('positive')}</div>
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ color: '#EF4444', fontWeight: 'bold' }}>{job.summary.negative}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('negative')}</div>
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ color: '#F59E0B', fontWeight: 'bold' }}>{job.summary.neutral}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('neutral')}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
