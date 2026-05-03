<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'student.view',
            'student.create',
            'student.update',
            'student.delete',
            'member.view',
            'member.create',
            'member.update',
            'member.delete',
            'attendance.view',
            'attendance.create',
            'attendance.update',
            'user.view',
            'user.manage',
            'role.view',
            'role.manage',
            'organization.view',
            'organization.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $roleMap = [
            'super_admin' => $permissions,
            'admin_pusat' => [
                'dashboard.view',
                'student.view',
                'student.create',
                'student.update',
                'student.delete',
                'member.view',
                'member.create',
                'member.update',
                'member.delete',
                'attendance.view',
                'attendance.create',
                'attendance.update',
                'organization.view',
                'organization.manage',
                'user.view',
                'role.view',
            ],
            'admin_cabang' => [
                'dashboard.view',
                'student.view',
                'student.create',
                'student.update',
                'student.delete',
                'member.view',
                'member.create',
                'member.update',
                'member.delete',
                'attendance.view',
                'attendance.create',
                'attendance.update',
                'organization.view',
                'organization.manage',
            ],
            'admin_ranting' => [
                'dashboard.view',
                'student.view',
                'student.create',
                'student.update',
                'student.delete',
                'member.view',
                'member.create',
                'member.update',
                'member.delete',
                'attendance.view',
                'attendance.create',
                'organization.view',
                'organization.manage',
            ],
            'admin_rayon' => [
                'dashboard.view',
                'student.view',
                'student.create',
                'student.update',
                'student.delete',
                'member.view',
                'member.create',
                'member.update',
                'member.delete',
                'attendance.view',
                'attendance.create',
                'organization.view',
                'organization.manage',
            ],
            'admin_sub_rayon' => [
                'dashboard.view',
                'student.view',
                'student.create',
                'student.update',
                'student.delete',
                'member.view',
                'member.create',
                'member.update',
                'member.delete',
                'attendance.view',
                'attendance.create',
                'organization.view',
                'organization.manage',
            ],
            'admin_komisariat' => [
                'dashboard.view',
                'student.view',
                'student.create',
                'student.update',
                'student.delete',
                'member.view',
                'member.create',
                'member.update',
                'member.delete',
                'attendance.view',
                'attendance.create',
                'organization.view',
                'organization.manage',
            ],
            'operator_absensi' => [
                'dashboard.view',
                'attendance.view',
                'attendance.create',
                'attendance.update',
            ],
            'viewer' => [
                'dashboard.view',
                'student.view',
                'member.view',
                'attendance.view',
                'organization.view',
            ],
        ];

        foreach ($roleMap as $roleName => $grantedPermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($grantedPermissions);
        }
    }
}
