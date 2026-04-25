<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationUnit;
use App\Models\Student;
use App\Support\AdminAccess;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('student.view'), 403);

        $unitIds = $this->visibleUnitIds($request);
        $filters = [
            'page' => max(1, (int) $request->integer('page', 1)),
            'per_page' => in_array($request->integer('per_page', 10), [10, 20, 50], true) ? $request->integer('per_page', 10) : 10,
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($request->query('status'), ['active', 'inactive', 'graduated', 'transferred'], true) ? $request->query('status') : 'all',
            'unit' => $request->filled('unit') ? (string) $request->query('unit') : 'all',
        ];

        $students = Student::query()
            ->with(['organizationUnit', 'ranting'])
            ->when($unitIds !== null, fn ($query) => $query->whereIn('organization_unit_id', $unitIds))
            ->when(
                $filters['status'] !== 'all',
                fn ($query) => $query->where('status', $filters['status']),
            )
            ->when(
                $filters['unit'] !== 'all',
                fn ($query) => $query->where('organization_unit_id', (int) $filters['unit']),
            )
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $keyword = '%'.Str::lower($filters['search']).'%';

                $query->where(function ($nestedQuery) use ($keyword) {
                    $nestedQuery
                        ->whereRaw('LOWER(name) LIKE ?', [$keyword])
                        ->orWhereRaw('LOWER(identity_number) LIKE ?', [$keyword])
                        ->orWhereRaw('LOWER(belt) LIKE ?', [$keyword])
                        ->orWhereHas('organizationUnit', fn ($organizationUnitQuery) => $organizationUnitQuery->whereRaw('LOWER(name) LIKE ?', [$keyword]));
                });
            })
            ->orderBy('name')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('Admin/MasterData/Siswa/Index', [
            'defaultTrainingUnitId' => $this->defaultTrainingUnitId($request, $unitIds),
            'filters' => $filters,
            'students' => [
                'currentPage' => $students->currentPage(),
                'data' => $students->getCollection()->map(fn (Student $student) => [
                    'address' => $student->address,
                    'belt' => $student->belt,
                    'birthDate' => $this->formatDate($student->birth_date),
                    'birthDateValue' => $student->birth_date?->format('Y-m-d') ?? '',
                    'birthPlace' => $student->birth_place,
                    'citizenship' => $student->citizenship,
                    'fatherOrGuardianName' => $student->father_or_guardian_name,
                    'gender' => $student->gender,
                    'identityType' => $student->identity_type,
                    'joinedAt' => $this->formatDate($student->joined_at),
                    'id' => $student->id,
                    'name' => $student->name,
                    'nik' => $student->identity_number,
                    'occupation' => $student->occupation,
                    'phone' => $student->phone,
                    'photoUrl' => $student->photo_url,
                    'ranting' => $student->ranting?->name ?? $student->organizationUnit?->name ?? '-',
                    'religion' => $student->religion,
                    'status' => $student->status,
                    'trainingUnit' => $student->organizationUnit?->name ?? '-',
                ])->values(),
                'perPage' => $students->perPage(),
                'total' => $students->total(),
                'totalPages' => $students->lastPage(),
            ],
            'trainingUnitOptions' => $this->trainingUnitOptions($unitIds),
        ]);
    }

    public function show(Request $request, Student $student): Response
    {
        abort_unless($request->user()?->can('student.view'), 403);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($student->organization_unit_id, $unitIds, true)) {
            abort(403);
        }

        $student->load(['organizationUnit', 'ranting']);

        return Inertia::render('Admin/MasterData/Siswa/Show', [
            'student' => [
                'address' => $student->address,
                'belt' => $student->belt,
                'birthDate' => $this->formatDate($student->birth_date),
                'birthDateValue' => $student->birth_date?->format('Y-m-d') ?? '',
                'birthPlace' => $student->birth_place,
                'citizenship' => $student->citizenship,
                'fatherOrGuardianName' => $student->father_or_guardian_name,
                'gender' => $student->gender,
                'id' => $student->id,
                'identityNumber' => $student->identity_number,
                'identityType' => $student->identity_type,
                'joinedAt' => $this->formatDate($student->joined_at),
                'joinedAtValue' => $student->joined_at?->format('Y-m-d') ?? '',
                'name' => $student->name,
                'occupation' => $student->occupation,
                'organizationUnitId' => $student->organization_unit_id,
                'phone' => $student->phone,
                'photoUrl' => $student->photo_url,
                'ranting' => $student->ranting?->name ?? '-',
                'religion' => $student->religion,
                'status' => $student->status,
                'trainingUnit' => $student->organizationUnit?->name ?? '-',
            ],
            'trainingUnitOptions' => $this->trainingUnitOptions($unitIds),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('student.create'), 403);

        $unitIds = $this->visibleUnitIds($request);

        $validated = $request->validate(
            [
                'organization_unit_id' => ['required', 'integer', 'exists:organization_units,id'],
                'citizenship' => ['required', 'in:WNI,WNA'],
                'identity_number' => ['required', 'digits:16', 'unique:students,identity_number'],
                'name' => ['required', 'string', 'max:255'],
                'birth_place' => ['nullable', 'string', 'max:255'],
                'birth_date' => ['nullable', 'date'],
                'gender' => ['required', 'in:Laki-laki,Perempuan'],
                'religion' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
                'occupation' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'digits_between:8,15'],
                'father_or_guardian_name' => ['nullable', 'string', 'max:255'],
                'belt' => ['required', 'in:Polos,Jambon,Hijau,Putih'],
                'status' => ['required', 'in:active,inactive,graduated,transferred'],
                'joined_at' => ['nullable', 'date'],
                'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
            ],
            [
                'identity_number.required' => 'NIK wajib diisi.',
                'identity_number.digits' => 'NIK harus terdiri dari 16 digit.',
                'identity_number.unique' => 'NIK sudah terdaftar.',
                'name.required' => 'Nama lengkap wajib diisi.',
            ],
        );

        if ($unitIds !== null && ! in_array((int) $validated['organization_unit_id'], $unitIds, true)) {
            abort(403);
        }

        $organizationUnit = OrganizationUnit::query()->findOrFail($validated['organization_unit_id']);
        $photoPath = $request->hasFile('photo') ? $this->storeCompressedPhoto($request, $validated['identity_number']) : null;

        Student::query()->create([
            'organization_unit_id' => $organizationUnit->id,
            'ranting_id' => $this->rantingIdFor($organizationUnit),
            'citizenship' => $validated['citizenship'],
            'identity_type' => 'KTP/KK',
            'identity_number' => $validated['identity_number'],
            'name' => $validated['name'],
            'birth_place' => $validated['birth_place'],
            'birth_date' => $validated['birth_date'],
            'gender' => $validated['gender'],
            'religion' => $validated['religion'],
            'address' => $validated['address'],
            'occupation' => $validated['occupation'],
            'phone' => $validated['phone'],
            'father_or_guardian_name' => $validated['father_or_guardian_name'],
            'belt' => $validated['belt'],
            'status' => $validated['status'],
            'joined_at' => $validated['joined_at'],
            'photo_path' => $photoPath,
        ]);

        return back()->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        abort_unless($request->user()?->can('student.update'), 403);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($student->organization_unit_id, $unitIds, true)) {
            abort(403);
        }

        $validated = $request->validate(
            [
                'organization_unit_id' => ['required', 'integer', 'exists:organization_units,id'],
                'citizenship' => ['required', 'in:WNI,WNA'],
                'identity_number' => ['required', 'digits:16', Rule::unique('students', 'identity_number')->ignore($student->id)],
                'name' => ['required', 'string', 'max:255'],
                'birth_place' => ['nullable', 'string', 'max:255'],
                'birth_date' => ['nullable', 'date'],
                'gender' => ['required', 'in:Laki-laki,Perempuan'],
                'religion' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
                'occupation' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'digits_between:8,15'],
                'father_or_guardian_name' => ['nullable', 'string', 'max:255'],
                'belt' => ['required', 'in:Polos,Jambon,Hijau,Putih'],
                'status' => ['required', 'in:active,inactive,graduated,transferred'],
                'joined_at' => ['nullable', 'date'],
                'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
            ],
            [
                'identity_number.required' => 'NIK wajib diisi.',
                'identity_number.digits' => 'NIK harus terdiri dari 16 digit.',
                'identity_number.unique' => 'NIK sudah terdaftar.',
                'name.required' => 'Nama lengkap wajib diisi.',
            ],
        );

        if ($unitIds !== null && ! in_array((int) $validated['organization_unit_id'], $unitIds, true)) {
            abort(403);
        }

        $organizationUnit = OrganizationUnit::query()->findOrFail($validated['organization_unit_id']);
        $photoPath = $student->photo_path;

        if ($request->hasFile('photo')) {
            $photoPath = $this->storeCompressedPhoto($request, $validated['identity_number']);

            if ($student->photo_path) {
                Storage::disk('public')->delete($student->photo_path);
            }
        }

        $student->update([
            'organization_unit_id' => $organizationUnit->id,
            'ranting_id' => $this->rantingIdFor($organizationUnit),
            'citizenship' => $validated['citizenship'],
            'identity_type' => 'KTP/KK',
            'identity_number' => $validated['identity_number'],
            'name' => $validated['name'],
            'birth_place' => $validated['birth_place'],
            'birth_date' => $validated['birth_date'],
            'gender' => $validated['gender'],
            'religion' => $validated['religion'],
            'address' => $validated['address'],
            'occupation' => $validated['occupation'],
            'phone' => $validated['phone'],
            'father_or_guardian_name' => $validated['father_or_guardian_name'],
            'belt' => $validated['belt'],
            'status' => $validated['status'],
            'joined_at' => $validated['joined_at'],
            'photo_path' => $photoPath,
        ]);

        return back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Request $request, Student $student): RedirectResponse
    {
        abort_unless($this->canDeleteStudent($request), 403);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($student->organization_unit_id, $unitIds, true)) {
            abort(403);
        }

        if ($student->photo_path) {
            Storage::disk('public')->delete($student->photo_path);
        }

        $student->delete();

        return redirect()->route('admin.master-data.siswa')->with('success', 'Data siswa berhasil dihapus.');
    }

    private function canDeleteStudent(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        if ($user->can('student.delete')) {
            return true;
        }

        return $user->hasRole([
            'super_admin',
            'admin_pusat',
            'admin_cabang',
            'admin_ranting',
            'admin_rayon',
            'admin_sub_rayon',
            'admin_komisariat',
        ]);
    }

    /**
     * @return array<int>|null
     */
    private function visibleUnitIds(Request $request): ?array
    {
        $user = $request->user();

        if (! $user || $user->hasRole('super_admin')) {
            return null;
        }

        if (AdminAccess::defaultDashboardScope($user) === 'pusat') {
            return null;
        }

        $unit = $user->organizationUnit;

        return $unit ? $unit->visibleUnitIds() : [];
    }

    private function formatDate(?CarbonInterface $date): string
    {
        if (! $date) {
            return '-';
        }

        $months = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        return $date->format('d').' '.$months[(int) $date->format('n')].' '.$date->format('Y');
    }

    /**
     * @param  array<int>|null  $unitIds
     * @return array<int, array{id: int, name: string}>
     */
    private function trainingUnitOptions(?array $unitIds): array
    {
        return OrganizationUnit::query()
            ->when($unitIds !== null, fn ($query) => $query->whereIn('id', $unitIds))
            ->whereIn('type', ['ranting', 'rayon', 'sub_rayon', 'komisariat'])
            ->orderBy('type')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (OrganizationUnit $unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
            ])
            ->values()
            ->all();
    }

    private function rantingIdFor(OrganizationUnit $unit): ?int
    {
        if ($unit->type === 'ranting') {
            return $unit->id;
        }

        $unit->loadMissing('parent.parent');

        if ($unit->parent?->type === 'ranting') {
            return $unit->parent->id;
        }

        if ($unit->parent?->parent?->type === 'ranting') {
            return $unit->parent->parent->id;
        }

        return null;
    }

    /**
     * @param  array<int>|null  $unitIds
     */
    private function defaultTrainingUnitId(Request $request, ?array $unitIds): ?int
    {
        $unit = $request->user()?->organizationUnit;

        if (! $unit || ! in_array($unit->type, ['ranting', 'rayon', 'sub_rayon', 'komisariat'], true)) {
            return null;
        }

        if ($unitIds !== null && ! in_array($unit->id, $unitIds, true)) {
            return null;
        }

        return $unit->id;
    }

    /**
     * @throws ValidationException
     */
    private function storeCompressedPhoto(Request $request, string $identityNumber): string
    {
        $file = $request->file('photo');

        if (! $file) {
            throw ValidationException::withMessages([
                'photo' => 'Foto siswa wajib berupa gambar yang valid.',
            ]);
        }

        $source = $this->imageResourceFromPath($file->getRealPath(), $file->getMimeType());

        if (! $source) {
            throw ValidationException::withMessages([
                'photo' => 'Foto siswa tidak dapat diproses.',
            ]);
        }

        if ($file->getMimeType() === 'image/jpeg') {
            $orientedSource = $this->applyJpegOrientation($source, $file->getRealPath());

            if ($orientedSource !== $source) {
                imagedestroy($source);
                $source = $orientedSource;
            }
        }

        $contents = $this->compressedJpegContents($source);
        imagedestroy($source);

        if (! $contents) {
            throw ValidationException::withMessages([
                'photo' => 'Foto siswa gagal dikompres di bawah 300KB.',
            ]);
        }

        $path = 'students/'.Str::slug($identityNumber).'-'.Str::random(8).'.jpg';
        Storage::disk('public')->put($path, $contents);

        return $path;
    }

    private function imageResourceFromPath(string $path, string $mimeType): \GdImage|false
    {
        return match ($mimeType) {
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/png' => imagecreatefrompng($path),
            'image/gif' => imagecreatefromgif($path),
            'image/webp' => imagecreatefromwebp($path),
            default => false,
        };
    }

    private function compressedJpegContents(\GdImage $source): string|false
    {
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $maxBytes = 300 * 1024;
        $maxSize = 1200;
        $minSize = 360;

        while ($maxSize >= $minSize) {
            $scale = min(1, $maxSize / max($sourceWidth, $sourceHeight));
            $targetWidth = max(1, (int) round($sourceWidth * $scale));
            $targetHeight = max(1, (int) round($sourceHeight * $scale));
            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);

            imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
            imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $sourceWidth, $sourceHeight);

            foreach ([82, 76, 70, 64, 58, 52] as $quality) {
                ob_start();
                imagejpeg($canvas, null, $quality);
                $contents = ob_get_clean();

                if ($contents && strlen($contents) <= $maxBytes) {
                    imagedestroy($canvas);

                    return $contents;
                }
            }

            imagedestroy($canvas);
            $maxSize = (int) floor($maxSize * 0.8);
        }

        return false;
    }

    private function applyJpegOrientation(\GdImage $source, string $path): \GdImage
    {
        $exif = function_exists('exif_read_data') ? @exif_read_data($path) : false;
        $orientation = is_array($exif) ? ($exif['Orientation'] ?? null) : null;

        return match ($orientation) {
            3 => imagerotate($source, 180, 0),
            6 => imagerotate($source, -90, 0),
            8 => imagerotate($source, 90, 0),
            default => $source,
        };
    }
}
