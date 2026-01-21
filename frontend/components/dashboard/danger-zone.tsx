"use client"

import * as React from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ApiClient } from "@/lib/api"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export function DangerZone() {
    const [confirmText, setConfirmText] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const queryClient = useQueryClient()

    const handleReset = async () => {
        if (confirmText !== "DELETE") return

        setIsLoading(true)
        try {
            await ApiClient.delete("/admin/data/reset")
            toast.success("System data wiped successfully.")

            // Invalidate ALL queries to refresh the entire dashboard immediately
            queryClient.invalidateQueries()

            setConfirmText("")
        } catch (error: any) {
            toast.error(error.message || "Failed to reset system")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-red-600/50 bg-red-950/10 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-400/80">
                    Irreversible actions. Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-900/30 rounded-lg bg-red-950/20">
                    <div>
                        <h4 className="font-semibold text-red-200">Reset System Data</h4>
                        <p className="text-sm text-red-300/60 max-w-md mt-1">
                            This will verifyfully delete ALL attendance records, leave requests, and breaks. User accounts will remain.
                            This action cannot be undone.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Erase All Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-red-900 bg-zinc-950">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-500">Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will wipe the entire database of attendance history.
                                    Type <strong>DELETE</strong> below to confirm.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <Label htmlFor="confirm" className="sr-only">Confirmation</Label>
                                <Input
                                    id="confirm"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="border-red-900 focus-visible:ring-red-500"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    disabled={confirmText !== "DELETE" || isLoading}
                                    onClick={handleReset}
                                >
                                    {isLoading ? "Erasing..." : "Permanently Delete Data"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}
