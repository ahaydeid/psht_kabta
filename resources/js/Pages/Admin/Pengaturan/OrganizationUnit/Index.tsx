import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DataTable, Modal, type DataTableColumn } from '@/Components/Base';
import { Badge, Button, Input, Select, Textarea, ToggleSwitch } from '@/Components/ui';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { confirmAction, showToast } from '@/lib/alert';

type OrganizationScope = 'cabang' | 'komisariat' | 'ranting' | 'rayon' | 'sub-rayon';

type ParentOption = {
    id: number;
    name: string;
};

type OrganizationUnitRow = Record<string, unknown> & {
    address: null | string;
    canDelete: boolean;
    code: null | string;
    id: number;
    isActive: boolean;
    name: string;
    parentId: null | number;
    parentName: string;
    phone: null | string;
};

type OrganizationUnitFilters = {
    page: number;
    per_page: number;
    search: string;
    status: 'active' | 'all' | 'inactive';
};

type OrganizationUnitPagination = {
    currentPage: number;
    data: OrganizationUnitRow[];
    perPage: number;
    total: number;
    totalPages: number;
};

type OrganizationUnitIndexProps = {
    canCreate: boolean;
    canManage: boolean;
    filters: OrganizationUnitFilters;
    parentLabel: string;
    parentOptions: ParentOption[];
    scope: OrganizationScope;
    scopeLabel: string;
    units: OrganizationUnitPagination;
    usesListView: boolean;
};

type UnitFormData = {
    address: string;
    code: string;
    is_active: boolean;
    name: string;
    parent_id: string;
    phone: string;
};

type UnitFormModalProps = {
    initialData?: null | OrganizationUnitRow;
    mode: 'create' | 'edit';
    onClose: () => void;
    open: boolean;
    parentLabel: string;
    parentOptions: ParentOption[];
    scopeLabel: string;
    submitUrl: string;
};

const statusOptions: Array<{ label: string; value: OrganizationUnitFilters['status'] }> = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Tidak Aktif', value: 'inactive' },
];

function emptyValue(value?: null | string) {
    return value?.trim() ? value : '-';
}

function DetailItem({ label, value }: { label: string; value?: null | string }) {
    return (
        <div className="border-b border-zinc-100 py-3 last:border-b-0">
            <p className="text-xs font-medium text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-800">{emptyValue(value)}</p>
        </div>
    );
}

function OrganizationUnitProfile({
    canManage,
    onEdit,
    parentLabel,
    scopeLabel,
    unit,
}: {
    canManage: boolean;
    onEdit: () => void;
    parentLabel: string;
    scopeLabel: string;
    unit?: OrganizationUnitRow;
}) {
    if (!unit) {
        return (
            <section className="border border-zinc-200 bg-white p-5">
                <p className="text-sm text-zinc-500">Data {scopeLabel.toLowerCase()} belum tersedia.</p>
            </section>
        );
    }

    return (
        <section className="border border-zinc-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">{unit.name}</h3>
                    <div className="mt-2">
                        <Badge className="border-0" size="sm" variant={unit.isActive ? 'success' : 'secondary'}>
                            {unit.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                    </div>
                </div>
                {canManage ? (
                    <Button className="w-full text-zinc-700 sm:w-auto" icon={<Pencil className="h-4 w-4" />} onClick={onEdit} size="md" variant="warning">
                        Edit
                    </Button>
                ) : null}
            </div>
            <div className="grid grid-cols-1 px-5 py-2 md:grid-cols-2 md:gap-x-8">
                <DetailItem label={parentLabel} value={unit.parentName} />
                <DetailItem label="Telepon" value={unit.phone} />
                <div className="md:col-span-2">
                    <DetailItem label="Alamat" value={unit.address} />
                </div>
            </div>
        </section>
    );
}

function OrganizationUnitFormModal({
    initialData = null,
    mode,
    onClose,
    open,
    parentLabel,
    parentOptions,
    scopeLabel,
    submitUrl,
}: UnitFormModalProps) {
    const isEdit = mode === 'edit';
    const parentOptionsKey = parentOptions.map((option) => `${option.id}:${option.name}`).join('|');
    const form = useForm<UnitFormData>({
        address: '',
        code: '',
        is_active: true,
        name: '',
        parent_id: '',
        phone: '',
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        const defaultParentId = initialData?.parentId
            ? String(initialData.parentId)
            : parentOptions.length === 1
              ? String(parentOptions[0].id)
              : '';

        form.setData({
            address: initialData?.address ?? '',
            code: initialData?.code ?? '',
            is_active: initialData?.isActive ?? true,
            name: initialData?.name ?? '',
            parent_id: defaultParentId,
            phone: initialData?.phone ?? '',
        });
        form.clearErrors();
    }, [initialData?.id, mode, open, parentOptions.length, parentOptionsKey]);

    const closeModal = () => {
        form.clearErrors();
        onClose();
    };

    const saveForm = async () => {
        const result = await confirmAction({
            title: isEdit ? `Simpan perubahan ${scopeLabel}?` : `Tambah ${scopeLabel} baru?`,
            text: 'Data struktur organisasi akan diperbarui.',
            confirmButtonText: 'Ya, simpan',
        });

        if (!result.isConfirmed) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                showToast({ title: isEdit ? `${scopeLabel} berhasil diperbarui.` : `${scopeLabel} berhasil ditambahkan.` });
                closeModal();
            },
        };

        if (isEdit) {
            form.put(submitUrl, options);
            return;
        }

        form.post(submitUrl, options);
    };

    return (
        <Modal
            footer={
                <>
                    <Button disabled={form.processing} onClick={closeModal} size="md" variant="outline">
                        Batal
                    </Button>
                    <Button className="bg-slate-800 text-white hover:bg-slate-700" isLoading={form.processing} onClick={saveForm} size="md">
                        Simpan
                    </Button>
                </>
            }
            onClose={closeModal}
            open={open}
            size="xl"
            subtitle="Lengkapi identitas unit sesuai struktur organisasi."
            title={isEdit ? `Edit ${scopeLabel}` : `Tambah ${scopeLabel}`}
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                    disabled={parentOptions.length === 1}
                    error={form.errors.parent_id}
                    label={parentLabel}
                    name="parent_id"
                    onChange={(event) => form.setData('parent_id', event.target.value)}
                    value={form.data.parent_id}
                >
                    <option value="">Pilih {parentLabel.toLowerCase()}</option>
                    {parentOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </Select>

                <Input
                    error={form.errors.name}
                    label={`Nama ${scopeLabel}`}
                    name="name"
                    onChange={(event) => form.setData('name', event.target.value)}
                    value={form.data.name}
                />

                <Input
                    error={form.errors.code}
                    label="Kode Unit"
                    name="code"
                    onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                    placeholder="Contoh: RAY-VILLA"
                    value={form.data.code}
                />

                <Input
                    error={form.errors.phone}
                    label="No Telepon"
                    name="phone"
                    onChange={(event) => form.setData('phone', event.target.value)}
                    placeholder="Contoh: 081234567890"
                    value={form.data.phone}
                />

                <div className="md:col-span-2">
                    <Textarea
                        error={form.errors.address}
                        label="Alamat"
                        name="address"
                        onChange={(event) => form.setData('address', event.target.value)}
                        value={form.data.address}
                    />
                </div>

                <div className="md:col-span-2">
                    <ToggleSwitch
                        checked={form.data.is_active}
                        label={form.data.is_active ? 'Aktif' : 'Tidak Aktif'}
                        name="is_active"
                        onChange={(event) => form.setData('is_active', event.target.checked)}
                    />
                    {form.errors.is_active ? <p className="mt-1 text-xs font-medium text-brand-red">{form.errors.is_active}</p> : null}
                </div>
            </div>
        </Modal>
    );
}

export default function OrganizationUnitIndex({
    canCreate,
    canManage,
    filters,
    parentLabel,
    parentOptions,
    scope,
    scopeLabel,
    units,
    usesListView,
}: OrganizationUnitIndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<null | OrganizationUnitRow>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState<OrganizationUnitFilters['status']>(filters.status);
    const [rowsPerPage, setRowsPerPage] = useState(filters.per_page);
    const basePath = `/admin/pengaturan/${scope}`;

    useEffect(() => {
        setSearchTerm(filters.search);
        setStatusFilter(filters.status);
        setRowsPerPage(filters.per_page);
    }, [filters.page, filters.per_page, filters.search, filters.status]);

    const applyFilters = (nextFilters: Partial<OrganizationUnitFilters>) => {
        router.get(
            basePath,
            {
                page: nextFilters.page ?? filters.page,
                per_page: nextFilters.per_page ?? rowsPerPage,
                search: nextFilters.search ?? searchTerm,
                status: nextFilters.status ?? statusFilter,
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

    const handleDelete = async (unit: OrganizationUnitRow) => {
        const result = await confirmAction({
            cancelButtonText: 'Batal',
            confirmButtonText: 'Ya, hapus',
            text: `Data ${unit.name} akan dihapus dari struktur organisasi.`,
            title: `Hapus ${scopeLabel}?`,
            variant: 'danger',
        });

        if (!result.isConfirmed) {
            return;
        }

        router.delete(`${basePath}/${unit.id}`, {
            preserveScroll: true,
            onSuccess: () => showToast({ title: `${scopeLabel} berhasil dihapus.` }),
        });
    };

    const columns = useMemo<DataTableColumn<OrganizationUnitRow>[]>(() => {
        const baseColumns: DataTableColumn<OrganizationUnitRow>[] = [
            {
                cell: (_, index) => <div className="w-8 truncate text-center">{(units.currentPage - 1) * units.perPage + index + 1}</div>,
                header: 'No.',
                key: 'no',
                stickyLeft: 'left-0',
            },
            {
                cell: (row) => <div className="w-56 truncate font-semibold text-zinc-800">{row.name}</div>,
                header: scopeLabel,
                key: 'name',
                stickyLeft: 'left-[56px]',
            },
            {
                cell: (row) => <div className="w-48 truncate">{row.parentName}</div>,
                header: parentLabel,
                key: 'parentName',
            },
            {
                cell: (row) => <div className="w-36 truncate">{emptyValue(row.phone)}</div>,
                header: 'Telepon',
                key: 'phone',
            },
            {
                cell: (row) => (
                    <Badge className="border-0" size="sm" variant={row.isActive ? 'success' : 'secondary'}>
                        {row.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                ),
                header: 'Status',
                key: 'isActive',
            },
        ];

        if (!canManage) {
            return baseColumns;
        }

        return [
            ...baseColumns,
            {
                cell: (row) => (
                    <div className="flex items-center gap-2">
                        <Button
                            className="text-zinc-700"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => setSelectedUnit(row)}
                            size="sm"
                            variant="warning"
                        >
                            Edit
                        </Button>
                        <Button
                            disabled={!row.canDelete}
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleDelete(row)}
                            size="sm"
                            title={row.canDelete ? 'Hapus unit' : 'Unit masih dipakai oleh data lain'}
                            variant="danger"
                        >
                            Hapus
                        </Button>
                    </div>
                ),
                header: 'Aksi',
                key: 'action',
                searchable: false,
                stickyRight: true,
            },
        ];
    }, [canManage, parentLabel, scopeLabel, units.currentPage, units.perPage]);

    const unit = units.data[0];

    return (
        <AdminLayout>
            <Head title={`Pengaturan ${scopeLabel}`} />

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800">Pengaturan {scopeLabel}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {canCreate ? (
                            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)} size="md" variant="primary">
                                Tambah {scopeLabel}
                            </Button>
                        ) : null}
                    </div>
                </div>

                {usesListView ? (
                    <DataTable
                        columns={columns}
                        controlsEnd={
                            <Select
                                className="min-w-40"
                                containerClassName="w-auto"
                                onChange={(event) => {
                                    const nextStatus = event.target.value as OrganizationUnitFilters['status'];
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
                        }
                        currentPage={units.currentPage}
                        data={units.data}
                        emptyMessage={`Belum ada data ${scopeLabel.toLowerCase()} yang sesuai dengan filter.`}
                        getRowKey={(row) => row.id}
                        onPageChange={(page) => applyFilters({ page })}
                        onRowsPerPageChange={(value) => {
                            setRowsPerPage(value);
                            applyFilters({ page: 1, per_page: value });
                        }}
                        onSearchTermChange={setSearchTerm}
                        placeholder={`Cari nama, telepon, atau ${parentLabel.toLowerCase()}...`}
                        rowsPerPage={rowsPerPage}
                        searchTerm={searchTerm}
                        serverSide
                        totalPages={units.totalPages}
                    />
                ) : (
                    <OrganizationUnitProfile
                        canManage={canManage}
                        onEdit={() => {
                            if (unit) {
                                setSelectedUnit(unit);
                            }
                        }}
                        parentLabel={parentLabel}
                        scopeLabel={scopeLabel}
                        unit={unit}
                    />
                )}
            </div>

            <OrganizationUnitFormModal
                mode="create"
                onClose={() => setIsCreateOpen(false)}
                open={isCreateOpen}
                parentLabel={parentLabel}
                parentOptions={parentOptions}
                scopeLabel={scopeLabel}
                submitUrl={basePath}
            />

            <OrganizationUnitFormModal
                initialData={selectedUnit}
                mode="edit"
                onClose={() => setSelectedUnit(null)}
                open={Boolean(selectedUnit)}
                parentLabel={parentLabel}
                parentOptions={parentOptions}
                scopeLabel={scopeLabel}
                submitUrl={selectedUnit ? `${basePath}/${selectedUnit.id}` : basePath}
            />
        </AdminLayout>
    );
}
