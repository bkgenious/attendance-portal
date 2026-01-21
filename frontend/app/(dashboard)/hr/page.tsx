"use client"

import * as React from "react"
import { HRWidgets } from "@/components/dashboard/hr-widgets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HRPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>

            <HRWidgets />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Manage Employees, Approvals, and Reports here.</p>
                        {/* Add links or buttons here later */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
