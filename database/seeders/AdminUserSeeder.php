<?php

namespace Database\Seeders;

use App\Models\OrganizationUnit;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $units = OrganizationUnit::query()
            ->whereIn('code', [
                'PSHT-PUSAT',
                'CAB-KABTA',
                'RAN-BALARAJA',
                'RAY-VILLA',
                'SUB-VILLA-BARAT',
                'KOM-STAI',
            ])
            ->get()
            ->keyBy('code');

        $users = [
            [
                'name' => 'Admin Super',
                'email' => 'superadmin@psht.test',
                'organization_unit_code' => 'PSHT-PUSAT',
                'role' => 'super_admin',
            ],
            [
                'name' => 'Admin Pusat',
                'email' => 'admin.pusat@psht.test',
                'organization_unit_code' => 'PSHT-PUSAT',
                'role' => 'admin_pusat',
            ],
            [
                'name' => 'Admin Cabang',
                'email' => 'admin.cabang@psht.test',
                'organization_unit_code' => 'CAB-KABTA',
                'role' => 'admin_cabang',
            ],
            [
                'name' => 'Admin Ranting',
                'email' => 'admin.ranting@psht.test',
                'organization_unit_code' => 'RAN-BALARAJA',
                'role' => 'admin_ranting',
            ],
            [
                'name' => 'Admin Rayon',
                'email' => 'admin.rayon@psht.test',
                'organization_unit_code' => 'RAY-VILLA',
                'role' => 'admin_rayon',
            ],
            [
                'name' => 'Admin Sub Rayon',
                'email' => 'admin.subrayon@psht.test',
                'organization_unit_code' => 'SUB-VILLA-BARAT',
                'role' => 'admin_sub_rayon',
            ],
            [
                'name' => 'Admin Komisariat',
                'email' => 'admin.komisariat@psht.test',
                'organization_unit_code' => 'KOM-STAI',
                'role' => 'admin_komisariat',
            ],
        ];

        foreach ($users as $item) {
            $user = User::query()->updateOrCreate(
                ['email' => $item['email']],
                [
                    'name' => $item['name'],
                    'organization_unit_id' => $units[$item['organization_unit_code']]->id ?? null,
                    'password' => 'password',
                ],
            );

            $user->syncRoles([$item['role']]);
        }
    }
}
