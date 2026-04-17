import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { HiMenuAlt2 } from 'react-icons/hi'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { isRTL } = useLanguage()

    return (
        <div className="app-layout">
            <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <HiMenuAlt2 />
            </button>
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="main-content fade-in">
                <Outlet />
            </main>
        </div>
    )
}
