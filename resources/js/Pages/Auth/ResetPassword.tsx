import { store } from '@/routes/password';
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

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(store().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

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
                                Reset Password
                            </h1>
                            <p className="text-sm text-zinc-300">
                                Enter your new password below.
                            </p>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="email" className="text-sm font-medium text-zinc-200">
                                Email
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                required
                                aria-invalid={!!errors.email}
                                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-zinc-400 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <FieldError className="text-xs text-red-400" errors={[{ message: errors.email }]} />
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password" className="text-sm font-medium text-zinc-200">
                                Password
                            </FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                autoComplete="new-password"
                                autoFocus
                                required
                                aria-invalid={!!errors.password}
                                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-zinc-400 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            {errors.password && (
                                <FieldError
                                    className="text-xs text-red-400"
                                    errors={[{ message: errors.password }]}
                                />
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password_confirmation" className="text-sm font-medium text-zinc-200">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                autoComplete="new-password"
                                required
                                aria-invalid={!!errors.password_confirmation}
                                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-zinc-400 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                            {errors.password_confirmation && (
                                <FieldError
                                    className="text-xs text-red-400"
                                    errors={[
                                        {
                                            message:
                                                errors.password_confirmation,
                                        },
                                    ]}
                                />
                            )}
                        </Field>

                        <Field>
                            <Button
                                type="submit"
                                className="h-10 w-full bg-[#7a1420] font-semibold text-white shadow-lg transition-all hover:bg-[#921927] hover:shadow-red-950/40 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Resetting...' : 'Reset Password'}
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
