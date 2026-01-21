"use client"

import * as React from "react"
import { AdminWidgets } from "@/components/dashboard/admin-widgets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <Link href="/users">
                    <Button>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                    </Button>
                </Link>
            </div>

            <AdminWidgets />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span>Status</span>
                                <span className="text-green-600 font-bold">Operational</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Version</span>
                                <span>1.0.0</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
