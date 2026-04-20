import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useBackgroundJobs } from '../context/BackgroundJobContext'
import { HiOutlineChartPie, HiOutlineUpload, HiOutlineClock, HiOutlineDocumentReport, HiOutlineCog, HiOutlineLogout, HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineRefresh } from 'react-icons/hi'

export default function Sidebar({ open, onClose }) {
    const { user, logout, isAdmin, isGuest } = useAuth()
    const { t, toggleLang, lang } = useLanguage()
    const { hasActiveJobs, activeJobs } = useBackgroundJobs()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const links = [
        { to: '/dashboard', icon: <HiOutlineChartPie />, label: t('dashboard') },
        { to: '/history', icon: <HiOutlineClock />, label: t('history') },
        { to: '/reports', icon: <HiOutlineDocumentReport />, label: t('reports') },
        { to: '/settings', icon: <HiOutlineCog />, label: t('settings') },
    ]

    // Only show admin link if user is admin
    if (isAdmin) {
        links.push({ to: '/admin', icon: <HiOutlineShieldCheck />, label: lang === 'ar' ? 'الإدارة' : 'Admin' })
    }

    return (
        <aside className={`sidebar ${open ? 'open' : ''}`}>
            <div className="sidebar-header">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 12 }}>
                    <div style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/logo.png" alt="ASAS Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                    </div>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}

                {/* Active Jobs Indicator */}
                {hasActiveJobs && (
                    <NavLink to="/upload" className="sidebar-link" onClick={onClose} style={{ marginTop: 8, background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <HiOutlineRefresh className="spinner" />
                            <span>{t('backgroundRunning')}</span>
                        </div>
                        <div style={{ background: '#3B82F6', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>
                            {activeJobs.length}
                        </div>
                    </NavLink>
                )}

                <div style={{ flex: 1 }} />

                {/* Guest quota banner */}
                {isGuest && (
                    <div style={{
                        margin: '0 12px', padding: '10px 12px', borderRadius: 8,
                        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                        fontSize: 12, color: '#F59E0B', textAlign: 'center', lineHeight: 1.5,
                    }}>
                        {lang === 'ar' ? '⏳ وضع الزائر — محدود' : '⏳ Guest Mode — Limited'}
                        <div style={{ marginTop: 6 }}>
                            <NavLink to="/register" style={{ color: '#3B82F6', textDecoration: 'underline', fontSize: 12 }} onClick={onClose}>
                                {lang === 'ar' ? 'أنشئ حساب مجاني' : 'Create Free Account'}
                            </NavLink>
                        </div>
                    </div>
                )}

                <button className="sidebar-link" onClick={toggleLang}>
                    <HiOutlineGlobeAlt />
                    <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
                </button>

                <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--accent-red)' }}>
                    <HiOutlineLogout />
                    <span>{isGuest ? (lang === 'ar' ? 'خروج' : 'Exit') : t('logout')}</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar" style={isAdmin ? { background: 'linear-gradient(135deg, #F59E0B, #EF4444)' } : {}}>
                        {isAdmin ? '👑' : isGuest ? '👤' : user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="sidebar-username">{user?.username || 'User'}</div>
                        <div className="sidebar-role" style={isAdmin ? { color: '#F59E0B' } : {}}>
                            {isAdmin ? (lang === 'ar' ? 'مسؤول' : 'Admin') : isGuest ? (lang === 'ar' ? 'زائر' : 'Guest') : (user?.role || 'user')}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
