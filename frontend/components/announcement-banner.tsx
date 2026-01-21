"use client"

import * as React from "react"
import { X, Info, AlertTriangle, CheckCircle, Megaphone } from "lucide-react"

interface Announcement {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success'
    createdAt: string
}

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
    const [dismissed, setDismissed] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        // Load dismissed from session storage
        const savedDismissed = sessionStorage.getItem('dismissedAnnouncements')
        if (savedDismissed) {
            setDismissed(new Set(JSON.parse(savedDismissed)))
        }

        fetch("http://localhost:3001/api/announcements", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) setAnnouncements(data)
            })
            .catch(() => { })
    }, [])

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissed)
        newDismissed.add(id)
        setDismissed(newDismissed)
        sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newDismissed)))
    }

    const visibleAnnouncements = announcements.filter(a => !dismissed.has(a.id))

    if (visibleAnnouncements.length === 0) return null

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning':
                return {
                    bg: 'bg-amber-500/10 border-amber-500/30',
                    icon: AlertTriangle,
                    iconColor: 'text-amber-400'
                }
            case 'success':
                return {
                    bg: 'bg-green-500/10 border-green-500/30',
                    icon: CheckCircle,
                    iconColor: 'text-green-400'
                }
            default: // info
                return {
                    bg: 'bg-blue-500/10 border-blue-500/30',
                    icon: Info,
                    iconColor: 'text-blue-400'
                }
        }
    }

    return (
        <div className="space-y-2 mb-6">
            {visibleAnnouncements.map(announcement => {
                const styles = getTypeStyles(announcement.type)
                const Icon = styles.icon

                return (
                    <div
                        key={announcement.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${styles.bg} animate-in slide-in-from-top-2`}
                    >
                        <Icon className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Megaphone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Announcement
                                </span>
                            </div>
                            <p className="font-medium text-white mt-1">{announcement.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{announcement.message}</p>
                        </div>
                        <button
                            onClick={() => handleDismiss(announcement.id)}
                            className="text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
