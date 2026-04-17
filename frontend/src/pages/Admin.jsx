import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import Plot from 'react-plotly.js'
import { HiOutlineUsers, HiOutlineChartBar, HiOutlineCog, HiOutlineDatabase, HiOutlineShieldCheck, HiOutlineTrash, HiOutlineBan, HiOutlineCheck, HiOutlineSearch, HiOutlineRefresh, HiOutlineClock, HiOutlineSwitchHorizontal } from 'react-icons/hi'

const API_BASE = 'http://localhost:5000/api'
const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('asas_token')}`,
})

export default function Admin() {
    const { lang } = useLanguage()
    const { user, updateUser, isAdmin } = useAuth()
    const [tab, setTab] = useState('overview')
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [analyses, setAnalyses] = useState({ items: [], total: 0, page: 1, pages: 1 })
    const [modelInfo, setModelInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sentimentFilter, setSentimentFilter] = useState('')

    // Model Eval
    const [evalLoading, setEvalLoading] = useState(false)
    const [evalTimer, setEvalTimer] = useState(0)
    const [evalReport, setEvalReport] = useState(null)

    // Models Registry
    const [models, setModels] = useState([])
    const [switchingModelId, setSwitchingModelId] = useState(null)

    useEffect(() => {
        if (isAdmin) loadData()
    }, [isAdmin])

    useEffect(() => {
        let timer;
        if (evalLoading) {
            timer = setInterval(() => {
                setEvalTimer(prev => prev + 1);
            }, 1000);
        } else {
            setEvalTimer(0);
        }
        return () => clearInterval(timer);
    }, [evalLoading]);

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsRes, usersRes, modelRes, analysesRes, modelsRes] = await Promise.all([
                fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() }).then(r => r.json()),
                fetch(`${API_BASE}/admin/users`, { headers: getHeaders() }).then(r => r.json()),
                fetch(`${API_BASE}/admin/model`, { headers: getHeaders() }).then(r => r.json()),
                fetch(`${API_BASE}/admin/analyses?per_page=20`, { headers: getHeaders() }).then(r => r.json()),
                fetch(`${API_BASE}/admin/models`, { headers: getHeaders() }).then(r => r.json()),
            ])
            setStats(statsRes)
            setUsers(usersRes.users || [])
            setModelInfo(modelRes)
            setAnalyses(analysesRes)
            setModels(modelsRes.models || [])
        } catch (err) {
            console.error('Admin load error:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleUserStatus = async (userId, isActive) => {
        await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'PUT', headers: getHeaders(),
            body: JSON.stringify({ is_active: !isActive }),
        })
        loadData()
    }

    const toggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        if (newRole === 'admin' && !confirm(lang === 'ar' ? 'هل تريد ترقية هذا المستخدم إلى مسؤول؟' : `Promote this user to admin?`)) return
        await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'PUT', headers: getHeaders(),
            body: JSON.stringify({ role: newRole }),
        })
        loadData()
    }

    const deleteUser = async (userId, username) => {
        if (!confirm(lang === 'ar' ? `حذف المستخدم ${username} وجميع بياناته؟` : `Delete user ${username} and all their data?`)) return
        await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE', headers: getHeaders(),
        })
        loadData()
    }

    const loadAnalysesPage = async (page) => {
        const params = new URLSearchParams({ page, per_page: 20 })
        if (sentimentFilter) params.append('sentiment', sentimentFilter)
        const res = await fetch(`${API_BASE}/admin/analyses?${params}`, { headers: getHeaders() })
        setAnalyses(await res.json())
    }

    const runModelEval = async () => {
        setEvalLoading(true)
        try {
            const res = await fetch(`${API_BASE}/admin/evaluate_model`, { method: 'POST', headers: getHeaders() })
            const data = await res.json()
            setEvalReport(data)
        } catch (err) {
            console.error('Eval error', err)
        } finally {
            setEvalLoading(false)
        }
    }

    const switchModel = async (modelId) => {
        if (!confirm(lang === 'ar' ? 'هل تريد تبديل النموذج؟ سيتم تحميله وقد يستغرق 30 ثانية.' : 'Switch model? The new model will be downloaded and loaded, which may take ~30s.')) return
        setSwitchingModelId(modelId)
        try {
            const res = await fetch(`${API_BASE}/admin/models/${modelId}/activate`, { method: 'POST', headers: getHeaders() })
            const data = await res.json()
            if (data.error) {
                alert(data.error)
            } else {
                alert(lang === 'ar' ? `تم التبديل بنجاح في ${data.load_time_seconds}ث` : `Switched successfully in ${data.load_time_seconds}s`)
                loadData()
            }
        } catch (err) {
            console.error('Switch error', err)
            alert('Failed to switch model')
        } finally {
            setSwitchingModelId(null)
        }
    }

    // Not admin — redirect message
    if (!isAdmin) {
        return (
            <div className="fade-in">
                <div className="topbar">
                    <h1 className="topbar-title">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</h1>
                </div>
                <div className="card" style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                    <h2 style={{ marginBottom: 8 }}>{lang === 'ar' ? 'الوصول مقيد' : 'Access Restricted'}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {lang === 'ar' ? 'هذه الصفحة متاحة فقط للمسؤولين.' : 'This page is only available for administrators.'}
                    </p>
                </div>
            </div>
        )
    }

    if (loading) return <div className="loading-inline"><div className="spinner" /></div>

    const dist = stats?.sentiment_distribution || { positive: 0, negative: 0, neutral: 0 }
    const totalSentiments = dist.positive + dist.negative + dist.neutral

    // Filter users by search
    const filteredUsers = users.filter(u =>
        !searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const tabs = [
        { id: 'overview', icon: <HiOutlineChartBar />, label: lang === 'ar' ? 'نظرة عامة' : 'Overview' },
        { id: 'users', icon: <HiOutlineUsers />, label: lang === 'ar' ? 'المستخدمون' : 'Users' },
        { id: 'analyses', icon: <HiOutlineDatabase />, label: lang === 'ar' ? 'جميع التحليلات' : 'All Analyses' },
        { id: 'models', icon: <HiOutlineSwitchHorizontal />, label: lang === 'ar' ? 'النماذج' : 'Models' },
        { id: 'model', icon: <HiOutlineCog />, label: lang === 'ar' ? 'النموذج الحالي' : 'Active Model' },
    ]

    return (
        <div className="fade-in">
            <div className="topbar">
                <h1 className="topbar-title">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</h1>
                <div className="topbar-actions" style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={loadData}>
                        <HiOutlineRefresh /> {lang === 'ar' ? 'تحديث' : 'Refresh'}
                    </button>
                    <span className="sentiment-badge sentiment-positive">
                        <HiOutlineShieldCheck /> {lang === 'ar' ? 'مسؤول' : 'Admin'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t.id)}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ───────── OVERVIEW ───────── */}
            {tab === 'overview' && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon"><HiOutlineUsers /></div>
                            <div className="stat-value">{stats?.total_users || 0}</div>
                            <div className="stat-label">{lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-icon"><HiOutlineCheck /></div>
                            <div className="stat-value">{stats?.active_users || 0}</div>
                            <div className="stat-label">{lang === 'ar' ? 'مستخدمون نشطون' : 'Active Users'}</div>
                        </div>
                        <div className="stat-card amber">
                            <div className="stat-icon"><HiOutlineChartBar /></div>
                            <div className="stat-value">{stats?.total_analyses || 0}</div>
                            <div className="stat-label">{lang === 'ar' ? 'إجمالي التحليلات' : 'Total Analyses'}</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-icon"><HiOutlineClock /></div>
                            <div className="stat-value">{stats?.avg_processing_time_ms || 0}ms</div>
                            <div className="stat-label">{lang === 'ar' ? 'متوسط وقت المعالجة' : 'Avg Processing Time'}</div>
                        </div>
                    </div>

                    {/* Quick summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
                        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>{totalSentiments > 0 ? ((dist.positive / totalSentiments) * 100).toFixed(0) : 0}%</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'إيجابي' : 'Positive'}</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>{totalSentiments > 0 ? ((dist.negative / totalSentiments) * 100).toFixed(0) : 0}%</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'سلبي' : 'Negative'}</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>{totalSentiments > 0 ? ((dist.neutral / totalSentiments) * 100).toFixed(0) : 0}%</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'محايد' : 'Neutral'}</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{((stats?.avg_confidence || 0) * 100).toFixed(0)}%</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'متوسط الثقة' : 'Avg Confidence'}</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats?.total_reports || 0}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'التقارير' : 'Reports'}</div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card">
                            <div className="card-header">
                                <h3 className="card-title">{lang === 'ar' ? 'توزيع المشاعر (عام)' : 'Global Sentiment Distribution'}</h3>
                            </div>
                            {totalSentiments > 0 ? (
                                <Plot
                                    data={[{
                                        values: [dist.positive, dist.negative, dist.neutral],
                                        labels: [lang === 'ar' ? 'إيجابي' : 'Positive', lang === 'ar' ? 'سلبي' : 'Negative', lang === 'ar' ? 'محايد' : 'Neutral'],
                                        type: 'pie', marker: { colors: ['#10B981', '#EF4444', '#F59E0B'] },
                                        hole: 0.45, textfont: { color: '#F1F5F9', size: 13 },
                                    }]}
                                    layout={{ paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', showlegend: true, legend: { font: { color: '#94A3B8' } }, margin: { t: 20, b: 20, l: 20, r: 20 }, height: 280 }}
                                    config={{ displayModeBar: false, responsive: true }}
                                    style={{ width: '100%' }}
                                />
                            ) : <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">{lang === 'ar' ? 'لا توجد بيانات' : 'No data'}</div></div>}
                        </div>
                        <div className="chart-card">
                            <div className="card-header">
                                <h3 className="card-title">{lang === 'ar' ? 'أكثر المستخدمين نشاطاً' : 'Top Users'}</h3>
                            </div>
                            {stats?.top_users?.length > 0 ? (
                                <Plot
                                    data={[{
                                        x: stats.top_users.map(u => u.username),
                                        y: stats.top_users.map(u => u.count),
                                        type: 'bar', marker: { color: '#3B82F6' },
                                    }]}
                                    layout={{ paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', margin: { t: 20, b: 40, l: 40, r: 20 }, height: 280, xaxis: { color: '#64748B', gridcolor: 'rgba(255,255,255,0.05)' }, yaxis: { color: '#64748B', gridcolor: 'rgba(255,255,255,0.05)' } }}
                                    config={{ displayModeBar: false, responsive: true }}
                                    style={{ width: '100%' }}
                                />
                            ) : <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">{lang === 'ar' ? 'لا توجد بيانات' : 'No data'}</div></div>}
                        </div>
                    </div>

                    {/* Source breakdown */}
                    <div className="card" style={{ marginTop: 16 }}>
                        <div className="card-header">
                            <h3 className="card-title">{lang === 'ar' ? 'مصادر التحليل' : 'Analysis Sources'}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                            {Object.entries(stats?.source_breakdown || {}).map(([source, count]) => (
                                <div key={source} style={{ textAlign: 'center', padding: '8px 0' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700 }}>{count}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                        {source === 'manual' ? (lang === 'ar' ? '📝 يدوي' : '📝 Manual') : (lang === 'ar' ? '📁 ملف' : '📁 File')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ───────── USERS ───────── */}
            {tab === 'users' && (
                <div className="card">
                    <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <h3 className="card-title">{lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'} ({filteredUsers.length})</h3>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                            <HiOutlineSearch style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text" placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 36px 8px 12px', borderRadius: 8,
                                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)', fontSize: 14,
                                }}
                            />
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{lang === 'ar' ? 'المستخدم' : 'Username'}</th>
                                <th>{lang === 'ar' ? 'البريد' : 'Email'}</th>
                                <th>{lang === 'ar' ? 'الدور' : 'Role'}</th>
                                <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th>{lang === 'ar' ? 'التحليلات' : 'Analyses'}</th>
                                <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                                    <td>
                                        <span className={`sentiment-badge ${u.role === 'admin' ? 'sentiment-positive' : u.role === 'guest' ? 'sentiment-neutral' : ''}`} style={{ fontSize: 12 }}>
                                            {u.role === 'admin' ? '👑' : u.role === 'guest' ? '⏳' : '👤'} {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`sentiment-badge ${u.is_active ? 'sentiment-positive' : 'sentiment-negative'}`} style={{ fontSize: 12 }}>
                                            {u.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{u.analysis_count}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {u.role !== 'guest' && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => toggleUserRole(u.id, u.role)} title={u.role === 'admin' ? 'Demote' : 'Promote'}>
                                                    {u.role === 'admin' ? '👤' : '👑'}
                                                </button>
                                            )}
                                            <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleUserStatus(u.id, u.is_active)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                                                {u.is_active ? <HiOutlineBan /> : <HiOutlineCheck />}
                                            </button>
                                            {u.id !== user?.id && (
                                                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id, u.username)} title="Delete">
                                                    <HiOutlineTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ───────── ALL ANALYSES ───────── */}
            {tab === 'analyses' && (
                <div className="card">
                    <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <h3 className="card-title">{lang === 'ar' ? 'جميع التحليلات' : 'All Analyses'} ({analyses.total})</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['', 'positive', 'negative', 'neutral'].map(s => (
                                <button key={s} className={`btn btn-sm ${sentimentFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => { setSentimentFilter(s); setTimeout(() => loadAnalysesPage(1), 0) }}>
                                    {s === '' ? (lang === 'ar' ? 'الكل' : 'All') :
                                        s === 'positive' ? '😊' : s === 'negative' ? '😠' : '😐'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {analyses.items?.length > 0 ? (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                                        <th style={{ width: '35%' }}>{lang === 'ar' ? 'النص' : 'Text'}</th>
                                        <th>{lang === 'ar' ? 'النتيجة' : 'Sentiment'}</th>
                                        <th>{lang === 'ar' ? 'الثقة' : 'Confidence'}</th>
                                        <th>{lang === 'ar' ? 'المصدر' : 'Source'}</th>
                                        <th>{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analyses.items.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 500, fontSize: 13 }}>{item.username}</td>
                                            <td className="text-col" dir="rtl" style={{ fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.input_text}</td>
                                            <td>
                                                <span className={`sentiment-badge sentiment-${item.result?.sentiment || 'neutral'}`} style={{ fontSize: 12 }}>
                                                    {item.result?.sentiment === 'positive' ? '😊' : item.result?.sentiment === 'negative' ? '😠' : '😐'}
                                                    {' '}{item.result?.sentiment}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{((item.result?.confidence || 0) * 100).toFixed(1)}%</td>
                                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {item.source_type === 'manual' ? '📝' : '📁'} {item.source_type}
                                            </td>
                                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="pagination">
                                <button onClick={() => loadAnalysesPage(analyses.page - 1)} disabled={analyses.page <= 1} className="btn btn-secondary btn-sm">
                                    {lang === 'ar' ? '→' : '←'}
                                </button>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                    {analyses.page} / {analyses.pages}
                                </span>
                                <button onClick={() => loadAnalysesPage(analyses.page + 1)} disabled={analyses.page >= analyses.pages} className="btn btn-secondary btn-sm">
                                    {lang === 'ar' ? '←' : '→'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-text">{lang === 'ar' ? 'لا توجد تحليلات' : 'No analyses yet'}</div>
                        </div>
                    )}
                </div>
            )}

            {/* ───────── MODELS REGISTRY ───────── */}
            {tab === 'models' && (
                <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-header">
                            <h3 className="card-title">{lang === 'ar' ? 'سجل النماذج المتاحة' : 'Available AI Models'}</h3>
                            <span className="sentiment-badge sentiment-neutral" style={{ fontSize: 12 }}>
                                {models.length} {lang === 'ar' ? 'نموذج مسجل' : 'models registered'}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                            {lang === 'ar'
                                ? 'يمكنك تبديل النموذج النشط في أي وقت. سيتم تحميل النموذج الجديد فوراً (Hot-Swap) دون إعادة تشغيل الخادم.'
                                : 'You can switch the active model at any time. The new model will be loaded instantly (Hot-Swap) without restarting the server.'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
                        {models.map(m => (
                            <div key={m.id} className="card" style={{
                                border: m.is_active ? '2px solid #10B981' : '1px solid var(--border-color)',
                                position: 'relative',
                            }}>
                                {m.is_active && (
                                    <div style={{
                                        position: 'absolute', top: 12, left: 12,
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        color: '#fff', padding: '4px 12px', borderRadius: 12,
                                        fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                                    }}>
                                        {lang === 'ar' ? '✓ نشط' : '✓ ACTIVE'}
                                    </div>
                                )}

                                <div style={{ marginBottom: 16 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{m.name}</h3>
                                    <code style={{
                                        display: 'inline-block', fontSize: 11, padding: '3px 8px',
                                        background: 'rgba(59, 130, 246, 0.15)', borderRadius: 6,
                                        color: '#60A5FA', marginBottom: 8,
                                    }}>
                                        {m.huggingface_id}
                                    </code>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {lang === 'ar' ? m.description_ar : m.description}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 16 }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'البنية: ' : 'Architecture: '}</span>
                                        <span style={{ fontWeight: 600 }}>{m.architecture}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'المصدر: ' : 'Source: '}</span>
                                        <span style={{ fontWeight: 600 }}>{m.source}</span>
                                    </div>
                                    {m.last_used_at && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'آخر استخدام: ' : 'Last used: '}</span>
                                            <span style={{ fontWeight: 500 }}>{new Date(m.last_used_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {!m.is_active && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => switchModel(m.id)}
                                        disabled={switchingModelId === m.id}
                                        style={{ width: '100%' }}
                                    >
                                        {switchingModelId === m.id
                                            ? <><div className="spinner" style={{ width: 16, height: 16 }} /> {lang === 'ar' ? 'جاري التحميل...' : 'Loading model...'}</>
                                            : <><HiOutlineSwitchHorizontal /> {lang === 'ar' ? 'تفعيل هذا النموذج' : 'Activate This Model'}</>
                                        }
                                    </button>
                                )}
                                {m.is_active && (
                                    <div style={{
                                        textAlign: 'center', padding: 10,
                                        background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8,
                                        color: '#10B981', fontWeight: 600, fontSize: 13,
                                    }}>
                                        {lang === 'ar' ? '✓ هذا النموذج قيد الاستخدام حالياً' : '✓ Currently Active Model'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ───────── MODEL ───────── */}
            {tab === 'model' && modelInfo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">{lang === 'ar' ? 'حالة النموذج' : 'Model Status'}</h3>
                            <span className={`sentiment-badge ${modelInfo.is_ready ? 'sentiment-positive' : 'sentiment-negative'}`}>
                                {modelInfo.is_ready ? '🟢 Online' : '🔴 Offline'}
                            </span>
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {[
                                [lang === 'ar' ? 'اسم النموذج' : 'Model Name', modelInfo.model_name],
                                [lang === 'ar' ? 'البنية' : 'Architecture', modelInfo.architecture],
                                [lang === 'ar' ? 'الإطار' : 'Framework', modelInfo.framework],
                                [lang === 'ar' ? 'المصدر' : 'Source', modelInfo.source],
                                [lang === 'ar' ? 'الحد الأقصى للنص' : 'Max Length', `${modelInfo.max_length} tokens`],
                                [lang === 'ar' ? 'التصنيفات' : 'Labels', modelInfo.labels?.join(' · ')],
                            ].map(([label, value], i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                                    <span style={{ fontWeight: 500, fontSize: 13 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">{lang === 'ar' ? 'إحصائيات الأداء' : 'Performance Stats'}</h3>
                        </div>
                        <div style={{ display: 'grid', gap: 16, textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: '#3B82F6' }}>{stats?.avg_processing_time_ms || 0}ms</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>{((stats?.avg_confidence || 0) * 100).toFixed(1)}%</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'متوسط درجة الثقة' : 'Avg Confidence'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B' }}>{stats?.total_analyses || 0}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'إجمالي التحليلات المعالجة' : 'Total Analyses Processed'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Model Evaluation Panel */}
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <h3 className="card-title">{lang === 'ar' ? 'اختبار دقة النموذج (Benchmark)' : 'Model Performance Benchmark'}</h3>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {lang === 'ar'
                                        ? 'سيتم اختبار النموذج ضد 999 صف (مقسمة بالتساوي بين إيجابي، سلبي، محايد) لاكتشاف دقة المعرفة ومدى الخطأ.'
                                        : 'Will benchmark the model against 999 rows (33% positive, 33% negative, 33% neutral) to check golden accuracy.'
                                    }
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={runModelEval} disabled={evalLoading}>
                                {evalLoading && <div className="spinner" style={{ width: 16, height: 16 }} />}
                                {!evalLoading && <HiOutlineRefresh />}
                                {evalLoading 
                                    ? (lang === 'ar' ? `جاري الاختبار... (${evalTimer}ث)` : `Running... (${evalTimer}s)`)
                                    : (lang === 'ar' ? 'تشغيل فحص الأداء' : 'Start Performance Check')
                                }
                            </button>
                        </div>

                        {evalReport && !evalReport.error && (
                            <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, textAlign: 'center', marginBottom: 24 }}>
                                    <div>
                                        <div style={{ fontSize: 42, fontWeight: 800, color: evalReport.accuracy > 85 ? '#10B981' : '#F59E0B' }}>
                                            {evalReport.accuracy}%
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الدقة الإجمالية (Accuracy)' : 'Overall Accuracy'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 42, fontWeight: 800, color: '#3B82F6' }}>{evalReport.total_evaluated}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'إجمالي الصفوف المختبرة' : 'Total Evaluated Rows'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 42, fontWeight: 800, color: '#EF4444' }}>{evalReport.wrong}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'التخمينات الخاطئة' : 'Wrong Guesses'}</div>
                                    </div>
                                    {(evalReport.elapsed_seconds !== undefined) && (
                                        <div>
                                            <div style={{ fontSize: 42, fontWeight: 800, color: '#8B5CF6' }}>{evalReport.elapsed_seconds}s</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الوقت المستغرق' : 'Elapsed Time'}</div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                                    <h4 style={{ marginBottom: 12, fontSize: 14 }}>{lang === 'ar' ? 'تفاصيل الأخطاء حسب التصنيف' : 'Error Breakdown by Category'}</h4>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ flex: 1, padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <div style={{ color: '#10B981', fontWeight: 600 }}>إيجابي</div>
                                            <div style={{ fontSize: 24, fontWeight: 700 }}>{evalReport.errors_by_class?.positive || 0} خطأ</div>
                                            <div style={{ fontSize: 12, opacity: 0.7 }}>من أصل {evalReport.totals_by_class?.positive || 333} عينة</div>
                                        </div>
                                        <div style={{ flex: 1, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            <div style={{ color: '#EF4444', fontWeight: 600 }}>سلبي</div>
                                            <div style={{ fontSize: 24, fontWeight: 700 }}>{evalReport.errors_by_class?.negative || 0} خطأ</div>
                                            <div style={{ fontSize: 12, opacity: 0.7 }}>من أصل {evalReport.totals_by_class?.negative || 333} عينة</div>
                                        </div>
                                        <div style={{ flex: 1, padding: 12, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                            <div style={{ color: '#F59E0B', fontWeight: 600 }}>محايد</div>
                                            <div style={{ fontSize: 24, fontWeight: 700 }}>{evalReport.errors_by_class?.neutral || 0} خطأ</div>
                                            <div style={{ fontSize: 12, opacity: 0.7 }}>من أصل {evalReport.totals_by_class?.neutral || 333} عينة</div>
                                        </div>
                                    </div>
                                </div>

                                {evalReport.wrong_guesses && evalReport.wrong_guesses.length > 0 && (
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 16 }}>
                                        <h4 style={{ marginBottom: 12, fontSize: 14 }}>{lang === 'ar' ? 'قائمة التخمينات الخاطئة' : 'List of Wrong Guesses'}</h4>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: 8, padding: 8 }}>
                                            <table className="data-table" style={{ margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '50%' }}>{lang === 'ar' ? 'النص' : 'Text'}</th>
                                                        <th>{lang === 'ar' ? 'الصحيح' : 'True Label'}</th>
                                                        <th>{lang === 'ar' ? 'المتوقع (خاطئ)' : 'Predicted (Wrong)'}</th>
                                                        <th>{lang === 'ar' ? 'الثقة' : 'Confidence'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {evalReport.wrong_guesses.map((wg, idx) => (
                                                        <tr key={idx}>
                                                            <td dir="rtl" style={{ fontSize: 13, lineHeight: 1.5 }}>{wg.text}</td>
                                                            <td>
                                                                <span className={`sentiment-badge sentiment-${wg.true_label}`} style={{ fontSize: 12 }}>
                                                                    {wg.true_label === 'positive' ? '😊 إيجابي' : wg.true_label === 'negative' ? '😠 سلبي' : '😐 محايد'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`sentiment-badge sentiment-${wg.pred_label}`} style={{ fontSize: 12, opacity: 0.8, filter: 'saturate(0.5)' }}>
                                                                    {wg.pred_label === 'positive' ? '🤔 إيجابي' : wg.pred_label === 'negative' ? '🤔 سلبي' : '🤔 محايد'}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: 13 }}>{((wg.confidence || 0) * 100).toFixed(1)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {evalReport && evalReport.error && (
                            <div className="auth-error" style={{ marginTop: 16 }}>{evalReport.error}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
