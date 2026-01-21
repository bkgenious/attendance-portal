"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiClient } from "@/lib/api"

export function HRWidgets() {
    const [stats, setStats] = React.useState<any>({ pendingLeaves: 0 })

    React.useEffect(() => {
        // Fetch pending leaves count
        ApiClient.get<any[]>("/leaves/pending")
            .then(data => {
                if (Array.isArray(data)) {
                    setStats({ pendingLeaves: data.length })
                }
            })
            .catch(err => console.error(err))
    }, [])

    return (
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-medium text-white">Pending Requests</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Leave applications requiring approval</p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                    <FileText className="h-5 w-5 text-amber-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-bold text-white mb-2">
                            {stats.pendingLeaves}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded w-fit">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Action Required
                        </div>
                    </div>

                    <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto font-medium">
                        View All Requests &rarr;
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
