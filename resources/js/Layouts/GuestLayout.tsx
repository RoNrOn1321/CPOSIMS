import { PropsWithChildren } from 'react';
import bgImage from '../../images/auth-bg.jpg';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Background Campus Photo */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            {/* Dark overlay for contrast & readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

            {/* Floating Frosted Glass Card with crisp light typography */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950/75 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-white">
                {children}
            </div>
        </div>
    );
}

