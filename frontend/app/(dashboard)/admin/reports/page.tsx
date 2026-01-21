"use client"

import { FileText, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"


export default function ReportsPage() {

    const handleDownloadCSV = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch('http://localhost:3001/api/attendance/export', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                // Trigger download
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                toast.success("Report Downloaded", { description: "CSV file has been saved." })
            } else {
                toast.error("Export Failed", { description: "Could not generate report." })
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handlePrintPDF = () => {
        toast.info("Preparing PDF...", { description: "Please use the browser print dialog to save as PDF." })
        setTimeout(() => {
            window.print()
        }, 1000)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 print:p-0 print:m-0">
            <div className="print:hidden">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Reports Center</h1>
                <p className="text-muted-foreground">Generate and download attendance reports for payroll and compliance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 print:block print:w-full">
                <Card className="bg-white/5 border-white/10 print:border-0 print:shadow-none">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-400" />
                            Monthly Export
                        </CardTitle>
                        <CardDescription>
                            Detailed attendance logs for all employees for the current month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded bg-muted/50 text-sm text-muted-foreground">
                            Includes Check-in, Check-out, Duration, and Status.
                        </div>
                        <Button onClick={handleDownloadCSV} className="w-full bg-blue-600 hover:bg-blue-700 print:hidden">
                            <Download className="mr-2 h-4 w-4" />
                            Download CSV
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 print:border-0">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Printer className="h-5 w-5 text-purple-400" />
                            Printable Report
                        </CardTitle>
                        <CardDescription>
                            Generate a print-friendly version of the summary stats.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded bg-muted/50 text-sm text-muted-foreground">
                            Best for physical filing or PDF generation via Print to PDF.
                        </div>
                        <Button onClick={handlePrintPDF} className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 print:hidden">
                            <Printer className="mr-2 h-4 w-4" />
                            Print / Save as PDF
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Printable Content Block (Hidden normally, shown on print) */}
            <div className="hidden print:block text-black p-8 bg-white fixed inset-0 z-[9999]">
                <h1 className="text-2xl font-bold mb-4">Official Attendance Report</h1>
                <p className="mb-4">Generated on: {new Date().toLocaleString()}</p>
                <div className="border p-4 mb-4">
                    <p><strong>Period:</strong> Current Month</p>
                    <p><strong>Department:</strong> All</p>
                </div>
                {/* We would fetch and render actual table here or reuse components */}
                <p className="text-center text-gray-500 italic mt-10">End of Report</p>
            </div>
        </div>
    )
}
