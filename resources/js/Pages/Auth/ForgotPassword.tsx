import { email } from '@/routes/password';
import { login } from '@/routes';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(email().url);
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="flex flex-col gap-6">
                <form onSubmit={submit}>
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <Link
                                href="/"
                                className="flex flex-col items-center gap-2 font-medium transition-transform hover:scale-105"
                            >
                                <ApplicationLogo className="h-24 w-auto drop-shadow-md" />
                                <span className="sr-only">
                                    Saint Theresa College of Tandag, Inc.
                                </span>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                                Forgot password?
                            </h1>
                            <p className="text-sm text-zinc-300">
                                No worries, we will email you a password reset link.
                            </p>
                        </div>

                        {status && (
                            <div className="rounded-md border border-emerald-400/30 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-200">
                                {status}
                            </div>
                        )}

                        <Field>
                            <FieldLabel htmlFor="email" className="text-sm font-medium text-zinc-200">
                                Email
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="name@example.com"
                                autoComplete="username"
                                autoFocus
                                required
                                aria-invalid={!!errors.email}
                                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-zinc-400 focus-visible:border-blue-400 focus-visible:ring-blue-400/30"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <FieldError className="text-xs text-red-400" errors={[{ message: errors.email }]} />
                            )}
                        </Field>

                        <Field>
                            <Button
                                type="submit"
                                className="h-10 w-full bg-[#7a1420] font-semibold text-white shadow-lg transition-all hover:bg-[#921927] hover:shadow-red-950/40 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Sending reset link...'
                                    : 'Email Password Reset Link'}
                            </Button>
                        </Field>

                        <div className="text-center text-sm">
                            <Link
                                href={login().url}
                                className="font-semibold text-amber-400 underline underline-offset-4 hover:text-amber-300"
                            >
                                Back to login
                            </Link>
                        </div>
                    </FieldGroup>
                </form>

                <p className="px-6 text-center text-xs text-zinc-400">
                    Saint Theresa College of Tandag, Inc. &bull; CPOSIMS
                </p>
            </div>
        </GuestLayout>
    );
}
