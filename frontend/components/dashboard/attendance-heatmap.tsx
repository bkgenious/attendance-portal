"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AttendanceDay {
    date: string
    status: 'present' | 'absent' | 'late' | 'leave' | 'weekend' | 'holiday' | 'future'
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AttendanceHeatmap() {
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [attendanceData, setAttendanceData] = React.useState<Record<string, string>>({})
    const [loading, setLoading] = React.useState(true)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    React.useEffect(() => {
        fetchAttendance()
        const interval = setInterval(fetchAttendance, 30000)
        return () => clearInterval(interval)
    }, [year, month])

    const fetchAttendance = async () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const res = await fetch(
                `http://localhost:3001/api/attendance/my?month=${month + 1}&year=${year}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (res.ok) {
                const data = await res.json()
                const map: Record<string, string> = {}

                if (data.data) {
                    data.data.forEach((record: any) => {
                        const dateKey = new Date(record.date).toISOString().split('T')[0]
                        map[dateKey] = record.status?.toLowerCase() || 'present'
                    })
                }

                setAttendanceData(map)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const days: AttendanceDay[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Add padding for first week
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push({ date: '', status: 'future' })
        }

        // Add actual days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d)
            const dateKey = date.toISOString().split('T')[0]
            const dayOfWeek = date.getDay()

            let status: AttendanceDay['status'] = 'absent'

            if (date > today) {
                status = 'future'
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                status = 'weekend'
            } else if (attendanceData[dateKey]) {
                status = attendanceData[dateKey] as AttendanceDay['status']
            }

            days.push({ date: dateKey, status })
        }

        return days
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-500'
            case 'late': return 'bg-amber-500'
            case 'leave': return 'bg-blue-500'
            case 'absent': return 'bg-rose-500/60'
            case 'weekend': return 'bg-white/5'
            case 'holiday': return 'bg-purple-500'
            case 'future': return 'bg-transparent'
            default: return 'bg-white/5'
        }
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const days = getDaysInMonth()

    // Calculate stats
    const stats = {
        present: Object.values(attendanceData).filter(s => s === 'present').length,
        late: Object.values(attendanceData).filter(s => s === 'late').length,
        absent: days.filter(d => d.status === 'absent').length,
        leave: Object.values(attendanceData).filter(s => s === 'leave').length
    }

    return (
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-400" />
                        Attendance Overview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 text-white hover:bg-white/10 hover:text-white">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-bold min-w-[120px] text-center text-white">
                            {MONTH_NAMES[month]} {year}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 text-white hover:bg-white/10 hover:text-white">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-green-500" />
                        <span className="text-slate-300">Present ({stats.present})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-amber-500" />
                        <span className="text-slate-300">Late ({stats.late})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-blue-500" />
                        <span className="text-slate-300">Leave ({stats.leave})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-rose-500/60" />
                        <span className="text-slate-300">Absent</span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {DAY_NAMES.map(day => (
                        <div key={day} className="text-center text-xs text-sky-200/70 font-medium py-2">
                            {day}
                        </div>
                    ))}

                    {/* Days */}
                    {loading ? (
                        [...Array(35)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded animate-pulse" />
                        ))
                    ) : (
                        days.map((day, i) => (
                            <div
                                key={i}
                                className={`aspect-square rounded flex items-center justify-center text-xs transition-all font-medium ${day.date ? getStatusColor(day.status) : ''
                                    } ${day.status === 'future' ? 'text-slate-600 bg-white/5' : 'text-white'}`}
                                title={day.date ? `${day.date}: ${day.status}` : ''}
                            >
                                {day.date ? new Date(day.date).getDate() : ''}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
