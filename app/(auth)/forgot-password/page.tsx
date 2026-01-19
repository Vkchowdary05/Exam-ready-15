'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                setIsSuccess(true)
            } else {
                setError(result.error || result.message || 'Failed to send reset email')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-border/50 shadow-xl">
                        <CardContent className="pt-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Check Your Email</h2>
                            <p className="text-muted-foreground mb-6">
                                If an account exists with that email, we've sent password reset instructions.
                            </p>
                            <Link href="/login">
                                <Button className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                        <CardDescription>
                            Enter your email and we'll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
