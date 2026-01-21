"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiClient } from "@/lib/api"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface DeptStat {
    department: string
    total: number
    present: number
    attendanceRate: number
}

import { useQuery } from "@tanstack/react-query"

export function DepartmentStats() {
    const { data: stats = [], isLoading: loading, isError: error } = useQuery({
        queryKey: ["admin", "department-stats"],
        queryFn: async () => {
            return await ApiClient.get<DeptStat[]>("/admin/departments")
        },
        refetchInterval: 5000 // Real-time (5s)
    })

    if (error) {
        return (
            <Alert variant="destructive">
                <Building2 className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load department data.</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="col-span-1 shadow-lg bg-card text-card-foreground">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Department Performance
                </CardTitle>
                <CardDescription>Real-time attendance by department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </div>
                    ))
                ) : (
                    stats.map((dept) => (
                        <div key={dept.department} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="font-medium">{dept.department}</div>
                                <div className="text-muted-foreground">
                                    {dept.attendanceRate}% ({dept.present}/{dept.total})
                                </div>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${dept.attendanceRate >= 90 ? 'bg-green-500' :
                                        dept.attendanceRate >= 75 ? 'bg-blue-500' :
                                            dept.attendanceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${dept.attendanceRate}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
                {!loading && stats.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        No department data available.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
