"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiClient } from "@/lib/api"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface Request {
    id: string
    user: {
        email: string
        employeeProfile?: {
            firstName: string
            lastName: string
            department?: string
        }
    }
}

import { useQuery, useQueryClient } from "@tanstack/react-query"

export function PendingApprovals() {
    const queryClient = useQueryClient()

    const { data, isLoading: loading, isError: error } = useQuery({
        queryKey: ["admin", "pending-approvals"],
        queryFn: async () => {
            return await ApiClient.get<{ count: number, requests: Request[] }>("/admin/pending-approvals?limit=5")
        }
    })

    const requests = data?.requests || []

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        // Snapshot previous value
        const previousData = queryClient.getQueryData<{ count: number, requests: Request[] }>(["admin", "pending-approvals"])

        // Optimistic update
        queryClient.setQueryData(["admin", "pending-approvals"], (old: any) => ({
            ...old,
            requests: old.requests.filter((r: Request) => r.id !== id)
        }))

        try {
            await ApiClient.post(`/leaves/${id}/${action}`, {})
            toast.success(`Request ${action}ed`)
            // Invalidate to get fresh state (e.g. counts)
            queryClient.invalidateQueries({ queryKey: ["admin", "pending-approvals"] })
        } catch (err) {
            toast.error("Action failed")
            // Rollback
            queryClient.setQueryData(["admin", "pending-approvals"], previousData)
        }
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load pending requests.</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="col-span-1 shadow-lg bg-card text-card-foreground">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Pending Approvals
                </CardTitle>
                <CardDescription>Quick actions for leave requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                            <div>
                                <p className="font-medium text-sm">
                                    {req.user.employeeProfile?.firstName} {req.user.employeeProfile?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {req.user.employeeProfile?.department || 'Unassigned'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                    onClick={() => handleAction(req.id, 'approve')}
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={() => handleAction(req.id, 'reject')}
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                {!loading && requests.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        No pending requests.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
