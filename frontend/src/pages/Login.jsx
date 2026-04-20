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
                    <Link to="/">
                        <div style={{ background: '#e2e8f0', padding: '12px 24px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" alt="ASAS Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                        </div>
                    </Link>
                    <h1 className="auth-title">{t('login')}</h1>
                    <p className="auth-subtitle">ASAS — Arabic Sentiment Analysis System</p>
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
