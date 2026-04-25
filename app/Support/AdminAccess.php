<?php

namespace App\Support;

use App\Models\User;

class AdminAccess
{
    /**
     * @return array<int, string>
     */
    public static function allDashboardScopes(): array
    {
        return ['pusat', 'cabang', 'ranting', 'rayon', 'sub-rayon', 'komisariat'];
    }

    public static function normalizedScope(?string $unitType): ?string
    {
        return match ($unitType) {
            'pusat' => 'pusat',
            'cabang' => 'cabang',
            'ranting' => 'ranting',
            'rayon' => 'rayon',
            'sub_rayon' => 'sub-rayon',
            'komisariat' => 'komisariat',
            default => null,
        };
    }

    /**
     * @return array<int, string>
     */
    public static function allowedDashboardScopes(?User $user): array
    {
        if (! $user) {
            return [];
        }

        if ($user->hasRole('super_admin')) {
            return self::allDashboardScopes();
        }

        $scope = self::normalizedScope($user->organizationUnit?->type);

        return $scope ? [$scope] : [];
    }

    public static function defaultDashboardScope(?User $user): string
    {
        return self::allowedDashboardScopes($user)[0] ?? 'pusat';
    }

    public static function canAccessDashboardScope(?User $user, string $scope): bool
    {
        return in_array($scope, self::allowedDashboardScopes($user), true);
    }

    /**
     * @return array<int, string>
     */
    public static function allowedSettingScopes(?User $user): array
    {
        if (! $user) {
            return [];
        }

        if ($user->hasRole('super_admin')) {
            return ['cabang', 'ranting', 'rayon', 'sub-rayon', 'komisariat'];
        }

        $scope = self::normalizedScope($user->organizationUnit?->type);

        return in_array($scope, ['cabang', 'ranting', 'rayon', 'sub-rayon', 'komisariat'], true)
            ? [$scope]
            : [];
    }

    public static function canViewRolePermission(?User $user): bool
    {
        return (bool) $user?->can('role.view');
    }

    public static function canViewUserManagement(?User $user): bool
    {
        return (bool) $user?->can('user.view');
    }
}
