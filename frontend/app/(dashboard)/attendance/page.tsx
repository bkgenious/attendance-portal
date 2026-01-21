"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AttendanceCalendar } from "@/components/ui/attendance-calendar"
import { toast } from "sonner"
import { Clock, CalendarDays, CheckCircle2, XCircle } from "lucide-react"

export default function AttendancePage() {
    const [history, setHistory] = React.useState<any[]>([])
    const [status, setStatus] = React.useState<any>(null)
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        // Fetch Status (corrected endpoint)
        fetch("http://localhost:3001/api/attendance/me", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()).then(setStatus).catch(console.error)

        // Fetch History
        fetch("http://localhost:3001/api/attendance/history?limit=100", { // Get more for calendar
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()).then(setHistory).catch(console.error)
    }

    const handleAction = async (action: 'check-in' | 'check-out') => {
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(`http://localhost:3001/api/attendance/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.message || "Action failed")
            }
            toast.success(`Successfully ${action}ed`)
            fetchData()
        } catch (e: any) {
            toast.error(e.message || "Failed to update status")
        }
    }

    const isCheckedIn = !!status?.checkIn && !status?.checkOut
    const hasCheckedOut = !!status?.checkOut

    // Helper to check if a day has attendance
    const getModifiers = () => {
        const presentDays: Date[] = []
        history.forEach(record => {
            if (record.status === 'PRESENT') {
                presentDays.push(new Date(record.date))
            }
        })
        return { present: presentDays }
    }

    const modifiersStyles = {
        present: { color: 'lightgreen', fontWeight: 'bold' }
    }

    return (
        <div className="space-y-6 max-w-[1600px]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
                        Attendance Tracker
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your daily check-ins and view history</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* LEFT ZONE: Calendar & Actions */}
                <div className="w-full lg:w-[480px] flex-shrink-0 space-y-6">
                    {/* NEW Attendance Calendar Component */}
                    <AttendanceCalendar
                        year={date?.getFullYear() ?? new Date().getFullYear()}
                        month={date?.getMonth() ?? new Date().getMonth()}
                        selectedDate={date}
                        onSelectDate={setDate}
                        attendanceMap={
                            history.reduce((acc: Record<string, "present" | "absent" | "leave">, record: any) => {
                                const dateKey = new Date(record.date).toISOString().split("T")[0]
                                if (record.status === "PRESENT") acc[dateKey] = "present"
                                else if (record.status === "ABSENT") acc[dateKey] = "absent"
                                else if (record.status === "LEAVE") acc[dateKey] = "leave"
                                return acc
                            }, {})
                        }
                    />

                    {/* Quick Action Card - Matching Dark Tone */}
                    <Card className="border-0 shadow-lg bg-[#1e1e1e] border-t border-white/5">
                        <CardHeader className="pb-3 border-b border-white/5 py-3">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold text-white">
                                    {isCheckedIn ? "Checked In" : hasCheckedOut ? "Shift Done" : "Not Started"}
                                </span>
                                {isCheckedIn && <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleAction('check-in')}
                                    disabled={isCheckedIn || hasCheckedOut}
                                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    Check In
                                </Button>
                                <Button
                                    onClick={() => handleAction('check-out')}
                                    disabled={!isCheckedIn || hasCheckedOut}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Check Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT ZONE: History List */}
                <div className="flex-1 w-full min-w-0">
                    <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-xl border-t border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-violet-400" />
                                Attendance Log
                            </CardTitle>
                            <CardDescription>
                                Recent activity and punch times.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">In</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Out</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length === 0 && (
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                No attendance records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {history.map((record) => (
                                        <TableRow key={record.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-white">
                                                {new Date(record.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                                    ${record.status === 'PRESENT' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        record.status === 'ABSENT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                    {record.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
