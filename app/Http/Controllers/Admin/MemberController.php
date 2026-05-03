<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\OrganizationUnit;
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

class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('member.view'), 403);

        $unitIds = $this->visibleUnitIds($request);
        $filters = [
            'page' => max(1, (int) $request->integer('page', 1)),
            'per_page' => in_array($request->integer('per_page', 10), [10, 20, 50], true) ? $request->integer('per_page', 10) : 10,
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($request->query('status'), ['active', 'inactive', 'transferred', 'deceased'], true) ? $request->query('status') : 'all',
            'unit' => $request->filled('unit') ? (string) $request->query('unit') : 'all',
        ];

        $members = Member::query()
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
                        ->orWhereRaw('LOWER(member_number) LIKE ?', [$keyword])
                        ->orWhereRaw('LOWER(identity_number) LIKE ?', [$keyword])
                        ->orWhereHas('organizationUnit', fn ($organizationUnitQuery) => $organizationUnitQuery->whereRaw('LOWER(name) LIKE ?', [$keyword]));
                });
            })
            ->orderBy('name')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('Admin/MasterData/Warga/Index', [
            'defaultOrganizationUnitId' => $this->defaultOrganizationUnitId($request, $unitIds),
            'filters' => $filters,
            'members' => [
                'currentPage' => $members->currentPage(),
                'data' => $members->getCollection()->map(fn (Member $member) => [
                    'address' => $member->address,
                    'birthDate' => $this->formatDate($member->birth_date),
                    'birthDateValue' => $member->birth_date?->format('Y-m-d') ?? '',
                    'birthPlace' => $member->birth_place,
                    'citizenship' => $member->citizenship,
                    'gender' => $member->gender,
                    'id' => $member->id,
                    'identityNumber' => $member->identity_number,
                    'identityType' => $member->identity_type,
                    'legalizationPlace' => $member->legalization_place,
                    'legalizedAt' => $this->formatDate($member->legalized_at),
                    'legalizedAtValue' => $member->legalized_at?->format('Y-m-d') ?? '',
                    'memberNumber' => $member->member_number,
                    'name' => $member->name,
                    'occupation' => $member->occupation,
                    'organizationUnit' => $member->organizationUnit?->name ?? '-',
                    'phone' => $member->phone,
                    'photoUrl' => $member->photo_url,
                    'ranting' => $member->ranting?->name ?? $member->organizationUnit?->name ?? '-',
                    'religion' => $member->religion,
                    'status' => $member->status,
                ])->values(),
                'perPage' => $members->perPage(),
                'total' => $members->total(),
                'totalPages' => $members->lastPage(),
            ],
            'organizationUnitOptions' => $this->organizationUnitOptions($unitIds),
        ]);
    }

    public function show(Request $request, Member $member): Response
    {
        abort_unless($request->user()?->can('member.view'), 403);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($member->organization_unit_id, $unitIds, true)) {
            abort(403);
        }

        $member->load(['organizationUnit', 'ranting']);

        return Inertia::render('Admin/MasterData/Warga/Show', [
            'member' => [
                'address' => $member->address,
                'birthDate' => $this->formatDate($member->birth_date),
                'birthDateValue' => $member->birth_date?->format('Y-m-d') ?? '',
                'birthPlace' => $member->birth_place,
                'citizenship' => $member->citizenship,
                'gender' => $member->gender,
                'id' => $member->id,
                'identityNumber' => $member->identity_number,
                'identityType' => $member->identity_type,
                'legalizationPlace' => $member->legalization_place,
                'legalizedAt' => $this->formatDate($member->legalized_at),
                'legalizedAtValue' => $member->legalized_at?->format('Y-m-d') ?? '',
                'memberNumber' => $member->member_number,
                'name' => $member->name,
                'occupation' => $member->occupation,
                'organizationUnit' => $member->organizationUnit?->name ?? '-',
                'organizationUnitId' => $member->organization_unit_id,
                'phone' => $member->phone,
                'photoUrl' => $member->photo_url,
                'ranting' => $member->ranting?->name ?? '-',
                'religion' => $member->religion,
                'status' => $member->status,
            ],
            'organizationUnitOptions' => $this->organizationUnitOptions($unitIds),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('member.create'), 403);

        $this->normalizeRequest($request);

        $unitIds = $this->visibleUnitIds($request);
        $validated = $this->validatedMemberData($request);

        if ($unitIds !== null && ! in_array((int) $validated['organization_unit_id'], $unitIds, true)) {
            abort(403);
        }

        $organizationUnit = OrganizationUnit::query()->findOrFail($validated['organization_unit_id']);
        $photoPath = $request->hasFile('photo') ? $this->storeCompressedPhoto($request, $validated['member_number']) : null;

        Member::query()->create($this->memberAttributes($validated, $organizationUnit, $photoPath));

        return back()->with('success', 'Data warga berhasil ditambahkan.');
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        abort_unless($request->user()?->can('member.update'), 403);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($member->organization_unit_id, $unitIds, true)) {
            abort(403);
        }

        $this->normalizeRequest($request);

        $validated = $this->validatedMemberData($request, $member);

        if ($unitIds !== null && ! in_array((int) $validated['organization_unit_id'], $unitIds, true)) {
            abort(403);
        }

        $organizationUnit = OrganizationUnit::query()->findOrFail($validated['organization_unit_id']);
        $photoPath = $member->photo_path;

        if ($request->hasFile('photo')) {
            $photoPath = $this->storeCompressedPhoto($request, $validated['member_number']);

            if ($member->photo_path) {
                Storage::disk('public')->delete($member->photo_path);
            }
        }

        $member->update($this->memberAttributes($validated, $organizationUnit, $photoPath));

        return back()->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy(Request $request, Member $member): RedirectResponse
    {
        abort_unless($this->canDeleteMember($request), 403);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($member->organization_unit_id, $unitIds, true)) {
            abort(403);
        }

        if ($member->photo_path) {
            Storage::disk('public')->delete($member->photo_path);
        }

        $member->delete();

        return redirect()->route('admin.master-data.warga')->with('success', 'Data warga berhasil dihapus.');
    }

    private function canDeleteMember(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        if ($user->can('member.delete')) {
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
    private function organizationUnitOptions(?array $unitIds): array
    {
        return OrganizationUnit::query()
            ->when($unitIds !== null, fn ($query) => $query->whereIn('id', $unitIds))
            ->whereIn('type', ['cabang', 'ranting', 'rayon', 'sub_rayon', 'komisariat'])
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
    private function defaultOrganizationUnitId(Request $request, ?array $unitIds): ?int
    {
        $unit = $request->user()?->organizationUnit;

        if (! $unit || ! in_array($unit->type, ['cabang', 'ranting', 'rayon', 'sub_rayon', 'komisariat'], true)) {
            return null;
        }

        if ($unitIds !== null && ! in_array($unit->id, $unitIds, true)) {
            return null;
        }

        return $unit->id;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedMemberData(Request $request, ?Member $member = null): array
    {
        $memberNumberRule = Rule::unique('members', 'member_number');
        $identityNumberRule = Rule::unique('members', 'identity_number');

        if ($member) {
            $memberNumberRule->ignore($member->id);
            $identityNumberRule->ignore($member->id);
        }

        return $request->validate(
            [
                'organization_unit_id' => ['required', 'integer', 'exists:organization_units,id'],
                'citizenship' => ['required', 'in:WNI,WNA'],
                'identity_number' => ['nullable', 'digits:16', $identityNumberRule],
                'member_number' => ['required', 'string', 'max:64', $memberNumberRule],
                'name' => ['required', 'string', 'max:255'],
                'birth_place' => ['nullable', 'string', 'max:255'],
                'birth_date' => ['nullable', 'date'],
                'gender' => ['required', 'in:Laki-laki,Perempuan'],
                'religion' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
                'occupation' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'digits_between:8,15'],
                'legalized_at' => ['nullable', 'date'],
                'legalization_place' => ['nullable', 'string', 'max:255'],
                'status' => ['required', 'in:active,inactive,transferred,deceased'],
                'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
            ],
            [
                'member_number.required' => 'NIW wajib diisi.',
                'member_number.unique' => 'NIW sudah terdaftar.',
                'identity_number.digits' => 'NIK harus terdiri dari 16 digit.',
                'identity_number.unique' => 'NIK sudah terdaftar.',
                'name.required' => 'Nama lengkap wajib diisi.',
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function memberAttributes(array $validated, OrganizationUnit $organizationUnit, ?string $photoPath): array
    {
        return [
            'organization_unit_id' => $organizationUnit->id,
            'ranting_id' => $this->rantingIdFor($organizationUnit),
            'citizenship' => $validated['citizenship'],
            'identity_type' => 'KTP/KK',
            'identity_number' => $validated['identity_number'] ?? null,
            'member_number' => $validated['member_number'],
            'name' => $validated['name'],
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'],
            'religion' => $validated['religion'] ?? null,
            'address' => $validated['address'] ?? null,
            'occupation' => $validated['occupation'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'legalized_at' => $validated['legalized_at'] ?? null,
            'legalization_place' => $validated['legalization_place'] ?? null,
            'status' => $validated['status'],
            'photo_path' => $photoPath,
        ];
    }

    private function normalizeRequest(Request $request): void
    {
        $identityNumber = preg_replace('/\D/', '', (string) $request->input('identity_number', ''));
        $phone = preg_replace('/\D/', '', (string) $request->input('phone', ''));

        $request->merge([
            'identity_number' => $identityNumber !== '' ? $identityNumber : null,
            'member_number' => Str::upper(trim((string) $request->input('member_number', ''))),
            'phone' => $phone !== '' ? $phone : null,
        ]);
    }

    /**
     * @throws ValidationException
     */
    private function storeCompressedPhoto(Request $request, string $memberNumber): string
    {
        $file = $request->file('photo');

        if (! $file) {
            throw ValidationException::withMessages([
                'photo' => 'Foto warga wajib berupa gambar yang valid.',
            ]);
        }

        $source = $this->imageResourceFromPath($file->getRealPath(), $file->getMimeType());

        if (! $source) {
            throw ValidationException::withMessages([
                'photo' => 'Foto warga tidak dapat diproses.',
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
                'photo' => 'Foto warga gagal dikompres di bawah 300KB.',
            ]);
        }

        $path = 'members/'.Str::slug($memberNumber).'-'.Str::random(8).'.jpg';
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
