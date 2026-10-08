import { confirm as confirmPassword } from '@/routes/password';
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

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(confirmPassword().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

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
                                Confirm Password
                            </h1>
                            <FieldDescription>
                                This is a secure area of the application. Please confirm
                                your password before continuing.
                            </FieldDescription>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                autoComplete="current-password"
                                autoFocus
                                required
                                aria-invalid={!!errors.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && (
                                <FieldError errors={[{ message: errors.password }]} />
                            )}
                        </Field>

                        <Field>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Confirming...' : 'Confirm'}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>

                <FieldDescription className="px-6 text-center text-xs">
                    Saint Theresa College of Tandag, Inc. &bull; CPOSIMS
                </FieldDescription>
            </div>
        </GuestLayout>
    );
}
