"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiClient } from "@/lib/api"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface PasswordRequest {
    id: string
    user: {
        email: string
        role: string
        employeeProfile?: {
            firstName: string
            lastName: string
            department?: string
        }
    }
    createdAt: string
}

export function PasswordApprovals() {
    const queryClient = useQueryClient()

    const { data: requests = [], isLoading: loading, isError: error } = useQuery({
        queryKey: ["admin", "password-requests"],
        queryFn: async () => {
            return await ApiClient.get<PasswordRequest[]>("/admin/password-requests/pending")
        }
    })

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        // Snapshot
        const previousData = queryClient.getQueryData<PasswordRequest[]>(["admin", "password-requests"])

        // Optimistic Update
        queryClient.setQueryData(["admin", "password-requests"], (old: PasswordRequest[] = []) =>
            old.filter(r => r.id !== id)
        )

        try {
            await ApiClient.post(`/admin/password-requests/${id}/${action}`, {})
            toast.success(`Request ${action}d`)
            queryClient.invalidateQueries({ queryKey: ["admin", "password-requests"] })
        } catch (err: any) {
            toast.error(err.message || "Action failed")
            // Rollback
            queryClient.setQueryData(["admin", "password-requests"], previousData)
        }
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load security requests.</AlertDescription>
            </Alert>
        )
    }

    if (!loading && requests.length === 0) return null

    return (
        <Card className="col-span-1 shadow-lg bg-red-950/20 border-red-900/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                    Security Alerts
                </CardTitle>
                <CardDescription>Pending password reset requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    Array(2).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <Skeleton className="h-10 w-40" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-red-900/30 bg-red-950/30">
                            <div>
                                <p className="font-medium text-sm text-red-200">
                                    {req.user.employeeProfile?.firstName} {req.user.employeeProfile?.lastName}
                                </p>
                                <p className="text-xs text-red-300/60">
                                    {req.user.email} • {req.user.role}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/20"
                                    onClick={() => handleAction(req.id, 'approve')}
                                    title="Approve Reset"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/20"
                                    onClick={() => handleAction(req.id, 'reject')}
                                    title="Reject Request"
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
