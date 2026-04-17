import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { historyAPI } from '../services/api'
import { HiOutlineTrash } from 'react-icons/hi'

export default function History() {
    const { t, lang } = useLanguage()
    const [items, setItems] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    useEffect(() => { loadHistory() }, [page, filter])

    const loadHistory = async () => {
        setLoading(true)
        try {
            const params = { page, per_page: 15 }
            if (filter) params.sentiment = filter
            const res = await historyAPI.getHistory(params)
            setItems(res.data.items || [])
            setTotalPages(res.data.pages || 1)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await historyAPI.deleteAnalysis(id)
            setItems(items.filter(i => i.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="fade-in">
            <div className="topbar">
                <h1 className="topbar-title">{t('history')}</h1>
                <div className="topbar-actions">
                    {['', 'positive', 'negative', 'neutral'].map((f) => (
                        <button
                            key={f}
                            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => { setFilter(f); setPage(1) }}
                        >
                            {f ? (f === 'positive' ? '😊' : f === 'negative' ? '😠' : '😐') : '🔄'} {f ? t(f) : lang === 'ar' ? 'الكل' : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-inline"><div className="spinner" /></div>
                ) : items.length > 0 ? (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '45%' }}>Text</th>
                                    <th>{t('result')}</th>
                                    <th>{t('confidence')}</th>
                                    <th>Source</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="text-col" dir="rtl">{item.input_text}</td>
                                        <td>
                                            <span className={`sentiment-badge sentiment-${item.result?.sentiment || 'neutral'}`}>
                                                {item.result?.sentiment === 'positive' ? '😊' : item.result?.sentiment === 'negative' ? '😠' : '😐'}
                                                {' '}{lang === 'ar'
                                                    ? (item.result?.sentiment === 'positive' ? 'إيجابي' : item.result?.sentiment === 'negative' ? 'سلبي' : 'محايد')
                                                    : (item.result?.sentiment || 'neutral')}
                                            </span>
                                        </td>
                                        <td>{((item.result?.confidence || 0) * 100).toFixed(1)}%</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.source_type}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                                                <HiOutlineTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                                {lang === 'ar' ? '→' : '←'}
                            </button>
                            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                {lang === 'ar' ? '←' : '→'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-text">{t('noData')}</div>
                    </div>
                )}
            </div>
        </div>
    )
}
