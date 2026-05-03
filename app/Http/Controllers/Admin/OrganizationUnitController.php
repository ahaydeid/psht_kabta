<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationUnit;
use App\Support\AdminAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationUnitController extends Controller
{
    private const SCOPE_CONFIG = [
        'cabang' => [
            'type' => 'cabang',
            'label' => 'Cabang',
            'parent_type' => 'pusat',
            'parent_label' => 'Pusat',
        ],
        'ranting' => [
            'type' => 'ranting',
            'label' => 'Ranting',
            'parent_type' => 'cabang',
            'parent_label' => 'Cabang',
        ],
        'rayon' => [
            'type' => 'rayon',
            'label' => 'Rayon',
            'parent_type' => 'ranting',
            'parent_label' => 'Ranting',
        ],
        'sub-rayon' => [
            'type' => 'sub_rayon',
            'label' => 'Sub Rayon',
            'parent_type' => 'rayon',
            'parent_label' => 'Rayon',
        ],
        'komisariat' => [
            'type' => 'komisariat',
            'label' => 'Komisariat',
            'parent_type' => 'cabang',
            'parent_label' => 'Cabang',
        ],
    ];

    public function index(Request $request, string $scope): Response
    {
        $this->authorizeScope($request, $scope);

        $config = $this->scopeConfig($scope);
        $unitIds = $this->visibleUnitIds($request);
        $parentOptions = $this->parentOptions($request, $scope, $unitIds);
        $usesListView = $this->hasGlobalOrganizationAccess($request);
        $filters = [
            'page' => max(1, (int) $request->integer('page', 1)),
            'per_page' => in_array($request->integer('per_page', 10), [10, 20, 50], true) ? $request->integer('per_page', 10) : 10,
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($request->query('status'), ['active', 'inactive'], true) ? $request->query('status') : 'all',
        ];

        $unitsQuery = OrganizationUnit::query()
            ->with('parent')
            ->withCount(['children', 'members', 'students', 'users'])
            ->where('type', $config['type'])
            ->when($unitIds !== null, fn ($query) => $query->whereIn('id', $unitIds));

        if ($usesListView) {
            $units = $unitsQuery
                ->when(
                    $filters['status'] !== 'all',
                    fn ($query) => $query->where('is_active', $filters['status'] === 'active'),
                )
                ->when($filters['search'] !== '', function ($query) use ($filters) {
                    $keyword = '%'.strtolower($filters['search']).'%';

                    $query->where(function ($nestedQuery) use ($keyword) {
                        $nestedQuery
                            ->whereRaw('LOWER(name) LIKE ?', [$keyword])
                            ->orWhereRaw('LOWER(code) LIKE ?', [$keyword])
                            ->orWhereRaw('LOWER(phone) LIKE ?', [$keyword])
                            ->orWhereHas('parent', fn ($parentQuery) => $parentQuery->whereRaw('LOWER(name) LIKE ?', [$keyword]));
                    });
                })
                ->orderBy('name')
                ->paginate($filters['per_page'])
                ->withQueryString();

            $unitsPayload = [
                'currentPage' => $units->currentPage(),
                'data' => $units->getCollection()->map(fn (OrganizationUnit $unit) => $this->unitPayload($request, $unit))->values(),
                'perPage' => $units->perPage(),
                'total' => $units->total(),
                'totalPages' => $units->lastPage(),
            ];
        } else {
            $units = $unitsQuery->orderBy('name')->get();

            $unitsPayload = [
                'currentPage' => 1,
                'data' => $units->map(fn (OrganizationUnit $unit) => $this->unitPayload($request, $unit))->values(),
                'perPage' => max(1, $units->count()),
                'total' => $units->count(),
                'totalPages' => 1,
            ];
        }

        return Inertia::render('Admin/Pengaturan/OrganizationUnit/Index', [
            'canCreate' => $usesListView && $this->canCreateScope($request, $scope, $parentOptions),
            'canManage' => AdminAccess::canManageOrganization($request->user()),
            'filters' => $filters,
            'parentLabel' => $config['parent_label'],
            'parentOptions' => $parentOptions,
            'scope' => $scope,
            'scopeLabel' => $config['label'],
            'units' => $unitsPayload,
            'usesListView' => $usesListView,
        ]);
    }

    public function store(Request $request, string $scope): RedirectResponse
    {
        $this->authorizeScope($request, $scope);
        abort_unless($this->canCreateScope($request, $scope, $this->parentOptions($request, $scope, $this->visibleUnitIds($request))), 403);

        $config = $this->scopeConfig($scope);
        $validated = $this->validateOrganizationUnit($request, $config);
        $parentOptions = $this->parentOptions($request, $scope, $this->visibleUnitIds($request));
        $this->authorizeParent((int) $validated['parent_id'], $parentOptions);

        OrganizationUnit::query()->create([
            ...$this->attributes($validated),
            'type' => $config['type'],
        ]);

        return back()->with('success', 'Data '.$config['label'].' berhasil ditambahkan.');
    }

    public function update(Request $request, string $scope, OrganizationUnit $organizationUnit): RedirectResponse
    {
        $this->authorizeScope($request, $scope);
        abort_unless(AdminAccess::canManageOrganization($request->user()), 403);

        $config = $this->scopeConfig($scope);
        $this->authorizeUnit($request, $organizationUnit, $config['type']);

        $validated = $this->validateOrganizationUnit($request, $config, $organizationUnit);
        $parentOptions = $this->parentOptions($request, $scope, $this->visibleUnitIds($request));
        $this->authorizeParent((int) $validated['parent_id'], $parentOptions);

        $organizationUnit->update($this->attributes($validated));

        return back()->with('success', 'Data '.$config['label'].' berhasil diperbarui.');
    }

    public function destroy(Request $request, string $scope, OrganizationUnit $organizationUnit): RedirectResponse
    {
        $this->authorizeScope($request, $scope);
        abort_unless(AdminAccess::canManageOrganization($request->user()), 403);

        $config = $this->scopeConfig($scope);
        $this->authorizeUnit($request, $organizationUnit, $config['type']);
        abort_unless($this->canDeleteUnit($request, $organizationUnit), 403);

        $organizationUnit->delete();

        return back()->with('success', 'Data '.$config['label'].' berhasil dihapus.');
    }

    /**
     * @return array{type: string, label: string, parent_type: string, parent_label: string}
     */
    private function scopeConfig(string $scope): array
    {
        abort_unless(isset(self::SCOPE_CONFIG[$scope]), 404);

        return self::SCOPE_CONFIG[$scope];
    }

    private function authorizeScope(Request $request, string $scope): void
    {
        abort_unless(AdminAccess::canViewOrganization($request->user()), 403);
        abort_unless(AdminAccess::canAccessSettingScope($request->user(), $scope), 403);
    }

    private function authorizeUnit(Request $request, OrganizationUnit $unit, string $type): void
    {
        abort_unless($unit->type === $type, 404);

        $unitIds = $this->visibleUnitIds($request);

        if ($unitIds !== null && ! in_array($unit->id, $unitIds, true)) {
            abort(403);
        }
    }

    /**
     * @param  array<int, array{id: int, name: string}>  $parentOptions
     */
    private function authorizeParent(int $parentId, array $parentOptions): void
    {
        abort_unless(in_array($parentId, array_column($parentOptions, 'id'), true), 403);
    }

    /**
     * @param  array{type: string, label: string, parent_type: string, parent_label: string}  $config
     * @return array<string, mixed>
     */
    private function validateOrganizationUnit(Request $request, array $config, ?OrganizationUnit $unit = null): array
    {
        return $request->validate([
            'parent_id' => [
                'required',
                'integer',
                Rule::exists('organization_units', 'id')->where(fn ($query) => $query->where('type', $config['parent_type'])),
            ],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('organization_units', 'code')->ignore($unit?->id)],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['required', 'boolean'],
        ], [
            'parent_id.required' => $config['parent_label'].' wajib dipilih.',
            'name.required' => 'Nama '.$config['label'].' wajib diisi.',
            'code.unique' => 'Kode unit sudah digunakan.',
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated): array
    {
        return [
            'parent_id' => (int) $validated['parent_id'],
            'name' => $this->nullableString($validated['name'] ?? null),
            'code' => $this->nullableString($validated['code'] ?? null),
            'address' => $this->nullableString($validated['address'] ?? null),
            'phone' => $this->nullableString($validated['phone'] ?? null),
            'is_active' => (bool) $validated['is_active'],
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function unitPayload(Request $request, OrganizationUnit $unit): array
    {
        return [
            'address' => $unit->address,
            'canDelete' => $this->canDeleteUnit($request, $unit),
            'code' => $unit->code,
            'id' => $unit->id,
            'isActive' => (bool) $unit->is_active,
            'name' => $unit->name,
            'parentId' => $unit->parent_id,
            'parentName' => $unit->parent?->name ?? '-',
            'phone' => $unit->phone,
        ];
    }

    /**
     * @return array<int>|null
     */
    private function visibleUnitIds(Request $request): ?array
    {
        $user = $request->user();

        if (! $user || $user->hasRole('super_admin') || AdminAccess::defaultDashboardScope($user) === 'pusat') {
            return null;
        }

        $unit = $user->organizationUnit;

        return $unit ? $unit->visibleUnitIds() : [];
    }

    /**
     * @param  array<int>|null  $visibleUnitIds
     * @return array<int, array{id: int, name: string}>
     */
    private function parentOptions(Request $request, string $scope, ?array $visibleUnitIds): array
    {
        $config = $this->scopeConfig($scope);
        $user = $request->user();
        $userUnit = $user?->organizationUnit;
        $userScope = AdminAccess::normalizedScope($userUnit?->type);

        return OrganizationUnit::query()
            ->where('type', $config['parent_type'])
            ->when(! $this->hasGlobalOrganizationAccess($request), function ($query) use ($scope, $userScope, $userUnit, $visibleUnitIds) {
                if ($userScope === $scope && $userUnit?->parent_id) {
                    $query->where('id', $userUnit->parent_id);

                    return;
                }

                $query->whereIn('id', $visibleUnitIds ?? []);
            })
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (OrganizationUnit $unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array{id: int, name: string}>  $parentOptions
     */
    private function canCreateScope(Request $request, string $scope, array $parentOptions): bool
    {
        if (! AdminAccess::canManageOrganization($request->user()) || count($parentOptions) === 0) {
            return false;
        }

        if ($this->hasGlobalOrganizationAccess($request)) {
            return true;
        }

        $userScope = AdminAccess::normalizedScope($request->user()?->organizationUnit?->type);

        return $userScope !== $scope;
    }

    private function canDeleteUnit(Request $request, OrganizationUnit $unit): bool
    {
        if (! AdminAccess::canManageOrganization($request->user())) {
            return false;
        }

        if ($request->user()?->organization_unit_id === $unit->id) {
            return false;
        }

        if (
            $unit->getAttribute('children_count') === null
            || $unit->getAttribute('members_count') === null
            || $unit->getAttribute('students_count') === null
            || $unit->getAttribute('users_count') === null
        ) {
            $unit->loadCount(['children', 'members', 'students', 'users']);
        }

        return $unit->children_count === 0
            && $unit->members_count === 0
            && $unit->students_count === 0
            && $unit->users_count === 0;
    }

    private function hasGlobalOrganizationAccess(Request $request): bool
    {
        $user = $request->user();

        return (bool) ($user?->hasRole('super_admin') || AdminAccess::defaultDashboardScope($user) === 'pusat');
    }
}
