import { useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Modal } from '@/Components/Base';
import { Button, Input, Select, Textarea } from '@/Components/ui';
import { confirmAction, showToast } from '@/lib/alert';

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type StudentBelt = 'Polos' | 'Jambon' | 'Hijau' | 'Putih';
export type StudentCitizenship = 'WNI' | 'WNA';
export type StudentGender = 'Laki-laki' | 'Perempuan';
type FormTab = 'identity' | 'contact' | 'membership';
type FormMode = 'create' | 'edit';

export type TrainingUnitOption = {
    id: number;
    name: string;
};

export type StudentFormData = {
    _method?: 'put';
    address: string;
    belt: StudentBelt;
    birth_date: string;
    birth_place: string;
    citizenship: StudentCitizenship;
    father_or_guardian_name: string;
    gender: StudentGender;
    identity_number: string;
    joined_at: string;
    name: string;
    occupation: string;
    organization_unit_id: string;
    phone: string;
    photo: File | null;
    religion: string;
    status: StudentStatus;
};

type StudentFormErrors = Partial<Record<keyof StudentFormData, string>>;

type StudentFormInitialData = Partial<StudentFormData> & {
    photo_url?: null | string;
};

type StudentFormModalProps = {
    defaultTrainingUnitId?: null | number;
    initialData?: StudentFormInitialData;
    mode: FormMode;
    onClose: () => void;
    open: boolean;
    submitUrl: string;
    trainingUnitOptions: TrainingUnitOption[];
};

const formTabs: Array<{ id: FormTab; label: string }> = [
    { id: 'identity', label: 'Identitas' },
    { id: 'contact', label: 'Kontak & Wali' },
    { id: 'membership', label: 'Keanggotaan' },
];

const formTabFields: Record<FormTab, Array<keyof StudentFormData>> = {
    identity: ['citizenship', 'identity_number', 'name', 'birth_place', 'birth_date', 'gender', 'religion'],
    contact: ['address', 'occupation', 'phone', 'father_or_guardian_name'],
    membership: ['organization_unit_id', 'joined_at', 'belt', 'status', 'photo'],
};

const beltOptions: StudentBelt[] = ['Polos', 'Jambon', 'Hijau', 'Putih'];
const citizenshipOptions: StudentCitizenship[] = ['WNI', 'WNA'];
const genderOptions: StudentGender[] = ['Laki-laki', 'Perempuan'];
const religionOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const statusOptions: Array<{ label: string; value: StudentStatus }> = [
    { label: 'Aktif', value: 'active' },
    { label: 'Tidak Aktif', value: 'inactive' },
    { label: 'Lulus / Warga', value: 'graduated' },
    { label: 'Pindah', value: 'transferred' },
];

const emptyFormData: StudentFormData = {
    address: '',
    belt: 'Polos',
    birth_date: '',
    birth_place: '',
    citizenship: 'WNI',
    father_or_guardian_name: '',
    gender: 'Laki-laki',
    identity_number: '',
    joined_at: '',
    name: '',
    occupation: '',
    organization_unit_id: '',
    phone: '',
    photo: null,
    religion: 'Islam',
    status: 'active',
};

function numericOnly(value: string) {
    return value.replace(/\D/g, '');
}

function capitalizeWords(value: string) {
    return value
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('id-ID')
        .replace(/(^|[\s\-/'(])([a-z\u00c0-\u024f])/gu, (match, separator: string, character: string) => `${separator}${character.toLocaleUpperCase('id-ID')}`);
}

function tabClassName(isActive: boolean) {
    return isActive
        ? 'border-brand-yellow text-brand-black'
        : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-brand-black';
}

function firstErrorTab(errors: StudentFormErrors): FormTab {
    return formTabs.find((tab) => formTabFields[tab.id].some((field) => Boolean(errors[field])))?.id ?? 'identity';
}

function identityRequiredErrors(data: StudentFormData): StudentFormErrors {
    const errors: StudentFormErrors = {};

    if (!data.name.trim()) {
        errors.name = 'Nama lengkap wajib diisi.';
    }

    if (!data.identity_number.trim()) {
        errors.identity_number = 'NIK wajib diisi.';
    } else if (data.identity_number.length !== 16) {
        errors.identity_number = 'NIK harus terdiri dari 16 digit.';
    }

    return errors;
}

function makeInitialData(mode: FormMode, initialData?: StudentFormInitialData): StudentFormData {
    const { photo_url: _photoUrl, ...restInitialData } = initialData ?? {};

    return {
        ...emptyFormData,
        ...(mode === 'edit' ? { _method: 'put' as const } : {}),
        ...restInitialData,
        photo: null,
    };
}

export function StudentFormModal({
    defaultTrainingUnitId = null,
    initialData,
    mode,
    onClose,
    open,
    submitUrl,
    trainingUnitOptions,
}: StudentFormModalProps) {
    const [activeTab, setActiveTab] = useState<FormTab>('identity');
    const initialFormData = useMemo(() => makeInitialData(mode, initialData), [initialData, mode]);
    const form = useForm<StudentFormData>(initialFormData);
    const activeTabIndex = formTabs.findIndex((tab) => tab.id === activeTab);
    const isFirstTab = activeTabIndex <= 0;
    const isLastTab = activeTabIndex === formTabs.length - 1;
    const hasValidIdentityRequiredFields = Object.keys(identityRequiredErrors(form.data)).length === 0;
    const isEdit = mode === 'edit';
    const initialPhotoUrl = initialData?.photo_url ?? null;
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<null | string>(initialPhotoUrl);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(initialFormData);
        form.clearErrors();
        setActiveTab('identity');
        setPhotoPreviewUrl(initialPhotoUrl);
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (!form.data.photo) {
            setPhotoPreviewUrl(initialPhotoUrl);
            return;
        }

        const objectUrl = URL.createObjectURL(form.data.photo);
        setPhotoPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.photo, initialPhotoUrl, open]);

    useEffect(() => {
        if (form.data.organization_unit_id || !open || isEdit) {
            return;
        }

        const defaultUnitId = defaultTrainingUnitId ?? (trainingUnitOptions.length === 1 ? trainingUnitOptions[0].id : null);

        if (defaultUnitId) {
            form.setData('organization_unit_id', String(defaultUnitId));
        }
    }, [defaultTrainingUnitId, form, isEdit, open, trainingUnitOptions]);

    const hasIdentityDraft = () => Boolean(form.data.name.trim() || form.data.identity_number.trim());

    const resetForm = () => {
        form.setData(initialFormData);
        form.clearErrors();
        setActiveTab('identity');
        onClose();
    };

    const closeModal = async () => {
        if (form.processing) {
            return;
        }

        if (!isEdit && hasIdentityDraft()) {
            const result = await confirmAction({
                title: 'Batalkan tambah siswa?',
                text: 'Nama atau NIK yang sudah diisi akan dibuang.',
                confirmButtonText: 'Ya, batalkan',
                cancelButtonText: 'Lanjut isi',
                variant: 'danger',
            });

            if (!result.isConfirmed) {
                return;
            }
        }

        resetForm();
    };

    const validateIdentityBeforeLeaving = () => {
        const frontendErrors = identityRequiredErrors(form.data);

        if (Object.keys(frontendErrors).length === 0) {
            return true;
        }

        form.setError(frontendErrors);
        setActiveTab('identity');
        return false;
    };

    const goToNextTab = () => {
        if (activeTab === 'identity' && !validateIdentityBeforeLeaving()) {
            return;
        }

        setActiveTab(formTabs[Math.min(activeTabIndex + 1, formTabs.length - 1)].id);
    };

    const goToPreviousTab = () => {
        setActiveTab(formTabs[Math.max(activeTabIndex - 1, 0)].id);
    };

    const handleTabClick = (tabId: FormTab) => {
        if (tabId !== 'identity' && !validateIdentityBeforeLeaving()) {
            return;
        }

        setActiveTab(tabId);
    };

    const normalizeTextField = (field: keyof Pick<StudentFormData, 'address' | 'birth_place' | 'father_or_guardian_name' | 'name' | 'occupation'>) => {
        form.setData(field, capitalizeWords(form.data[field]));
    };

    const saveForm = async () => {
        const normalizedData = {
            ...form.data,
            address: capitalizeWords(form.data.address),
            birth_place: capitalizeWords(form.data.birth_place),
            father_or_guardian_name: capitalizeWords(form.data.father_or_guardian_name),
            name: capitalizeWords(form.data.name),
            occupation: capitalizeWords(form.data.occupation),
        };

        form.setData(normalizedData);

        const frontendErrors = identityRequiredErrors(normalizedData);

        if (Object.keys(frontendErrors).length > 0) {
            form.setError(frontendErrors);
            setActiveTab(firstErrorTab(frontendErrors));
            return;
        }

        const result = await confirmAction({
            title: isEdit ? 'Simpan perubahan siswa?' : 'Simpan data siswa?',
            text: isEdit ? 'Data siswa akan diperbarui.' : 'Pastikan data siswa sudah benar sebelum disimpan.',
            confirmButtonText: 'Ya, simpan',
            cancelButtonText: isEdit ? 'Batal' : 'Periksa lagi',
            variant: 'primary',
        });

        if (!result.isConfirmed) {
            return;
        }

        form.transform(() => normalizedData);
        form.post(submitUrl, {
            forceFormData: true,
            onSuccess: () => {
                resetForm();
                showToast({ title: isEdit ? 'Data siswa berhasil diperbarui.' : 'Data siswa berhasil ditambahkan.' });
            },
            onError: (errors: StudentFormErrors) => {
                setActiveTab(firstErrorTab(errors));

                showToast({
                    title: errors.identity_number ?? 'Data siswa gagal disimpan. Periksa kembali isian yang masih bermasalah.',
                    icon: 'error',
                });
            },
        });
    };

    return (
        <Modal
            footer={
                <>
                    {!isFirstTab ? (
                        <Button disabled={form.processing} icon={<ChevronLeft className="h-4 w-4" />} onClick={goToPreviousTab} size="md" variant="outline">
                            Sebelumnya
                        </Button>
                    ) : (
                        <Button disabled={form.processing} onClick={closeModal} size="md" variant="outline">
                            Batal
                        </Button>
                    )}
                    {isLastTab ? (
                        <Button className="bg-slate-800 text-white hover:bg-slate-700" isLoading={form.processing} onClick={saveForm} size="md" type="button">
                            {isEdit ? 'Simpan Perubahan' : 'Simpan Siswa'}
                        </Button>
                    ) : (
                        <Button className="bg-slate-800 text-white hover:bg-slate-700" onClick={goToNextTab} size="md" type="button">
                            Selanjutnya
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </>
            }
            headerMiddle={
                <div className="flex max-w-full items-center justify-start gap-4 overflow-x-auto px-1 sm:max-w-none sm:justify-center sm:gap-6">
                    {formTabs.map((tab) => {
                        const hasError = formTabFields[tab.id].some((field) => Boolean(form.errors[field]));
                        const isLocked = tab.id !== 'identity' && !hasValidIdentityRequiredFields;

                        return (
                            <button
                                aria-disabled={isLocked}
                                className={`shrink-0 whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-semibold transition ${
                                    isLocked ? 'cursor-not-allowed border-transparent text-zinc-300' : tabClassName(activeTab === tab.id)
                                }`}
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                type="button"
                            >
                                {tab.label}
                                {hasError ? <span className="ml-2 inline-block size-2 rounded-full bg-brand-red align-middle" /> : null}
                            </button>
                        );
                    })}
                </div>
            }
            onClose={closeModal}
            open={open}
            size="full"
            title={isEdit ? 'Edit Siswa' : 'Tambah Siswa'}
        >
            <form className="mx-auto w-full max-w-5xl space-y-5" onSubmit={(event) => event.preventDefault()}>
                {activeTab === 'identity' ? (
                    <section className="space-y-4">
                        <div className="border-b border-zinc-200 pb-3">
                            <h3 className="text-base font-bold text-brand-yellow-dark">Data Diri Siswa</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="ml-0.5 block text-xs font-medium text-zinc-700" htmlFor="student-photo">
                                {isEdit ? 'Ganti Foto Siswa (Opsional)' : 'Foto Siswa (Opsional)'}
                            </label>
                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                                <label
                                    className="group relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-brand-yellow hover:bg-brand-yellow/10"
                                    htmlFor="student-photo"
                                >
                                    {photoPreviewUrl ? (
                                        <img alt="Preview foto siswa" className="h-full w-full object-cover" src={photoPreviewUrl} />
                                    ) : (
                                        <UserRound className="h-12 w-12 text-zinc-400 transition group-hover:text-brand-yellow-dark" />
                                    )}
                                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-center text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                                        Pilih Foto
                                    </span>
                                </label>
                                <div className="space-y-1 text-sm text-zinc-600">
                                    <p>Maksimal 5MB.</p>
                                    {form.errors.photo ? <p className="text-[10px] font-medium text-brand-red md:text-xs">{form.errors.photo}</p> : null}
                                </div>
                            </div>
                            <input
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="sr-only"
                                id="student-photo"
                                name="photo"
                                onChange={(event) => form.setData('photo', event.target.files?.[0] ?? null)}
                                type="file"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="text-sm font-semibold text-zinc-800">Kewarganegaraan</div>
                            <div className="flex flex-wrap gap-5">
                                {citizenshipOptions.map((option) => {
                                    const isChecked = form.data.citizenship === option;

                                    return (
                                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700" key={option}>
                                            <span className="relative flex size-5 items-center justify-center">
                                                <input
                                                    checked={isChecked}
                                                    className="peer sr-only"
                                                    name="citizenship"
                                                    onChange={() => form.setData('citizenship', option)}
                                                    type="radio"
                                                    value={option}
                                                />
                                                <span className="absolute inset-0 rounded-full border-2 border-zinc-400 bg-white transition peer-checked:border-brand-yellow-dark peer-focus-visible:ring-2 peer-focus-visible:ring-brand-yellow/40" />
                                                <span className="absolute size-2.5 rounded-full bg-brand-yellow-dark opacity-0 transition peer-checked:opacity-100" />
                                            </span>
                                            {option === 'WNI' ? 'WNI (Indonesia)' : 'WNA (Asing)'}
                                        </label>
                                    );
                                })}
                            </div>
                            {form.errors.citizenship ? <p className="ml-1 text-[10px] font-medium text-brand-red md:text-xs">{form.errors.citizenship}</p> : null}
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Input
                                error={form.errors.name}
                                label="Nama Lengkap"
                                name="name"
                                onChange={(event) => {
                                    form.setData('name', event.target.value);
                                    form.clearErrors('name');
                                }}
                                onBlur={() => normalizeTextField('name')}
                                placeholder="Sesuai identitas..."
                                requiredNote="*wajib diisi"
                                value={form.data.name}
                            />
                            <Input
                                error={form.errors.identity_number}
                                inputMode="numeric"
                                label="Nomor Identitas (KTP/KK)"
                                maxLength={16}
                                name="identity_number"
                                onChange={(event) => {
                                    form.setData('identity_number', numericOnly(event.target.value).slice(0, 16));
                                    form.clearErrors('identity_number');
                                }}
                                pattern="[0-9]*"
                                placeholder="16 Digit NIK..."
                                requiredNote="*wajib diisi"
                                value={form.data.identity_number}
                            />
                            <Input
                                error={form.errors.birth_place}
                                label="Tempat Lahir"
                                name="birth_place"
                                onBlur={() => normalizeTextField('birth_place')}
                                onChange={(event) => form.setData('birth_place', event.target.value)}
                                value={form.data.birth_place}
                            />
                            <Input error={form.errors.birth_date} label="Tanggal Lahir" name="birth_date" onChange={(event) => form.setData('birth_date', event.target.value)} type="date" value={form.data.birth_date} />
                            <Select error={form.errors.gender} label="Jenis Kelamin" name="gender" onChange={(event) => form.setData('gender', event.target.value as StudentGender)} value={form.data.gender}>
                                {genderOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                            <Select error={form.errors.religion} label="Agama" name="religion" onChange={(event) => form.setData('religion', event.target.value)} value={form.data.religion}>
                                {religionOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </section>
                ) : null}

                {activeTab === 'contact' ? (
                    <section className="space-y-4">
                        <div className="border-b border-zinc-200 pb-3">
                            <h3 className="text-base font-bold text-brand-yellow-dark">Kontak & Wali</h3>
                        </div>
                        <Textarea
                            error={form.errors.address}
                            label="Alamat Lengkap"
                            name="address"
                            onBlur={() => normalizeTextField('address')}
                            onChange={(event) => form.setData('address', event.target.value)}
                            placeholder="Jalan, RT/RW, Desa, Kecamatan, Kota..."
                            value={form.data.address}
                        />

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Input
                                error={form.errors.occupation}
                                label="Pekerjaan"
                                name="occupation"
                                onBlur={() => normalizeTextField('occupation')}
                                onChange={(event) => form.setData('occupation', event.target.value)}
                                value={form.data.occupation}
                            />
                            <div className="w-full space-y-1.5">
                                <label className="ml-0.5 block text-xs font-medium text-zinc-700" htmlFor="student-phone">
                                    No HP / WA
                                </label>
                                <div
                                    className={`flex overflow-hidden rounded border bg-white transition-all focus-within:ring-1 focus-within:ring-brand-yellow/30 ${
                                        form.errors.phone ? 'border-brand-red bg-red-50' : 'border-zinc-200'
                                    }`}
                                >
                                    <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700">+62</span>
                                    <input
                                        className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-brand-black outline-none placeholder:text-zinc-400"
                                        id="student-phone"
                                        inputMode="numeric"
                                        name="phone"
                                        onChange={(event) => form.setData('phone', numericOnly(event.target.value))}
                                        pattern="[0-9]*"
                                        placeholder="81200001001"
                                        type="text"
                                        value={form.data.phone}
                                    />
                                </div>
                                {form.errors.phone ? <p className="ml-1 mt-1 text-[10px] font-medium text-brand-red md:text-xs">{form.errors.phone}</p> : null}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Input
                                error={form.errors.father_or_guardian_name}
                                label="Nama Ayah / Wali"
                                name="father_or_guardian_name"
                                onBlur={() => normalizeTextField('father_or_guardian_name')}
                                onChange={(event) => form.setData('father_or_guardian_name', event.target.value)}
                                placeholder="Nama Orang Tua..."
                                value={form.data.father_or_guardian_name}
                            />
                        </div>
                    </section>
                ) : null}

                {activeTab === 'membership' ? (
                    <section className="space-y-4">
                        <div className="border-b border-zinc-200 pb-3">
                            <h3 className="text-base font-bold text-brand-yellow-dark">Data Keanggotaan</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Select error={form.errors.organization_unit_id} label="Unit Latihan" name="organization_unit_id" onChange={(event) => form.setData('organization_unit_id', event.target.value)} value={form.data.organization_unit_id}>
                                <option value="">Pilih unit latihan</option>
                                {trainingUnitOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </Select>
                            <Input error={form.errors.joined_at} label="Tanggal Gabung" name="joined_at" onChange={(event) => form.setData('joined_at', event.target.value)} type="date" value={form.data.joined_at} />
                            <Select error={form.errors.belt} label="Sabuk Sekarang" name="belt" onChange={(event) => form.setData('belt', event.target.value as StudentBelt)} value={form.data.belt}>
                                {beltOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                            <Select error={form.errors.status} label="Status Siswa" name="status" onChange={(event) => form.setData('status', event.target.value as StudentStatus)} value={form.data.status}>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                    </section>
                ) : null}
            </form>
        </Modal>
    );
}
