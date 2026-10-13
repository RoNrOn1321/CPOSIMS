import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { login, register } from '@/routes';
import { request as requestPassword } from '@/routes/password';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(login().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

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
                                Welcome to CPOSIMS
                            </h1>
                            <p className="text-sm text-zinc-300">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={register().url}
                                    className="font-semibold text-amber-400 underline underline-offset-4 hover:text-amber-300"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {status && (
                            <div className="rounded-md border border-emerald-400/30 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-200">
                                {status}
                            </div>
                        )}

                        <Field>
                            <FieldLabel htmlFor="email" className="text-sm font-medium text-zinc-200">
                                Username or Email
                            </FieldLabel>
                            <Input
                                id="email"
                                type="text"
                                name="email"
                                value={data.email}
                                placeholder="Enter username or email"
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
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="password" className="text-sm font-medium text-zinc-200">
                                    Password
                                </FieldLabel>
                                {canResetPassword && (
                                    <Link
                                        href={requestPassword().url}
                                        className="text-xs text-zinc-300 underline underline-offset-4 hover:text-white"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                aria-invalid={!!errors.password}
                                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-zinc-400 focus-visible:border-blue-400 focus-visible:ring-blue-400/30"
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

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                className="border-white/30 data-checked:bg-blue-500 data-checked:border-blue-500 data-checked:text-white-950"
                                onCheckedChange={(checked) =>
                                    setData('remember', checked === true)
                                }
                            />
                            <label
                                htmlFor="remember"
                                className="cursor-pointer text-sm font-medium leading-none text-zinc-200 select-none hover:text-white"
                            >
                                Remember me
                            </label>
                        </div>

                        <Field>
                            <Button
                                type="submit"
                                className="h-10 w-full bg-[#7a1420] font-semibold text-white shadow-lg transition-all hover:bg-[#921927] hover:shadow-red-950/40 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Logging in...' : 'Login'}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>

                <p className="px-6 text-center text-xs text-zinc-400">
                    Saint Theresa College of Tandag, Inc. &bull; CPOSIMS
                </p>
            </div>
        </GuestLayout>
    );
}
