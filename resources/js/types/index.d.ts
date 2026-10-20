export interface User {
    id: number;
    username: string;
    full_name: string;
    name?: string;
    email?: string;
    phone?: string;
    role: 'admin' | 'cashier' | 'parent' | 'faculty' | 'student';
    status: 'active' | 'inactive';
    roles?: string[];
    permissions?: string[];
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
        status?: string | null;
        reference_number?: string | null;
        topup?: unknown;
    };
};
