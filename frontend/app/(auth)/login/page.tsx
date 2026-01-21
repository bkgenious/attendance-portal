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

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)

            // Use ApiClient to respect global config and handle errors uniformly
            const result = await ApiClient.post<{ token: string }>("/auth/login", data, {
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            // Store token
            localStorage.setItem("token", result.token)
            toast.success("Login successful")

            router.push("/dashboard")
        } catch (error: any) {
            console.error("Login error:", error)
            if (error.name === 'AbortError') {
                toast.error("Connection timed out. Is the backend running?")
            } else {
                toast.error(error.message || "Invalid credentials or Server Error")
            }
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
                            Welcome Back
                        </span>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to sign in
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" placeholder="name@example.com" {...register("email")} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" {...register("password")} />
                                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                        <Button variant="link" className="text-xs text-muted-foreground" asChild>
                            <Link href="/forgot-password">Forgot Password?</Link>
                        </Button>

                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    )
}
