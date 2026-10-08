import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
} from '@/Components/ui/field';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="flex flex-col gap-6">
                <form onSubmit={submit}>
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <Link
                                href="/"
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <ApplicationLogo className="h-24 w-auto" />
                                <span className="sr-only">
                                    Saint Theresa College of Tandag, Inc.
                                </span>
                            </Link>
                            <h1 className="text-xl font-bold tracking-tight">
                                Verify Email
                            </h1>
                            <FieldDescription>
                                Thanks for signing up! Before getting started,
                                please verify your email address by clicking on
                                the link we sent you.
                            </FieldDescription>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}

                        <Field>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Resending...'
                                    : 'Resend Verification Email'}
                            </Button>
                        </Field>

                        <div className="text-center text-sm">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                            >
                                Log Out
                            </Link>
                        </div>
                    </FieldGroup>
                </form>

                <FieldDescription className="px-6 text-center text-xs">
                    Saint Theresa College of Tandag, Inc. &bull; CPOSIMS
                </FieldDescription>
            </div>
        </GuestLayout>
    );
}
