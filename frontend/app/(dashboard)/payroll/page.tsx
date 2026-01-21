"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PayrollPage() {
    const [payslip, setPayslip] = React.useState<any>(null)
    const [month, setMonth] = React.useState(new Date().getMonth() + 1)
    const [year, setYear] = React.useState(new Date().getFullYear())

    const fetchPayslip = () => {
        const token = localStorage.getItem("token")
        if (!token) return

        fetch(`http://localhost:3001/api/payroll?month=${month}&year=${year}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) return null
                    throw new Error("Failed")
                }
                return res.json()
            })
            .then(setPayslip)
            .catch(() => setPayslip(null))
    }

    React.useEffect(() => {
        fetchPayslip()
    }, [month, year])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
                <div className="flex gap-2">
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[2024, 2025, 2026].map(y => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={fetchPayslip}>Refresh</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslip Report</CardTitle>
                </CardHeader>
                <CardContent>
                    {!payslip ? (
                        <div className="text-center text-muted-foreground py-8">
                            No payslip found for {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Month/Year</p>
                                    <p className="font-semibold">{new Date(0, payslip.month - 1).toLocaleString('default', { month: 'long' })} {payslip.year}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Generated At</p>
                                    <p className="font-semibold">{new Date(payslip.generatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Days</p>
                                    <p>{payslip.totalDays}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Present Days</p>
                                    <p>{payslip.presentDays}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Leave Days</p>
                                    <p>{payslip.leaveDays}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Absent Days</p>
                                    <p>{payslip.absentDays}</p>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Net Pay</span>
                                    <span>${payslip.netPay.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
