<?php

namespace App\Http\Middleware;

use App\Support\AdminAccess;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $user?->only(['id', 'name', 'email', 'organization_unit_id']),
                'organizationUnit' => fn () => $user?->organizationUnit?->only(['id', 'parent_id', 'type', 'name', 'code']),
                'roles' => fn () => $user?->getRoleNames()->values() ?? [],
                'permissions' => fn () => $user?->getAllPermissions()->pluck('name')->values() ?? [],
                'access' => fn () => [
                    'allowedDashboardScopes' => AdminAccess::allowedDashboardScopes($user),
                    'allowedSettingScopes' => AdminAccess::allowedSettingScopes($user),
                    'defaultDashboardScope' => AdminAccess::defaultDashboardScope($user),
                    'canViewRolePermission' => AdminAccess::canViewRolePermission($user),
                    'canViewUserManagement' => AdminAccess::canViewUserManagement($user),
                ],
            ],
        ];
    }
}
