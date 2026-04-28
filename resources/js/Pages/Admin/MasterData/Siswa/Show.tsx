import { Head, router, usePage } from "@inertiajs/react";
import { ChevronLeft, Pencil, Trash2, UserRound } from "lucide-react";
import Swal from "sweetalert2";
import { useState, type ReactNode } from "react";

import { Badge, Button } from "@/Components/ui";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { showToast } from "@/lib/alert";
import { StudentFormModal, type TrainingUnitOption } from "./StudentFormModal";

type StudentStatus = "active" | "inactive" | "graduated" | "transferred";
type StudentBelt = "Polos" | "Jambon" | "Hijau" | "Putih";
type StudentCitizenship = "WNI" | "WNA";
type StudentGender = "Laki-laki" | "Perempuan";

type StudentDetail = {
    address: null | string;
    belt: StudentBelt;
    birthDate: string;
    birthDateValue: string;
    birthPlace: null | string;
    citizenship: StudentCitizenship;
    fatherOrGuardianName: null | string;
    gender: StudentGender;
    id: number;
    identityNumber: string;
    identityType: "KTP/KK";
    joinedAt: string;
    joinedAtValue: string;
    name: string;
    occupation: null | string;
    organizationUnitId: number;
    phone: null | string;
    photoUrl?: null | string;
    ranting: string;
    religion: null | string;
    status: StudentStatus;
    trainingUnit: string;
};

type AdminMasterDataSiswaShowProps = {
    student: StudentDetail;
    trainingUnitOptions: TrainingUnitOption[];
};

type SharedPageProps = {
    auth?: {
        permissions?: string[];
        roles?: string[];
        organizationUnit?: {
            type?: string;
        } | null;
    };
};

function statusBadgeVariant(status: StudentStatus) {
    switch (status) {
        case "active":
            return "success";
        case "inactive":
            return "secondary";
        case "graduated":
            return "info";
        case "transferred":
            return "outline";
        default:
            return "secondary";
    }
}

function statusLabel(status: StudentStatus) {
    switch (status) {
        case "active":
            return "Aktif";
        case "inactive":
            return "Tidak Aktif";
        case "graduated":
            return "Lulus / Warga";
        case "transferred":
            return "Pindah";
        default:
            return status;
    }
}

function beltClassName(belt: StudentBelt) {
    switch (belt) {
        case "Polos":
            return "border-brand-black bg-brand-black text-white";
        case "Jambon":
            return "border-pink-500 bg-pink-500 text-white";
        case "Hijau":
            return "border-green-600 bg-green-600 text-white";
        case "Putih":
            return "border-slate-200 bg-white text-brand-black";
        default:
            return "border-zinc-200 bg-white text-brand-black";
    }
}

function emptyValue(value?: null | string) {
    return value && value.trim() ? value : "-";
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value?: null | string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="text-xs font-medium text-zinc-500">{label}</div>
            <div className="text-sm font-semibold text-zinc-800">
                {emptyValue(value)}
            </div>
        </div>
    );
}

function DetailBadgeItem({
    children,
    label,
}: {
    children: ReactNode;
    label: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="text-xs font-medium text-zinc-500">{label}</div>
            {children}
        </div>
    );
}

function DetailSection({
    children,
    className = "",
    title,
}: {
    children: ReactNode;
    className?: string;
    title: string;
}) {
    return (
        <section className={`student-detail-section ${className}`}>
            <div>
                <h3 className="text-base font-bold text-brand-yellow-dark">{title}</h3>
            </div>
            {children}
        </section>
    );
}

export default function AdminMasterDataSiswaShow({
    student,
    trainingUnitOptions = [],
}: AdminMasterDataSiswaShowProps) {
    const { auth } = usePage<SharedPageProps>().props;
    const [isEditOpen, setIsEditOpen] = useState(false);
    const shouldShowRanting = auth?.organizationUnit?.type !== "ranting";
    const canDeleteStudent =
        (auth?.permissions?.includes("student.delete") ?? false) ||
        (auth?.roles?.some((role) =>
            [
                "super_admin",
                "admin_pusat",
                "admin_cabang",
                "admin_ranting",
                "admin_rayon",
                "admin_sub_rayon",
                "admin_komisariat",
            ].includes(role),
        ) ??
            false);

    const handleDeleteStudent = async () => {
        const result = await Swal.fire({
            title: "Hapus siswa ini?",
            text: `Ketik nama siswa persis seperti "${student.name}" untuk melanjutkan.`,
            input: "text",
            inputLabel: "Nama siswa",
            inputPlaceholder: student.name,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#e4e4e7",
            customClass: {
                title: "!text-2xl",
                confirmButton: "!text-white",
                cancelButton: "!text-zinc-700",
                input: "!rounded !border !border-zinc-300 !px-3 !py-2 !text-sm !text-zinc-800 focus:!border-brand-yellow-dark focus:!ring-1 focus:!ring-brand-yellow/30",
                inputLabel: "!text-sm !font-medium !text-zinc-700",
            },
            inputValidator: (value) => {
                if (value.trim() !== student.name.trim()) {
                    return "Nama siswa tidak cocok.";
                }

                return undefined;
            },
        });

        if (!result.isConfirmed) {
            return;
        }

        router.delete(`/admin/master-data/siswa/${student.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                showToast({ title: "Data siswa berhasil dihapus." });
            },
        });
    };

    return (
        <AdminLayout>
            <Head title={`Detail Siswa - ${student.name}`} />

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        aria-label="Kembali ke daftar siswa"
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-transparent text-zinc-700 transition hover:border-slate-100 hover:bg-white hover:text-brand-black"
                        onClick={() => router.visit("/admin/master-data/siswa")}
                        type="button"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-800">
                            Detail Siswa
                        </h2>
                    </div>
                </div>

                <div className="student-detail-layout">
                    <div>
                        <aside className="w-full rounded border border-zinc-200 bg-white p-4">
                            <div className="student-profile-media">
                                <div
                                    className="overflow-hidden rounded bg-zinc-100"
                                    style={{ aspectRatio: "3 / 4" }}
                                >
                                    {student.photoUrl ? (
                                        <img
                                            alt={student.name}
                                            className="h-full w-full object-cover"
                                            src={student.photoUrl}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                            <UserRound className="h-24 w-24" />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`flex items-center justify-center overflow-hidden border text-2xl font-extrabold uppercase tracking-wide ${beltClassName(student.belt)}`}
                                >
                                    <span
                                        className="whitespace-nowrap"
                                        style={{ transform: "rotate(90deg)" }}
                                    >
                                        {student.belt}
                                    </span>
                                </div>
                            </div>

                            <div
                                className="mt-4 grid"
                                style={{
                                    gridTemplateColumns: "minmax(0, 1fr) 3rem",
                                }}
                            >
                                <div className="text-center">
                                    <span className="text-lg font-bold leading-tight text-zinc-900">
                                        {student.name}
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className="min-w-0 space-y-3">
                        <section className="student-detail-card rounded border border-zinc-200 bg-white">
                            <DetailSection title="Data Diri Siswa">
                                <div className="student-detail-grid">
                                    <DetailItem
                                        label="Kewarganegaraan"
                                        value={student.citizenship}
                                    />
                                    <DetailItem
                                        label="Nomor Identitas (KTP/KK)"
                                        value={student.identityNumber}
                                    />
                                    <DetailItem
                                        label="Tempat Lahir"
                                        value={student.birthPlace}
                                    />
                                    <DetailItem
                                        label="Tanggal Lahir"
                                        value={student.birthDate}
                                    />
                                    <DetailItem
                                        label="Jenis Kelamin"
                                        value={student.gender}
                                    />
                                    <DetailItem
                                        label="Agama"
                                        value={student.religion}
                                    />
                                </div>
                            </DetailSection>

                            <DetailSection title="Kontak & Wali">
                                <div className="student-detail-grid student-detail-grid--contact">
                                    <DetailItem
                                        label="Alamat Lengkap"
                                        value={student.address}
                                    />
                                    <DetailItem
                                        label="Pekerjaan"
                                        value={student.occupation}
                                    />
                                    <DetailItem
                                        label="No HP / WA"
                                        value={
                                            student.phone
                                                ? `+62${student.phone}`
                                                : null
                                        }
                                    />
                                    <DetailItem
                                        label="Nama Ayah / Wali"
                                        value={student.fatherOrGuardianName}
                                    />
                                </div>
                            </DetailSection>

                            <DetailSection title="Data Keanggotaan">
                                <div className="student-detail-grid">
                                    <DetailBadgeItem label="Unit Latihan">
                                        <Badge
                                            className="rounded-none border-zinc-700 bg-zinc-700 px-2.5 py-1 text-sm font-semibold text-white"
                                            variant="unstyled"
                                        >
                                            {emptyValue(student.trainingUnit)}
                                        </Badge>
                                    </DetailBadgeItem>
                                    {shouldShowRanting ? (
                                        <DetailItem
                                            label="Ranting"
                                            value={student.ranting}
                                        />
                                    ) : null}
                                    <DetailItem
                                        label="Tanggal Gabung"
                                        value={student.joinedAt}
                                    />
                                    <DetailBadgeItem label="Status Siswa">
                                        <Badge
                                            className="justify-center border-0"
                                            size="sm"
                                            variant={statusBadgeVariant(
                                                student.status,
                                            )}
                                        >
                                            {statusLabel(student.status)}
                                        </Badge>
                                    </DetailBadgeItem>
                                </div>
                            </DetailSection>
                        </section>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            {canDeleteStudent ? (
                                <Button
                                    className="w-full rounded-full hover:!border-brand-red hover:!bg-brand-red hover:!text-white sm:w-40"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={handleDeleteStudent}
                                    size="md"
                                    variant="outline"
                                >
                                    Hapus
                                </Button>
                            ) : null}
                            <Button
                                className="w-full rounded-full hover:!border-brand-yellow hover:!bg-brand-yellow hover:!text-brand-black sm:w-40"
                                icon={<Pencil className="h-4 w-4" />}
                                onClick={() => setIsEditOpen(true)}
                                size="md"
                                variant="outline"
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <StudentFormModal
                initialData={{
                    _method: "put",
                    address: student.address ?? "",
                    belt: student.belt,
                    birth_date: student.birthDateValue,
                    birth_place: student.birthPlace ?? "",
                    citizenship: student.citizenship,
                    father_or_guardian_name: student.fatherOrGuardianName ?? "",
                    gender: student.gender,
                    identity_number: student.identityNumber,
                    joined_at: student.joinedAtValue,
                    name: student.name,
                    occupation: student.occupation ?? "",
                    organization_unit_id: String(student.organizationUnitId),
                    phone: student.phone ?? "",
                    religion: student.religion ?? "",
                    status: student.status,
                }}
                mode="edit"
                onClose={() => setIsEditOpen(false)}
                open={isEditOpen}
                submitUrl={`/admin/master-data/siswa/${student.id}`}
                trainingUnitOptions={trainingUnitOptions}
            />
        </AdminLayout>
    );
}
