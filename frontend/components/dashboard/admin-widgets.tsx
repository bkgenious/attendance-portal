"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

function ExportPanel() {
    const currentDate = new Date()
    const [month, setMonth] = React.useState(currentDate.getMonth() + 1)
    const [year, setYear] = React.useState(currentDate.getFullYear())

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

    const handleExport = () => {
        const token = localStorage.getItem("token")
        window.open(
            `http://localhost:3001/api/attendance/export?month=${month}&year=${year}`,
            '_blank'
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Select a month to download attendance reports.
            </p>
            <div className="flex gap-2">
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="flex-1 h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {MONTHS.map((name, idx) => (
                        <option key={idx} value={idx + 1} className="bg-slate-900 text-white">
                            {name}
                        </option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-24 h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {years.map((y) => (
                        <option key={y} value={y} className="bg-slate-900 text-white">
                            {y}
                        </option>
                    ))}
                </select>
            </div>
            <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                onClick={handleExport}
            >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
        </div>
    )
}


export function AdminWidgets() {
    const [logs, setLogs] = React.useState<any[]>([])

    React.useEffect(() => {
        const fetchLogs = () => {
            const token = localStorage.getItem("token")
            fetch("http://localhost:3001/api/audit?limit=5", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.data) setLogs(data.data)
                })
                .catch(err => console.error(err))
        }

        fetchLogs()
        const interval = setInterval(fetchLogs, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            {/* NEW: Admin Export & Health Stats Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Export Widget with Month Selector */}
                <Card className="border-0 bg-white/5 backdrop-blur-xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-blue-400" />
                            Reports Center
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ExportPanel />
                    </CardContent>
                </Card>

                {/* 2. Company Health Stats (Mock Implementation for Upgrade) */}
                <Card className="border-0 bg-white/5 backdrop-blur-xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-medium text-white">Company Pulse</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                                <div className="text-2xl font-bold text-green-400">98%</div>
                                <div className="text-xs text-green-200/60 uppercase tracking-widest mt-1">On Time</div>
                            </div>
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                                <div className="text-2xl font-bold text-amber-400">12</div>
                                <div className="text-xs text-amber-200/60 uppercase tracking-widest mt-1">On Leave</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Log Stream */}
            <Card className="border-0 bg-white/5 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4 bg-white/5">
                    <div>
                        <CardTitle className="text-lg font-medium text-white">Audit Log Stream</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Real-time system security events</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
                        View All
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <ShieldAlert className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No recent privileged actions recorded.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <div className={`h-2 w-2 rounded-full ${log.action.includes('DELETE') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                                                    {log.action} <span className="text-muted-foreground">on</span> {log.resource}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {log.user?.email || 'System'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground/60 font-mono">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
