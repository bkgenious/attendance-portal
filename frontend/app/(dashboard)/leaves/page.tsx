"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CalendarCheck, Send, Loader2 } from "lucide-react"

const requestLeaveSchema = z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(5, "Reason is required"),
})

type RequestLeaveValues = z.infer<typeof requestLeaveSchema>

export default function LeavesPage() {
    const [leaves, setLeaves] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RequestLeaveValues>({
        resolver: zodResolver(requestLeaveSchema),
    })

    React.useEffect(() => {
        fetchLeaves()
    }, [])

    const fetchLeaves = () => {
        const token = localStorage.getItem("token")
        if (!token) return

        fetch("http://localhost:3001/api/leaves/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setLeaves(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    const onSubmit = async (data: RequestLeaveValues) => {
        const token = localStorage.getItem("token")
        try {
            const res = await fetch("http://localhost:3001/api/leaves", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || "Failed to request leave")
            }

            toast.success("Leave requested successfully")
            reset()
            fetchLeaves()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20';
            default: return 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20';
        }
    }

    return (
        <div className="space-y-6 max-w-[1600px]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                        Leave Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Request time off and track your approval status</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* LEFT ZONE: Request Form */}
                <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 backdrop-blur-xl border-t border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-4 w-4 text-violet-400" />
                                New Request
                            </CardTitle>
                            <CardDescription>
                                Submit a new leave request for HR approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register("startDate")}
                                        className="bg-black/20 border-white/10 focus:border-violet-500/50"
                                    />
                                    {errors.startDate && <p className="text-xs text-red-400">{errors.startDate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        {...register("endDate")}
                                        className="bg-black/20 border-white/10 focus:border-violet-500/50"
                                    />
                                    {errors.endDate && <p className="text-xs text-red-400">{errors.endDate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="e.g. Family vacation, Sick leave..."
                                        {...register("reason")}
                                        className="bg-black/20 border-white/10 focus:border-violet-500/50 min-h-[100px]"
                                    />
                                    {errors.reason && <p className="text-xs text-red-400">{errors.reason.message}</p>}
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT ZONE: History Table */}
                <div className="flex-1 w-full min-w-0">
                    <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-xl border-t border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4 text-violet-400" />
                                Request History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duration</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Reason</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
                                                Loading records...
                                            </TableCell>
                                        </TableRow>
                                    ) : leaves.length === 0 ? (
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="p-3 rounded-full bg-white/5">
                                                        <CalendarCheck className="h-6 w-6 opacity-30" />
                                                    </div>
                                                    <p>No leave requests found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaves.map((leave) => (
                                            <TableRow key={leave.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="text-white">
                                                            {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            {' '}&rarr;{' '}
                                                            {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(leave.startDate).getFullYear()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <p className="truncate text-sm text-gray-300 group-hover:text-white transition-colors">
                                                        {leave.reason}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className={getStatusColor(leave.status)}>
                                                        {leave.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
