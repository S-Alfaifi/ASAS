import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

const translations = {
    ar: {
        // Navigation
        dashboard: 'لوحة التحكم',
        analyze: 'تحليل النص',
        upload: 'رفع ملف',
        history: 'السجل',
        reports: 'التقارير',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',
        // Auth
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        username: 'اسم المستخدم',
        welcome: 'مرحباً',
        // Analysis
        enterText: 'أدخل النص العربي هنا...',
        analyzeBtn: 'تحليل',
        analyzing: 'جاري التحليل...',
        result: 'النتيجة',
        confidence: 'درجة الثقة',
        positive: 'إيجابي',
        negative: 'سلبي',
        neutral: 'محايد',
        // Dashboard
        totalAnalyses: 'إجمالي التحليلات',
        todayAnalyses: 'تحليلات اليوم',
        avgConfidence: 'متوسط الثقة',
        sentimentDist: 'توزيع المشاعر',
        recentAnalyses: 'أحدث التحليلات',
        trends: 'الاتجاهات',
        // File Upload
        dropFile: 'اسحب الملف هنا أو اضغط للاختيار',
        supportedFormats: 'الصيغ المدعومة: CSV, XLSX',
        uploadBtn: 'رفع وتحليل',
        uploading: 'جاري الرفع والبدء...',
        processingWarning: 'قد يستغرق تحليل الملف عدة دقائق حسب حجمه. يمكنك الانتقال لصفحات أخرى وسوف يستمر التحليل في الخلفية.',
        activeJobs: 'المهام الحالية',
        completedJobs: 'المهام المكتملة',
        jobProcessing: 'جاري المعالجة...',
        jobCompleted: 'مكتمل',
        jobFailed: 'فشل',
        clearCompleted: 'مسح المكتمل',
        viewResults: 'عرض النتائج',
        backgroundRunning: 'يعمل في الخلفية...',
        // Reports
        generateReport: 'إنشاء تقرير',
        reportTitle: 'عنوان التقرير',
        noReports: 'لا توجد تقارير بعد',
        // General
        noData: 'لا توجد بيانات',
        delete: 'حذف',
        cancel: 'إلغاء',
        save: 'حفظ',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'تمت العملية بنجاح',
        // Landing
        heroTitle: 'نظام تحليل المشاعر العربية',
        heroSubtitle: 'حلل مشاعر عملائك من النصوص العربية باستخدام الذكاء الاصطناعي',
        getStarted: 'ابدأ الآن',
        features: 'المميزات',
        feature1Title: 'تحليل ذكي',
        feature1Desc: 'نموذج ذكاء اصطناعي مدرب على اللغة العربية لتحليل دقيق للمشاعر',
        feature2Title: 'لوحة تحكم تفاعلية',
        feature2Desc: 'رسوم بيانية ومخططات تفاعلية لعرض نتائج التحليل بشكل مرئي',
        feature3Title: 'تحليل الملفات',
        feature3Desc: 'ارفع ملفات CSV أو Excel لتحليل آلاف النصوص دفعة واحدة',
        // Landing (Extended)
        poweredBy: 'مدعوم بنموذج AraBERT v2',
        discoverPower: 'اكتشف قوة الكلمات مع',
        landingTitleFirst: 'نظام تحليل المشاعر',
        landingTitleSecond: 'العربية',
        landingSubtitle: 'أول منصة متخصصة في فهم وتحليل النصوص العربية بدقة متناهية باستخدام أحدث تقنيات الذكاء الاصطناعي ومعالجة اللغات الطبيعية.',
        tryAsGuest: 'تجربة كزائر',
        startForFree: 'ابدأ مجاناً',
        statSpeed: 'سرعة معالجة النصوص',
        statClasses: 'تصنيفات دقيقة للمشاعر',
        statModel: 'نموذج اللغة المستخدم',
        featuresHeaderPt1: 'مميزات صممت',
        featuresHeaderPt2: 'للمطورين والشركات',
        featuresHeaderDesc: 'أدوات قوية تساعدك على فهم عملائك وتحليل آرائهم بدقة غير مسبوقة.',
        viewAllFeatures: 'عرض كل المميزات',
        feature1DescExt: 'خوارزميات ذكاء اصطناعي تفهم اللهجات العربية المختلفة والسياق العام للنص بدقة عالية جداً.',
        feature2DescExt: 'واجهة مستخدم عصرية تمكنك من متابعة النتائج والتقارير في الوقت الفعلي مع رسوم بيانية توضيحية.',
        feature3DescExt: 'لا داعي للنسخ واللصق. قم برفع ملفات Excel أو CSV وسيقوم النظام بتحليل آلاف النصوص دفعة واحدة.',
        feature4Title: 'سرعة فائقة',
        feature4Desc: 'بنية تحتية سحابية متينة تضمن استجابة فورية لطلبات الـ API الخاصة بك مهما كان حجم البيانات.',
        aboutSystem: 'عن النظام',
        pricing: 'الأسعار',
        privacyPolicy: 'سياسة الخصوصية',
        contactUs: 'اتصل بنا',
        copyrightText: 'ASAS. جميع الحقوق محفوظة. تم التطوير باستخدام أحدث تقنيات الذكاء الاصطناعي.',
    },
    en: {
        dashboard: 'Dashboard',
        analyze: 'Analyze Text',
        upload: 'Upload File',
        history: 'History',
        reports: 'Reports',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        username: 'Username',
        welcome: 'Welcome',
        enterText: 'Enter Arabic text here...',
        analyzeBtn: 'Analyze',
        analyzing: 'Analyzing...',
        result: 'Result',
        confidence: 'Confidence',
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        totalAnalyses: 'Total Analyses',
        todayAnalyses: "Today's Analyses",
        avgConfidence: 'Avg Confidence',
        sentimentDist: 'Sentiment Distribution',
        recentAnalyses: 'Recent Analyses',
        trends: 'Trends',
        dropFile: 'Drop file here or click to select',
        supportedFormats: 'Supported formats: CSV, XLSX',
        uploadBtn: 'Upload & Analyze',
        uploading: 'Uploading & Starting...',
        processingWarning: 'File analysis may take a few minutes depending on file size. You can navigate to other pages — processing continues in the background.',
        activeJobs: 'Active Jobs',
        completedJobs: 'Completed Jobs',
        jobProcessing: 'Processing...',
        jobCompleted: 'Completed',
        jobFailed: 'Failed',
        clearCompleted: 'Clear Completed',
        viewResults: 'View Results',
        backgroundRunning: 'Running in background...',
        generateReport: 'Generate Report',
        reportTitle: 'Report Title',
        noReports: 'No reports yet',
        noData: 'No data available',
        delete: 'Delete',
        cancel: 'Cancel',
        save: 'Save',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Operation successful',
        heroTitle: 'Arabic Sentiment Analysis System',
        heroSubtitle: 'Analyze customer sentiments from Arabic text using Artificial Intelligence',
        getStarted: 'Get Started',
        features: 'Features',
        feature1Title: 'Smart Analysis',
        feature1Desc: 'AI model trained on Arabic language for accurate sentiment detection',
        feature2Title: 'Interactive Dashboard',
        feature2Desc: 'Interactive charts and graphs to visualize analysis results',
        feature3Title: 'File Analysis',
        feature3Desc: 'Upload CSV or Excel files to analyze thousands of texts at once',
        // Landing (Extended)
        poweredBy: 'Powered by AraBERT v2',
        discoverPower: 'Discover the power of words with',
        landingTitleFirst: 'Arabic Sentiment',
        landingTitleSecond: 'Analysis System',
        landingSubtitle: 'The first specialized platform to understand and analyze Arabic text with high accuracy using the latest AI and NLP technologies.',
        tryAsGuest: 'Try as Guest',
        startForFree: 'Start for Free',
        statSpeed: 'Text Processing Speed',
        statClasses: 'Accurate Sentiment Classes',
        statModel: 'Language Model Used',
        featuresHeaderPt1: 'Features designed',
        featuresHeaderPt2: 'for developers and companies',
        featuresHeaderDesc: 'Powerful tools to help you understand your clients and analyze their opinions with unprecedented accuracy.',
        viewAllFeatures: 'View all features',
        feature1DescExt: 'AI algorithms that understand different Arabic dialects and the overall context of the text with very high accuracy.',
        feature2DescExt: 'A modern UI that enables you to track results and reports in real-time with descriptive interactive charts.',
        feature3DescExt: 'No need to copy and paste. Upload Excel or CSV files and the system will analyze thousands of texts at once.',
        feature4Title: 'Lightning Fast',
        feature4Desc: 'Robust cloud infrastructure ensuring immediate response to your API requests regardless of the data volume.',
        aboutSystem: 'About the System',
        pricing: 'Pricing',
        privacyPolicy: 'Privacy Policy',
        contactUs: 'Contact Us',
        copyrightText: 'ASAS. All rights reserved. Developed using the latest Artificial Intelligence technologies.',
    },
}

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('asas_lang') || 'ar'
    })

    useEffect(() => {
        localStorage.setItem('asas_lang', lang)
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = lang
    }, [lang])

    const t = (key) => translations[lang]?.[key] || translations.en[key] || key
    const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar')
    const isRTL = lang === 'ar'

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, toggleLang, isRTL }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}
