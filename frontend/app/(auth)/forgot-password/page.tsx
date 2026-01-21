"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ApiClient } from "@/lib/api"

const resetSchema = z.object({
    email: z.string().email(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetFormValues = z.infer<typeof resetSchema>

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
    })

    async function onSubmit(data: ResetFormValues) {
        setIsLoading(true)

        try {
            await ApiClient.post("/auth/forgot-password", {
                email: data.email,
                newPassword: data.newPassword
            })

            toast.success("Request submitted! An admin will review your request.")
            router.push("/login")
        } catch (error: any) {
            console.error("Reset error:", error)
            toast.error(error.message || "Failed to submit request")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-[380px] border-0 shadow-2xl bg-white/5 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
                            Reset Password
                        </span>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and new password. An admin must approve this change.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" placeholder="name@example.com" {...register("email")} />
                                <p className="text-[0.8rem] text-muted-foreground h-4">
                                    {errors.email?.message}
                                </p>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" type="password" {...register("newPassword")} />
                                <p className="text-[0.8rem] text-muted-foreground h-4">
                                    {errors.newPassword?.message}
                                </p>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                                <p className="text-[0.8rem] text-muted-foreground h-4">
                                    {errors.confirmPassword?.message}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Request Reset"}
                        </Button>
                        <Button variant="link" className="text-xs text-muted-foreground" asChild>
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    )
}
