import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('asas_token')
        const savedUser = localStorage.getItem('asas_user')
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch {
                localStorage.removeItem('asas_token')
                localStorage.removeItem('asas_user')
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password })
        const { token, user: userData } = res.data
        localStorage.setItem('asas_token', token)
        localStorage.setItem('asas_user', JSON.stringify(userData))
        setUser(userData)
        return userData
    }

    const register = async (username, email, password, language_pref = 'ar') => {
        const res = await authAPI.register({ username, email, password, language_pref })
        const { token, user: userData } = res.data
        localStorage.setItem('asas_token', token)
        localStorage.setItem('asas_user', JSON.stringify(userData))
        setUser(userData)
        return userData
    }

    const guestLogin = async () => {
        const guestId = localStorage.getItem('asas_guest_id')
        const res = await authAPI.guest(guestId ? { guest_token: guestId } : {})
        const { token, user: userData } = res.data
        localStorage.setItem('asas_token', token)
        localStorage.setItem('asas_user', JSON.stringify(userData))
        if (userData.role === 'guest') {
            localStorage.setItem('asas_guest_id', userData.id)
        }
        setUser(userData)
        return userData
    }

    const logout = () => {
        localStorage.removeItem('asas_token')
        localStorage.removeItem('asas_user')
        setUser(null)
    }

    const updateUser = (userData) => {
        localStorage.setItem('asas_user', JSON.stringify(userData))
        setUser(userData)
    }

    const isAdmin = user?.role === 'admin'
    const isGuest = user?.role === 'guest'

    return (
        <AuthContext.Provider value={{ user, loading, login, register, guestLogin, logout, updateUser, isAdmin, isGuest }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
