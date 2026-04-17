import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const { t, lang } = useLanguage()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(username, email, password, lang)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || t('error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card slide-up">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div className="sidebar-logo" style={{ margin: '0 auto 12px', width: 48, height: 48, fontSize: 22 }}>أ</div>
                    <h1 className="auth-title">{t('register')}</h1>
                    <p className="auth-subtitle">ASAS — Arabic Sentiment Analysis</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('username')}</label>
                        <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('username')} required minLength={3} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('email')}</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('password')}</label>
                        <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? t('loading') : t('register')}
                    </button>
                </form>

                <div className="auth-footer">
                    {t('login')}? <Link to="/login">{t('login')}</Link>
                </div>
            </div>
        </div>
    )
}
