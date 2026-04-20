import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineDatabase } from 'react-icons/hi'

export default function PrivacyPolicy() {
    const { t, isRTL, lang } = useLanguage()

    return (
        <div className="auth-page" style={{ padding: '60px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="auth-card slide-up" style={{ maxWidth: 800, width: '100%', padding: '40px' }} dir={isRTL ? 'rtl' : 'ltr'}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link to="/">
                        <div style={{ background: '#e2e8f0', padding: '12px 24px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" alt="ASAS Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                        </div>
                    </Link>
                    <h1 className="auth-title" style={{ fontSize: 28 }}>{t('privacyPolicy')}</h1>
                    <p className="auth-subtitle">ASAS — Arabic Sentiment Analysis System</p>
                </div>

                <div className="policy-content" style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: 16 }}>
                    {lang === 'ar' ? (
                        <>
                            <p style={{ marginBottom: 24 }}>
                                في نظام تحليل المشاعر العربية (ASAS)، نأخذ خصوصيتك وأمان بياناتك على محمل الجد. يتبع نظامنا أحدث المعايير الأخلاقية في تطوير الذكاء الاصطناعي لحماية بياناتك.
                            </p>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <HiOutlineShieldCheck size={28} color="#3B82F6" style={{ flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>متطلبات الأمان والامتثال</h3>
                                    <ul style={{ paddingInlineStart: 20 }}>
                                        <li style={{ marginBottom: 8 }}><strong>تشفير البيانات:</strong> تنفيذ تشفير SSL لتأمين البيانات المرسلة بين لوحة التحكم والخادم.</li>
                                        <li style={{ marginBottom: 8 }}><strong>حماية صارمة:</strong> حماية النصوص المدخلة من قبل المستخدمين ونتائج التحليل من خلال تخزين آمن ومحمي في قاعدة البيانات.</li>
                                        <li style={{ marginBottom: 8 }}><strong>الاستخدام المحدود:</strong> الامتثال المطلق لمبادئ خصوصية البيانات؛ حيث يتم استخدام نصوص العملاء للتحليل <strong>فقط</strong> ولن يتم مشاركتها خارجياً أبداً دون إذن صريح.</li>
                                        <li style={{ marginBottom: 8 }}><strong>المراقبة:</strong> إجراء فحوصات أمان منتظمة ومراجعة سجلات الوصول لمراقبة ومنع أي نشاط غير مصرح به.</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 16, marginTop: 24 }}>
                                <HiOutlineDatabase size={28} color="#10B981" style={{ flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>تخزين البيانات (طبقة التخزين)</h3>
                                    <p style={{ marginBottom: 8 }}>
                                        تدير طبقة البيانات وتخزن جميع المعلومات الأساسية، بما في ذلك النصوص المدخلة، وتوقعات النموذج، وسجلات تفاعل المستخدم.
                                    </p>
                                    <ul style={{ paddingInlineStart: 20 }}>
                                        <li style={{ marginBottom: 8 }}>باستخدام تقنيات تخزين مهيكلة، توفر هذه الطبقة بيئة آمنة تدعم الاسترجاع السريع والتحليل المستقبلي.</li>
                                        <li style={{ marginBottom: 8 }}><strong>إخفاء الهوية:</strong> يتم تشفير البيانات وإخفاء هويتها بالكامل لضمان الخصوصية القصوى والامتثال للمعايير والممارسات الأخلاقية.</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <p style={{ marginBottom: 24 }}>
                                At the Arabic Sentiment Analysis System (ASAS), we take your privacy and data security very seriously. Our system follows current ethical practices in AI development to secure your data.
                            </p>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <HiOutlineShieldCheck size={28} color="#3B82F6" style={{ flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Security and Compliance Requirements</h3>
                                    <ul style={{ paddingInlineStart: 20 }}>
                                        <li style={{ marginBottom: 8 }}><strong>Encryption:</strong> Implementation of SSL encryption to secure transmitted data between the dashboard client and server.</li>
                                        <li style={{ marginBottom: 8 }}><strong>Strict Protection:</strong> Protection of user-submitted text and analysis results through secure database storage.</li>
                                        <li style={{ marginBottom: 8 }}><strong>Limited Use:</strong> Compliance with data privacy principles. All customer text used in the system remains private. User input is used <strong>only</strong> for analysis and is never shared externally without permission.</li>
                                        <li style={{ marginBottom: 8 }}><strong>Monitoring:</strong> Regular security checks and access logs to continuously monitor and prevent unauthorized activity.</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 16, marginTop: 24 }}>
                                <HiOutlineDatabase size={28} color="#10B981" style={{ flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Data Tier (Storage Layer)</h3>
                                    <p style={{ marginBottom: 8 }}>
                                        The Data Tier manages and stores all essential information, including input texts, model predictions, and user interaction logs.
                                    </p>
                                    <ul style={{ paddingInlineStart: 20 }}>
                                        <li style={{ marginBottom: 8 }}>Using structured databases (MySQL/SQLite), this layer provides secure storage that supports quick retrieval and future analysis.</li>
                                        <li style={{ marginBottom: 8 }}><strong>Anonymization:</strong> Data is encrypted and anonymized to ensure maximum privacy and compliance with ethical standards and trustworthy AI practices.</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <Link to="/" className="stitch-btn-secondary" style={{ display: 'inline-block' }}>
                        {isRTL ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
