import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import {
    HiOutlineLightBulb,
    HiOutlineChartSquareBar,
    HiOutlineFolderOpen,
    HiOutlineLightningBolt,
    HiOutlineShieldCheck,
    HiOutlineGlobe,
    HiOutlineUserGroup,
    HiOutlineAcademicCap
} from 'react-icons/hi'

export default function About() {
    const { t, isRTL, lang } = useLanguage()

    const sections = lang === 'ar' ? {
        heroTitle: 'عن نظام ASAS',
        heroSubtitle: 'نظام تحليل المشاعر العربية — منصة ذكية لفهم آراء العملاء وتحليل النصوص العربية بدقة عالية باستخدام الذكاء الاصطناعي.',
        whatTitle: 'ما هو ASAS؟',
        whatDesc: 'ASAS (نظام تحليل المشاعر العربية) هو منصة متكاملة مصممة لتحليل النصوص العربية واكتشاف المشاعر الكامنة فيها — سواء كانت إيجابية أو سلبية أو محايدة. يعتمد النظام على أحدث تقنيات معالجة اللغات الطبيعية (NLP) ونماذج الذكاء الاصطناعي المدربة خصيصاً على اللغة العربية ولهجاتها المتعددة.',
        howTitle: 'كيف يعمل النظام؟',
        howSteps: [
            { icon: '1', title: 'إدخال النص', desc: 'يقوم المستخدم بإدخال نص عربي يدوياً أو رفع ملف يحتوي على عدة نصوص (CSV أو Excel).' },
            { icon: '2', title: 'المعالجة والتحليل', desc: 'يتم تنظيف النص ومعالجته، ثم يُرسل إلى نموذج الذكاء الاصطناعي الذي يصنّف المشاعر بدقة عالية.' },
            { icon: '3', title: 'عرض النتائج', desc: 'تُعرض النتائج بشكل مرئي من خلال لوحة تحكم تفاعلية تتضمن رسومات بيانية ونسب ثقة دقيقة.' },
        ],
        featuresTitle: 'المميزات الرئيسية',
        featuresList: [
            { icon: 'bulb', title: 'تحليل ذكي بالذكاء الاصطناعي', desc: 'نماذج متقدمة مثل CamelBERT مدربة على فهم اللهجات العربية المختلفة والسياق اللغوي.' },
            { icon: 'chart', title: 'لوحة تحكم تفاعلية', desc: 'رسوم بيانية ديناميكية لعرض توزيع المشاعر والاتجاهات عبر الزمن.' },
            { icon: 'folder', title: 'تحليل الملفات بالجملة', desc: 'رفع ملفات CSV أو Excel لتحليل آلاف النصوص دفعة واحدة مع معالجة في الخلفية.' },
            { icon: 'bolt', title: 'سرعة فائقة', desc: 'معالجة النصوص في أقل من ثانية واحدة مع بنية تحتية محسّنة للأداء.' },
            { icon: 'shield', title: 'أمان وخصوصية', desc: 'تشفير البيانات أثناء النقل والتخزين مع الالتزام الكامل بمعايير الخصوصية.' },
            { icon: 'globe', title: 'دعم ثنائي اللغة', desc: 'واجهة مستخدم كاملة باللغتين العربية والإنجليزية مع تبديل فوري.' },
        ],
        audienceTitle: 'لمن صُمم هذا النظام؟',
        audienceList: [
            { icon: 'users', title: 'الشركات والأعمال', desc: 'لفهم آراء العملاء وتحسين المنتجات والخدمات بناءً على تحليل المشاعر.' },
            { icon: 'academic', title: 'الباحثون والأكاديميون', desc: 'لإجراء دراسات في معالجة اللغة العربية الطبيعية وتحليل البيانات النصية.' },
            { icon: 'bulb', title: 'المطورون', desc: 'لدمج إمكانيات تحليل المشاعر في تطبيقاتهم عبر واجهة برمجة التطبيقات (API).' },
        ],
        techTitle: 'التقنيات المستخدمة',
        techList: [
            'Python / Flask — الخادم الخلفي',
            'React.js — واجهة المستخدم الأمامية',
            'CamelBERT / XLM-RoBERTa — نماذج تحليل المشاعر',
            'SQLite / MySQL — قاعدة البيانات',
            'JWT — نظام المصادقة والتحقق',
            'Fernet (AES) — تشفير البيانات',
        ],
        backHome: 'العودة للصفحة الرئيسية',
    } : {
        heroTitle: 'About ASAS',
        heroSubtitle: 'Arabic Sentiment Analysis System — An intelligent platform for understanding customer opinions and analyzing Arabic text with high accuracy using Artificial Intelligence.',
        whatTitle: 'What is ASAS?',
        whatDesc: 'ASAS (Arabic Sentiment Analysis System) is a comprehensive platform designed to analyze Arabic text and detect the underlying sentiments — whether positive, negative, or neutral. The system leverages the latest Natural Language Processing (NLP) techniques and AI models specifically trained on the Arabic language and its diverse dialects.',
        howTitle: 'How Does It Work?',
        howSteps: [
            { icon: '1', title: 'Input Text', desc: 'The user enters Arabic text manually or uploads a file containing multiple texts (CSV or Excel).' },
            { icon: '2', title: 'Processing & Analysis', desc: 'The text is cleaned and preprocessed, then sent to the AI model which classifies the sentiment with high accuracy.' },
            { icon: '3', title: 'View Results', desc: 'Results are displayed visually through an interactive dashboard with charts and precise confidence scores.' },
        ],
        featuresTitle: 'Key Features',
        featuresList: [
            { icon: 'bulb', title: 'AI-Powered Analysis', desc: 'Advanced models like CamelBERT trained to understand various Arabic dialects and linguistic context.' },
            { icon: 'chart', title: 'Interactive Dashboard', desc: 'Dynamic charts and graphs showing sentiment distribution and trends over time.' },
            { icon: 'folder', title: 'Bulk File Analysis', desc: 'Upload CSV or Excel files to analyze thousands of texts at once with background processing.' },
            { icon: 'bolt', title: 'Lightning Fast', desc: 'Text processing in under one second with a performance-optimized infrastructure.' },
            { icon: 'shield', title: 'Security & Privacy', desc: 'Data encryption in transit and at rest with full compliance to privacy standards.' },
            { icon: 'globe', title: 'Bilingual Support', desc: 'Full user interface in both Arabic and English with instant switching.' },
        ],
        audienceTitle: 'Who Is This For?',
        audienceList: [
            { icon: 'users', title: 'Businesses & Enterprises', desc: 'To understand customer opinions and improve products and services based on sentiment analysis.' },
            { icon: 'academic', title: 'Researchers & Academics', desc: 'To conduct studies in Arabic NLP and textual data analysis.' },
            { icon: 'bulb', title: 'Developers', desc: 'To integrate sentiment analysis capabilities into their applications via API.' },
        ],
        techTitle: 'Technology Stack',
        techList: [
            'Python / Flask — Backend Server',
            'React.js — Frontend Interface',
            'CamelBERT / XLM-RoBERTa — Sentiment Analysis Models',
            'SQLite / MySQL — Database',
            'JWT — Authentication System',
            'Fernet (AES) — Data Encryption',
        ],
        backHome: 'Back to Home',
    }

    const iconMap = {
        bulb: <HiOutlineLightBulb />,
        chart: <HiOutlineChartSquareBar />,
        folder: <HiOutlineFolderOpen />,
        bolt: <HiOutlineLightningBolt />,
        shield: <HiOutlineShieldCheck />,
        globe: <HiOutlineGlobe />,
        users: <HiOutlineUserGroup />,
        academic: <HiOutlineAcademicCap />,
    }

    const iconColors = ['blue', 'purple', 'pink', 'cyan', 'blue', 'purple']

    return (
        <div className="auth-page" style={{ padding: '60px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="auth-card slide-up" style={{ maxWidth: 860, width: '100%', padding: '48px 40px' }} dir={isRTL ? 'rtl' : 'ltr'}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link to="/">
                        <div style={{ background: '#e2e8f0', padding: '12px 24px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" alt="ASAS Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                        </div>
                    </Link>
                    <h1 className="auth-title" style={{ fontSize: 28 }}>{sections.heroTitle}</h1>
                    <p className="auth-subtitle" style={{ maxWidth: 600, margin: '8px auto 0', lineHeight: 1.7 }}>{sections.heroSubtitle}</p>
                </div>

                <div style={{ color: '#cbd5e1', lineHeight: 1.85, fontSize: 15 }}>

                    {/* What is ASAS */}
                    <div style={{ marginBottom: 36 }}>
                        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineLightBulb size={24} color="#3B82F6" /> {sections.whatTitle}
                        </h2>
                        <p style={{ paddingInlineStart: 34 }}>{sections.whatDesc}</p>
                    </div>

                    {/* How it works */}
                    <div style={{ marginBottom: 36 }}>
                        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineLightningBolt size={24} color="#10B981" /> {sections.howTitle}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingInlineStart: 10 }}>
                            {sections.howSteps.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#fff', fontSize: 16, marginBottom: 4 }}>{step.title}</h4>
                                        <p style={{ margin: 0, color: '#94a3b8' }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Features */}
                    <div style={{ marginBottom: 36 }}>
                        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineChartSquareBar size={24} color="#8B5CF6" /> {sections.featuresTitle}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                            {sections.featuresList.map((feat, i) => (
                                <div key={i} className="stitch-feature-card" style={{ padding: '20px', borderRadius: '14px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(71,85,105,0.3)' }}>
                                    <div className={`stitch-feature-icon ${iconColors[i]}`} style={{ marginBottom: 10, width: 40, height: 40, fontSize: 18 }}>
                                        {iconMap[feat.icon]}
                                    </div>
                                    <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 6 }}>{feat.title}</h4>
                                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div style={{ marginBottom: 36 }}>
                        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineUserGroup size={24} color="#F59E0B" /> {sections.audienceTitle}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingInlineStart: 10 }}>
                            {sections.audienceList.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ color: '#3B82F6', fontSize: 22, marginTop: 2, flexShrink: 0 }}>{iconMap[item.icon]}</div>
                                    <div>
                                        <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 4 }}>{item.title}</h4>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div style={{ marginBottom: 36 }}>
                        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineAcademicCap size={24} color="#EC4899" /> {sections.techTitle}
                        </h2>
                        <div style={{ paddingInlineStart: 34, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {sections.techList.map((tech, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', flexShrink: 0 }} />
                                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{tech}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <Link to="/" className="stitch-btn-secondary" style={{ display: 'inline-block' }}>
                        {sections.backHome}
                    </Link>
                </div>
            </div>
        </div>
    )
}
