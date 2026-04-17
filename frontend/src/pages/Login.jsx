import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const { t } = useLanguage()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
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
                    <h1 className="auth-title">{t('login')}</h1>
                    <p className="auth-subtitle">ASAS — Arabic Sentiment Analysis</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('email')}</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('password')}</label>
                        <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? t('loading') : t('login')}
                    </button>
                </form>

                <div className="auth-footer">
                    {t('register')}? <Link to="/register">{t('register')}</Link>
                </div>
            </div>
        </div>
    )
}
