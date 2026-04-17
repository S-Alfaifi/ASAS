import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { authAPI } from '../services/api'

export default function Settings() {
    const { user, updateUser } = useAuth()
    const { t, lang, setLang } = useLanguage()
    const [username, setUsername] = useState(user?.username || '')
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    const handleSave = async () => {
        setError('')
        setSaved(false)
        try {
            const res = await authAPI.updateProfile({ username, language_pref: lang })
            updateUser(res.data.user)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || t('error'))
        }
    }

    return (
        <div className="fade-in">
            <div className="topbar">
                <h1 className="topbar-title">{t('settings')}</h1>
            </div>

            <div className="settings-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</h3>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('username')}</label>
                        <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('email')}</label>
                        <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    {saved && <div style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{t('success')}</div>}
                    <button className="btn btn-primary" onClick={handleSave}>{t('save')}</button>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{lang === 'ar' ? 'اللغة' : 'Language'}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className={`btn ${lang === 'ar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLang('ar')}>
                            🇸🇦 عربي
                        </button>
                        <button className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLang('en')}>
                            🇺🇸 English
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</h3>
                    </div>
                    <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الدور' : 'Role'}</span>
                            <span>{user?.role}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</span>
                            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</span>
                            <span className="sentiment-badge sentiment-positive">
                                {lang === 'ar' ? 'نشط' : 'Active'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
