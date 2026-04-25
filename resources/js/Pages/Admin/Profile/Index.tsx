import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button, Input } from '@/Components/ui';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { confirmAction, showToast } from '@/lib/alert';

type ProfilePageProps = {
    profile: {
        name: string;
        roles: string[];
        username: string;
    };
};

function formatRole(role?: string) {
    return role?.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) ?? '-';
}

export default function AdminProfileIndex({ profile }: ProfilePageProps) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const profileForm = useForm({
        name: profile.name,
    });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = await confirmAction({
            title: 'Simpan perubahan profil?',
            text: 'Nama admin akan diperbarui.',
            confirmButtonText: 'Ya, simpan',
        });

        if (!result.isConfirmed) {
            return;
        }

        profileForm.put('/admin/profil-akun', {
            onSuccess: () => {
                setIsEditingProfile(false);
                showToast({ title: 'Informasi akun berhasil diperbarui.' });
            },
        });
    };

    const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = await confirmAction({
            title: 'Simpan kata sandi baru?',
            text: 'Kata sandi akun akan diperbarui.',
            confirmButtonText: 'Ya, simpan',
        });

        if (!result.isConfirmed) {
            return;
        }

        passwordForm.put('/admin/profil-akun/password', {
            onSuccess: () => {
                setIsEditingPassword(false);
                passwordForm.reset();
                showToast({ title: 'Kata sandi berhasil diperbarui.' });
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Profil Akun" />

            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-bold text-zinc-800">Profil Akun</h1>
                </div>

                <div className="flex flex-col items-start gap-4 xl:flex-row">
                    <section className="w-full rounded-lg border border-zinc-200 bg-white p-5 xl:w-[calc(50%-0.5rem)]">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-zinc-800">Informasi Akun</h2>
                            <Button
                                className="text-zinc-700"
                                onClick={() => {
                                    setIsEditingProfile((value) => {
                                        const next = !value;

                                        if (!next) {
                                            profileForm.setData('name', profile.name);
                                            profileForm.clearErrors();
                                        }

                                        return next;
                                    });
                                }}
                                size="sm"
                                variant="outline"
                            >
                                {isEditingProfile ? 'Batal' : 'Edit'}
                            </Button>
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={submitProfile}>
                            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                    Level Akses
                                </div>
                                <p className="mt-2 text-sm font-semibold text-zinc-800">{formatRole(profile.roles[0])}</p>
                            </div>

                            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                    Username
                                </div>
                                <p className="mt-2 text-sm font-semibold text-zinc-800">{profile.username}</p>
                            </div>

                            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                    Nama Admin
                                </div>
                                {isEditingProfile ? (
                                    <Input
                                        className="mt-2"
                                        error={profileForm.errors.name}
                                        name="name"
                                        onChange={(event) => profileForm.setData('name', event.target.value)}
                                        value={profileForm.data.name}
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-zinc-800">{profile.name}</p>
                                )}
                            </div>

                            {isEditingProfile ? (
                                <div className="pt-2">
                                    <Button
                                        className="bg-slate-800 text-white hover:bg-slate-700"
                                        isLoading={profileForm.processing}
                                        size="md"
                                        type="submit"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            ) : null}
                        </form>
                    </section>

                    <section className="w-full rounded-lg border border-zinc-200 bg-white p-5 xl:w-[calc(50%-0.5rem)]">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-zinc-800">Update Kata Sandi</h2>
                            <Button
                                className="text-zinc-700"
                                onClick={() => {
                                    setIsEditingPassword((value) => {
                                        const next = !value;

                                        if (!next) {
                                            passwordForm.reset();
                                            passwordForm.clearErrors();
                                            setShowNewPassword(false);
                                            setShowPasswordConfirmation(false);
                                        }

                                        return next;
                                    });
                                }}
                                size="sm"
                                variant="outline"
                            >
                                {isEditingPassword ? 'Batal' : 'Edit'}
                            </Button>
                        </div>

                        <form className="mt-5 grid grid-cols-1 gap-4" onSubmit={submitPassword}>
                            <Input
                                disabled={!isEditingPassword}
                                error={passwordForm.errors.current_password}
                                label="Sandi Sekarang"
                                name="current_password"
                                onChange={(event) => passwordForm.setData('current_password', event.target.value)}
                                type="password"
                                value={passwordForm.data.current_password}
                            />

                            <div className="relative">
                                <Input
                                    className="pr-10"
                                    disabled={!isEditingPassword}
                                    error={passwordForm.errors.password}
                                    label="Sandi Baru"
                                    name="password"
                                    onChange={(event) => passwordForm.setData('password', event.target.value)}
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordForm.data.password}
                                />
                                <button
                                    aria-label={showNewPassword ? 'Sembunyikan sandi baru' : 'Tampilkan sandi baru'}
                                    className="absolute top-7.5 right-3 flex h-5 w-5 cursor-pointer items-center justify-center text-zinc-400 transition hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={!isEditingPassword}
                                    onClick={() => setShowNewPassword((value) => !value)}
                                    type="button"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    className="pr-10"
                                    disabled={!isEditingPassword}
                                    error={passwordForm.errors.password_confirmation}
                                    label="Konfirmasi Sandi Baru"
                                    name="password_confirmation"
                                    onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={passwordForm.data.password_confirmation}
                                />
                                <button
                                    aria-label={
                                        showPasswordConfirmation ? 'Sembunyikan konfirmasi sandi baru' : 'Tampilkan konfirmasi sandi baru'
                                    }
                                    className="absolute top-7.5 right-3 flex h-5 w-5 cursor-pointer items-center justify-center text-zinc-400 transition hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={!isEditingPassword}
                                    onClick={() => setShowPasswordConfirmation((value) => !value)}
                                    type="button"
                                >
                                    {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {isEditingPassword ? (
                                <div className="pt-2">
                                    <Button
                                        className="bg-slate-800 text-white hover:bg-slate-700"
                                        isLoading={passwordForm.processing}
                                        size="md"
                                        type="submit"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            ) : null}
                        </form>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
