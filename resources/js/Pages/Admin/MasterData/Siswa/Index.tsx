import { Head, router, usePage } from '@inertiajs/react';
import { Download, Eye, Plus, Upload, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTable, type DataTableColumn } from '@/Components/Base';
import { Badge, Button, Select } from '@/Components/ui';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { StudentFormModal, type StudentBelt, type StudentCitizenship, type StudentGender, type StudentStatus, type TrainingUnitOption } from './StudentFormModal';

type StudentRow = {
    address: string;
    belt: StudentBelt;
    birthDate: string;
    birthDateValue: string;
    birthPlace: string;
    citizenship: StudentCitizenship;
    fatherOrGuardianName: string;
    gender: StudentGender;
    identityType: 'KTP/KK';
    id: number;
    joinedAt: string;
    name: string;
    nik: string;
    occupation: string;
    phone: string;
    photoUrl?: null | string;
    ranting: string;
    religion: string;
    status: StudentStatus;
    trainingUnit: string;
};

type StudentFilters = {
    page: number;
    per_page: number;
    search: string;
    status: 'active' | 'all' | 'graduated' | 'inactive' | 'transferred';
    unit: string;
};

type StudentPagination = {
    currentPage: number;
    data: StudentRow[];
    perPage: number;
    total: number;
    totalPages: number;
};

const statusOptions: Array<{ label: string; value: 'all' | StudentStatus }> = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Tidak Aktif', value: 'inactive' },
    { label: 'Pindah', value: 'transferred' },
];

function statusBadgeVariant(status: StudentStatus) {
    switch (status) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'secondary';
        case 'graduated':
            return 'info';
        case 'transferred':
            return 'outline';
        default:
            return 'secondary';
    }
}

function statusLabel(status: StudentStatus) {
    switch (status) {
        case 'active':
            return 'Aktif';
        case 'inactive':
            return 'Tidak Aktif';
        case 'graduated':
            return 'Lulus / Warga';
        case 'transferred':
            return 'Pindah';
        default:
            return status;
    }
}

function beltClassName(belt: StudentBelt) {
    switch (belt) {
        case 'Polos':
            return 'border-brand-black bg-brand-black text-white';
        case 'Jambon':
            return 'border-pink-500 bg-pink-500 text-white';
        case 'Hijau':
            return 'border-green-600 bg-green-600 text-white';
        case 'Putih':
            return 'border-slate-200 bg-white text-brand-black';
        default:
            return 'border-zinc-200 bg-white text-brand-black';
    }
}

function getJakartaTodayParts() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());

    return {
        year: Number(parts.find((part) => part.type === 'year')?.value ?? '0'),
        month: Number(parts.find((part) => part.type === 'month')?.value ?? '0'),
        day: Number(parts.find((part) => part.type === 'day')?.value ?? '0'),
    };
}

function ageLabel(birthDateValue: string) {
    if (!birthDateValue) {
        return '-';
    }

    const [birthYear, birthMonth, birthDay] = birthDateValue.split('-').map(Number);

    if (!birthYear || !birthMonth || !birthDay) {
        return '-';
    }

    const today = getJakartaTodayParts();
    let years = today.year - birthYear;
    let months = today.month - birthMonth;

    if (today.day < birthDay) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (years < 0) {
        return '-';
    }

    return `${years} thn, ${months} bln`;
}

type AdminMasterDataSiswaIndexProps = {
    defaultTrainingUnitId?: null | number;
    filters: StudentFilters;
    students: StudentPagination;
    trainingUnitOptions: TrainingUnitOption[];
};

type SharedPageProps = {
    auth?: {
        organizationUnit?: {
            type?: string;
        } | null;
    };
};

export default function AdminMasterDataSiswaIndex({
    defaultTrainingUnitId = null,
    filters,
    students,
    trainingUnitOptions = [],
}: AdminMasterDataSiswaIndexProps) {
    const { auth } = usePage<SharedPageProps>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>(filters.status);
    const [unitFilter, setUnitFilter] = useState(filters.unit);
    const [rowsPerPage, setRowsPerPage] = useState(filters.per_page);
    const shouldShowRanting = auth?.organizationUnit?.type === 'cabang';

    useEffect(() => {
        setSearchTerm(filters.search);
        setStatusFilter(filters.status);
        setUnitFilter(filters.unit);
        setRowsPerPage(filters.per_page);
    }, [filters.page, filters.per_page, filters.search, filters.status, filters.unit]);

    const applyFilters = (nextFilters: Partial<StudentFilters>) => {
        router.get(
            '/admin/master-data/siswa',
            {
                page: nextFilters.page ?? filters.page,
                per_page: nextFilters.per_page ?? rowsPerPage,
                search: nextFilters.search ?? searchTerm,
                status: nextFilters.status ?? statusFilter,
                unit: nextFilters.unit ?? unitFilter,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            if (searchTerm === filters.search) {
                return;
            }

            applyFilters({ page: 1, search: searchTerm });
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [filters.search, searchTerm]);

    const columns: DataTableColumn<StudentRow>[] = [
        {
            cell: (_, index) => <div className="w-8 truncate text-center">{index + 1}</div>,
            header: 'No.',
            key: 'no',
            stickyLeft: 'left-0',
        },
        {
            cell: (row) => (
                <div className="flex w-44 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-zinc-400">
                        {row.photoUrl ? (
                            <img alt={row.name} className="h-full w-full object-cover" src={row.photoUrl} />
                        ) : (
                            <UserRound className="h-4 w-4" />
                        )}
                    </div>
                    <div className="truncate font-semibold text-zinc-800">{row.name}</div>
                </div>
            ),
            header: 'Siswa',
            key: 'name',
            stickyLeft: 'left-[56px]',
        },
        {
            cell: (row) => (
                <Badge className={beltClassName(row.belt)} size="sm" variant="unstyled">
                    {row.belt}
                </Badge>
            ),
            header: 'Sabuk',
            key: 'belt',
        },
        {
            cell: (row) => <div className="w-32 truncate">{ageLabel(row.birthDateValue)}</div>,
            header: 'Usia',
            key: 'age',
        },
        {
            cell: (row) => <div className="w-40 truncate">{row.nik}</div>,
            header: 'NIK',
            key: 'nik',
        },
        {
            cell: (row) => <div className="w-32 truncate">{row.phone}</div>,
            header: 'No. HP',
            key: 'phone',
        },
        {
            cell: (row) => <div className="w-40 truncate">{row.trainingUnit}</div>,
            header: 'Unit Latihan',
            key: 'trainingUnit',
        },
        ...(shouldShowRanting
            ? [
                  {
                      cell: (row: StudentRow) => <div className="w-48 truncate text-sm text-zinc-600">{row.ranting}</div>,
                      header: 'Ranting',
                      key: 'ranting',
                  } satisfies DataTableColumn<StudentRow>,
              ]
            : []),
        {
            cell: (row) => <div className="w-28 truncate">{row.joinedAt}</div>,
            header: 'Tanggal Gabung',
            key: 'joinedAt',
        },
        {
            cell: (row) =>
                row.status === 'graduated' ? (
                    <span className="text-zinc-400">-</span>
                ) : (
                    <Badge className="border-0" size="sm" variant={statusBadgeVariant(row.status)}>
                        {statusLabel(row.status)}
                    </Badge>
                ),
            header: 'Status',
            key: 'status',
        },
        {
            cell: (row) => <div className="w-44 truncate text-sm text-zinc-600">{row.address}</div>,
            header: 'Alamat',
            key: 'address',
            searchable: false,
        },
        {
            cell: (row) => (
                <Button
                    className="text-zinc-700"
                    icon={<Eye className="h-4 w-4" />}
                    onClick={() => router.visit(`/admin/master-data/siswa/${row.id}`)}
                    size="sm"
                    variant="warning"
                >
                    Detail
                </Button>
            ),
            header: 'Aksi',
            key: 'action',
            searchable: false,
            stickyRight: true,
        },
    ];

    return (
        <AdminLayout>
            <Head title="Master Siswa" />

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800">Master Siswa</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)} size="md" variant="primary">
                            Tambah Siswa
                        </Button>
                        <Button icon={<Upload className="h-4 w-4" />} size="md" variant="info">
                            Import
                        </Button>
                        <Button icon={<Download className="h-4 w-4" />} size="md" variant="success">
                            Export
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    controlsEnd={
                        <>
                            <Select
                                className="min-w-40"
                                containerClassName="w-auto"
                                onChange={(event) => {
                                    const nextStatus = event.target.value as 'all' | StudentStatus;
                                    setStatusFilter(nextStatus);
                                    applyFilters({ page: 1, status: nextStatus });
                                }}
                                value={statusFilter}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            <Select
                                className="min-w-48"
                                containerClassName="w-auto"
                                onChange={(event) => {
                                    const nextUnit = event.target.value;
                                    setUnitFilter(nextUnit);
                                    applyFilters({ page: 1, unit: nextUnit });
                                }}
                                value={unitFilter}
                            >
                                <option value="all">Semua Unit</option>
                                {trainingUnitOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </Select>
                        </>
                    }
                    currentPage={students.currentPage}
                    data={students.data}
                    emptyMessage="Belum ada data siswa yang sesuai dengan filter."
                    getRowKey={(row) => row.id}
                    onPageChange={(page) => applyFilters({ page })}
                    onRowsPerPageChange={(value) => {
                        setRowsPerPage(value);
                        applyFilters({ page: 1, per_page: value });
                    }}
                    onSearchTermChange={setSearchTerm}
                    placeholder="Cari nama, sabuk, NIK, unit latihan..."
                    rowsPerPage={rowsPerPage}
                    searchTerm={searchTerm}
                    serverSide
                    totalPages={students.totalPages}
                />
            </div>

            <StudentFormModal
                defaultTrainingUnitId={defaultTrainingUnitId}
                mode="create"
                onClose={() => setIsCreateOpen(false)}
                open={isCreateOpen}
                submitUrl="/admin/master-data/siswa"
                trainingUnitOptions={trainingUnitOptions}
            />
        </AdminLayout>
    );
}
