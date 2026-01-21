"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

import { Loader2 } from "lucide-react"

interface ActivityLog {
    id: string
    action: string
    ipAddress: string
    userAgent: string
    createdAt: string
}

interface UserActivityModalProps {
    isOpen: boolean
    onClose: () => void
    user: { id: string; name: string } | null
    activity: ActivityLog[]
    loading: boolean
}

export function UserActivityModal({ isOpen, onClose, user, activity, loading }: UserActivityModalProps) {
    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Activity History: {user.name}</DialogTitle>
                    <DialogDescription>Recent login and system activity.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-[300px] border rounded-md">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : activity.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No recent activity found.
                        </div>
                    ) : (
                        <div className="h-[400px] overflow-y-auto pr-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead className="text-right">Browser/Device</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activity.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                <span className={`px-2 py-1 rounded-full text-xs ${log.action === 'LOGIN' ? 'bg-green-500/10 text-green-500' :
                                                    log.action === 'LOGOUT' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {log.ipAddress || '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground max-w-[200px] truncate" title={log.userAgent}>
                                                {log.userAgent || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
