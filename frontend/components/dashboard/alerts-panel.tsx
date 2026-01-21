"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info, CheckCircle, Bell } from "lucide-react"
import { ApiClient } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface SystemAlert {
    type: 'warning' | 'info' | 'success' | 'error'
    title: string
    message: string
    count?: number
}

export function AlertsPanel() {
    const [alerts, setAlerts] = useState<SystemAlert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await ApiClient.get<SystemAlert[]>("/admin/alerts")
                setAlerts(data)
            } catch (err) {
                console.error("Failed to fetch alerts", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAlerts()
        const interval = setInterval(fetchAlerts, 5000) // Real-time (5s)
        return () => clearInterval(interval)
    }, [])

    if (!loading && alerts.length === 0) {
        return (
            <Card className="col-span-full border-dashed bg-card/50">
                <CardContent className="flex items-center justify-center p-6 text-muted-foreground gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">System Healthy. No active alerts.</span>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full shadow-lg bg-card border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    System Alerts
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    alerts.map((alert, index) => (
                        <Alert key={index} variant={alert.type === 'warning' || alert.type === 'error' ? 'destructive' : 'default'} className="bg-background/50">
                            {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                            {alert.type === 'info' && <Info className="h-4 w-4" />}
                            <AlertTitle className="font-semibold flex items-center gap-2">
                                {alert.title}
                                {alert.count && (
                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-foreground/10">
                                        Count: {alert.count}
                                    </span>
                                )}
                            </AlertTitle>
                            <AlertDescription>
                                {alert.message}
                            </AlertDescription>
                        </Alert>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
