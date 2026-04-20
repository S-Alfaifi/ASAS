import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import {
    HiOutlineLightningBolt,
    HiOutlineEye,
    HiOutlineBriefcase,
    HiOutlineFolderOpen,
    HiOutlineChartSquareBar,
    HiOutlineClock,
    HiOutlineGlobe,
    HiChevronLeft,
    HiX,
    HiOutlineLightBulb
} from 'react-icons/hi'
import { IoRocketOutline, IoEarthOutline, IoPieChartOutline, IoLanguageOutline } from "react-icons/io5"
import { BsDiscord, BsTwitter, BsGithub } from "react-icons/bs"

export default function Landing() {
    const { guestLogin, user } = useAuth()
    const { lang, toggleLang, t, isRTL } = useLanguage()
    const navigate = useNavigate()
    const [guestLoading, setGuestLoading] = useState(false)

    const handleGuest = async () => {
        setGuestLoading(true)
        try {
            await guestLogin()
            navigate('/analyze')
        } catch (err) {
            console.error(err)
        } finally {
            setGuestLoading(false)
        }
    }

    return (
        <div className="landing-stitch fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Navigation ── */}
            <nav className="stitch-nav">
                <Link to="/">
                    <div className="stitch-logo" style={{ background: '#e2e8f0', padding: '6px 16px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <img src="/logo.png" alt="ASAS Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                    </div>
                </Link>

                <div className="stitch-nav-actions">
                    <button className="stitch-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={toggleLang}>
                        <HiOutlineGlobe size={18} /> {lang === 'ar' ? 'English' : 'عربي'}
                    </button>
                    {user ? (
                        <Link to="/dashboard" className="stitch-btn-primary">{t('dashboard')}</Link>
                    ) : (
                        <>
                            <Link to="/login" className="stitch-link">{t('login')}</Link>
                            <Link to="/register" className="stitch-btn-nav">{t('register')} <HiChevronLeft style={{ display: 'inline', verticalAlign: 'middle', margin: isRTL ? '0 2px 0 0' : '0 0 0 2px', transform: isRTL ? 'none' : 'rotate(180deg)' }} /></Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="stitch-hero">


                <h1 className="stitch-hero-title">
                    <span className="white-text">{t('discoverPower')}</span>
                    <span className="stitch-gradient-text" style={{ marginTop: 8 }}>{t('landingTitleFirst')}<br />{t('landingTitleSecond')}</span>
                </h1>

                <p className="stitch-hero-subtitle">
                    {t('landingSubtitle')}
                </p>

                <div className="stitch-hero-actions">
                    {user ? (
                        <Link to="/dashboard" className="stitch-btn-primary">
                            <IoRocketOutline size={22} /> {t('dashboard')}
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="stitch-btn-secondary">
                                {t('login')}
                            </Link>
                            <Link to="/register" className="stitch-btn-primary">
                                <IoRocketOutline size={22} /> {t('register')}
                            </Link>
                        </>
                    )}
                </div>

                {/* ── Dashboard Mockup Graphic ── */}
                <div className="stitch-mockup">
                    <div className="stitch-mockup-header">
                        <div className="stitch-mockup-dot red"></div>
                        <div className="stitch-mockup-dot yellow"></div>
                        <div className="stitch-mockup-dot green"></div>

                        <div className="stitch-mockup-search"></div>
                        <div className="stitch-mockup-avatar"></div>
                    </div>
                    <div className="stitch-mockup-body">
                        {/* Background Grid Lines */}
                        <div className="mockup-grid-lines">
                            <div className="mockup-grid-line">80</div>
                            <div className="mockup-grid-line">50</div>
                            <div className="mockup-grid-line">10</div>
                        </div>

                        {/* Chart Bars */}
                        <div className="stitch-mockup-chart-bar b-green"></div>
                        <div className="stitch-mockup-chart-bar b-yellow"></div>
                        <div className="stitch-mockup-chart-bar b-red"></div>
                    </div>
                </div>
            </section>

            {/* ── Stats Section ── */}
            <section className="stitch-stats">
                <div className="stitch-stat-item">
                    <div className="stitch-stat-icon"><HiOutlineLightningBolt /></div>
                    <div className="stitch-stat-val">&lt;1s</div>
                    <div className="stitch-stat-label">{t('statSpeed')}</div>
                </div>
                <div className="stitch-stat-item">
                    <div className="stitch-stat-icon purple"><IoPieChartOutline /></div>
                    <div className="stitch-stat-val">3</div>
                    <div className="stitch-stat-label">{t('statClasses')}</div>
                </div>
            </section>

            {/* ── Features Section ── */}
            <section className="stitch-features">
                <div className="stitch-features-header">
                    <div>
                        <h2 className="stitch-features-title">{t('featuresHeaderPt1')} <span>{t('featuresHeaderPt2')}</span></h2>
                        <p className="stitch-features-subtitle">{t('featuresHeaderDesc')}</p>
                    </div>
                    <Link to="/register" className="stitch-features-link">
                        {t('viewAllFeatures')} <HiChevronLeft size={18} style={{ transform: isRTL ? 'none' : 'rotate(180deg)', display: 'inline', verticalAlign: 'middle' }} />
                    </Link>
                </div>

                <div className="stitch-features-grid">
                    <div className="stitch-feature-card">
                        <div className="stitch-feature-icon blue"><HiOutlineLightBulb /></div>
                        <h3 className="stitch-feature-title">{t('feature1Title')}</h3>
                        <p className="stitch-feature-desc">
                            {t('feature1DescExt')}
                        </p>
                    </div>

                    <div className="stitch-feature-card">
                        <div className="stitch-feature-icon purple"><HiOutlineChartSquareBar /></div>
                        <h3 className="stitch-feature-title">{t('feature2Title')}</h3>
                        <p className="stitch-feature-desc">
                            {t('feature2DescExt')}
                        </p>
                    </div>

                    <div className="stitch-feature-card">
                        <div className="stitch-feature-icon pink"><HiOutlineFolderOpen /></div>
                        <h3 className="stitch-feature-title">{t('feature3Title')}</h3>
                        <p className="stitch-feature-desc">
                            {t('feature3DescExt')}
                        </p>
                    </div>

                    <div className="stitch-feature-card">
                        <div className="stitch-feature-icon cyan"><HiOutlineLightningBolt /></div>
                        <h3 className="stitch-feature-title">{t('feature4Title')}</h3>
                        <p className="stitch-feature-desc">
                            {t('feature4Desc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="stitch-footer">
                <div className="stitch-footer-top">
                    {/* Logo Section */}
                    <Link to="/" style={{ display: 'inline-block', marginBottom: 0 }}>
                        <div className="stitch-logo" style={{ marginBottom: 0, background: '#e2e8f0', padding: '6px 16px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/logo.png" alt="ASAS Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                        </div>
                    </Link>

                    {/* Links */}
                    <div className="stitch-footer-links">
                        <Link to="#">{t('aboutSystem')}</Link>
                        <Link to="#">{t('pricing')}</Link>
                        <Link to="#">{t('privacyPolicy')}</Link>
                        <Link to="#">{t('contactUs')}</Link>
                    </div>

                    {/* Socials */}
                    <div className="stitch-socials">
                        <a href="#" className="stitch-social-btn"><IoEarthOutline /></a>
                        <a href="#" className="stitch-social-btn"><BsTwitter /></a>
                        <a href="#" className="stitch-social-btn"><BsGithub /></a>
                        <a href="#" className="stitch-social-btn"><BsDiscord /></a>
                    </div>
                </div>

                <div className="stitch-footer-copyright">
                    © {new Date().getFullYear()} {t('copyrightText')}
                </div>
            </footer>
        </div>
    )
}
