import { createContext, useContext, useState, useEffect } from 'react'
import { analysisAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useLanguage } from './LanguageContext'

const BackgroundJobContext = createContext(null)

export function BackgroundJobProvider({ children }) {
    const { user } = useAuth()
    const { lang } = useLanguage()
    
    // We will keep a map of jobId -> job data
    const [jobs, setJobs] = useState({})
    
    // Load active jobs from local storage on init
    useEffect(() => {
        if (!user) {
            setJobs({})
            return
        }
        
        try {
            const storedJobs = JSON.parse(localStorage.getItem(`asas_jobs_${user.id}`)) || {}
            setJobs(storedJobs)
        } catch (err) {
            console.error('Failed to load jobs', err)
        }
    }, [user])
    
    // Save to local storage when state changes
    useEffect(() => {
        if (user && Object.keys(jobs).length > 0) {
            localStorage.setItem(`asas_jobs_${user.id}`, JSON.stringify(jobs))
        }
    }, [jobs, user])

    // Poll active jobs every 3 seconds
    useEffect(() => {
        if (!user) return
        
        const activeJobIds = Object.values(jobs)
            .filter(j => j.status === 'pending' || j.status === 'processing')
            .map(j => j.id)
            
        if (activeJobIds.length === 0) return
        
        const interval = setInterval(() => {
            activeJobIds.forEach(async (id) => {
                try {
                    const res = await analysisAPI.getFileJobStatus(id)
                    const updatedJob = res.data
                    
                    setJobs(prev => {
                        const newJobs = { ...prev, [id]: updatedJob }
                        // Basic notification check
                        if (
                            prev[id] && 
                            (prev[id].status === 'pending' || prev[id].status === 'processing') && 
                            updatedJob.status === 'completed'
                        ) {
                            // Show a native notification if possible (simple alert for now)
                            // A proper toast system would be better here, but alert suffices for a simple prototype
                            // Just setting the state is enough if the UI listens to it
                        }
                        return newJobs
                    })
                } catch (err) {
                    // Stop polling if 404
                    if (err.response?.status === 404) {
                        setJobs(prev => {
                            const newJobs = { ...prev }
                            delete newJobs[id]
                            return newJobs
                        })
                    }
                }
            })
        }, 3000)
        
        return () => clearInterval(interval)
    }, [jobs, user])

    const startJob = (jobId, data) => {
        setJobs(prev => ({
            ...prev,
            [jobId]: {
                id: jobId,
                status: 'pending',
                progress: 0,
                ...data
            }
        }))
    }
    
    const removeJob = (jobId) => {
        setJobs(prev => {
            const newJobs = { ...prev }
            delete newJobs[jobId]
            if (user) {
                // Instantly update localstorage to avoid flashes
                localStorage.setItem(`asas_jobs_${user.id}`, JSON.stringify(newJobs))
            }
            return newJobs
        })
    }

    const clearCompleted = () => {
        setJobs(prev => {
            const newJobs = {}
            Object.values(prev).forEach(j => {
                if (j.status === 'pending' || j.status === 'processing') {
                    newJobs[j.id] = j
                }
            })
            if (user) {
                localStorage.setItem(`asas_jobs_${user.id}`, JSON.stringify(newJobs))
            }
            return newJobs
        })
    }
    
    const activeJobs = Object.values(jobs).filter(j => j.status === 'pending' || j.status === 'processing')
    const completedJobs = Object.values(jobs).filter(j => j.status === 'completed' || j.status === 'failed')
    const hasActiveJobs = activeJobs.length > 0

    return (
        <BackgroundJobContext.Provider value={{ 
            jobs, 
            activeJobs, 
            completedJobs, 
            hasActiveJobs, 
            startJob, 
            removeJob,
            clearCompleted 
        }}>
            {children}
        </BackgroundJobContext.Provider>
    )
}

export function useBackgroundJobs() {
    const ctx = useContext(BackgroundJobContext)
    if (!ctx) throw new Error('useBackgroundJobs must be used within BackgroundJobProvider')
    return ctx
}
