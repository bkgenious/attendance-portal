"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Shield, Laptop, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Session {
    id: string
    userId: string
    ipAddress?: string
    userAgent?: string
    lastActive: string // serialized date
    user: {
        email: string
        role: string
        employeeProfile?: {
            firstName: string
            lastName: string
        }
    }
}

export default function SessionManagementPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch('http://localhost:3001/api/sessions', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setSessions(data)
            } else {
                toast.error("Access Denied", { description: "You cannot view sessions." })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this session? The user will be logged out.")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`http://localhost:3001/api/sessions/${id}/revoke`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success("Session Revoked")
                setSessions(prev => prev.filter(s => s.id !== id))
            } else {
                toast.error("Error", { description: "Failed to revoke session" })
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Active Sessions</h1>
                <p className="text-slate-400">Monitor and manage active user sessions across the platform.</p>
            </div>

            <Card className="border-0 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Laptop className="h-5 w-5 text-blue-400" />
                        Online Users
                    </CardTitle>
                    <CardDescription>
                        Real-time view of currently logged-in users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-white">Loading sessions...</div>
                    ) : (
                        <div className="rounded-md border border-white/10">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-slate-400">User</TableHead>
                                        <TableHead className="text-slate-400">Role</TableHead>
                                        <TableHead className="text-slate-400">IP Address</TableHead>
                                        <TableHead className="text-slate-400">Device</TableHead>
                                        <TableHead className="text-slate-400">Last Active</TableHead>
                                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                                                No active sessions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sessions.map((session) => (
                                            <TableRow key={session.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell className="font-medium text-white">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {session.user.employeeProfile
                                                                ? `${session.user.employeeProfile.firstName} ${session.user.employeeProfile.lastName}`
                                                                : 'Unknown User'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{session.user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 bg-blue-500/10">
                                                        {session.user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-300 font-mono text-xs">
                                                    {session.ipAddress || 'Unknown'}
                                                </TableCell>
                                                <TableCell className="text-slate-300 max-w-[200px] truncate" title={session.userAgent || ''}>
                                                    {session.userAgent ? (session.userAgent.includes('Windows') ? 'Windows PC' : session.userAgent.includes('Mac') ? 'Mac' : 'Device') : 'Unknown'}
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    {format(new Date(session.lastActive), 'MMM d, HH:mm')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevoke(session.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    >
                                                        Revoke
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
