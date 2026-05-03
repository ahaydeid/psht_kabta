<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'member.view',
            'member.create',
            'member.update',
            'member.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $roleMap = [
            'super_admin' => $permissions,
            'admin_pusat' => $permissions,
            'admin_cabang' => $permissions,
            'admin_ranting' => $permissions,
            'admin_rayon' => $permissions,
            'admin_sub_rayon' => $permissions,
            'admin_komisariat' => $permissions,
            'viewer' => ['member.view'],
        ];

        foreach ($roleMap as $roleName => $grantedPermissions) {
            $role = Role::query()
                ->where('name', $roleName)
                ->where('guard_name', 'web')
                ->first();

            $role?->givePermissionTo($grantedPermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['member.view', 'member.create', 'member.update', 'member.delete'] as $permissionName) {
            $permission = Permission::query()
                ->where('name', $permissionName)
                ->where('guard_name', 'web')
                ->first();

            if (! $permission) {
                continue;
            }

            $permission->roles()->detach();
            $permission->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
