<?php

namespace Database\Seeders;

use App\Models\OrganizationUnit;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $units = OrganizationUnit::query()
            ->whereIn('code', [
                'RAN-BALARAJA',
                'RAN-CIKUPA',
                'RAN-CURUG',
                'RAY-VILLA',
                'RAY-TALAGA',
                'RAY-BINONG',
                'SUB-VILLA-BARAT',
                'KOM-STAI',
            ])
            ->get()
            ->keyBy('code');

        $students = [
            [
                'organization_unit_code' => 'RAY-VILLA',
                'ranting_code' => 'RAN-BALARAJA',
                'citizenship' => 'WNI',
                'identity_type' => 'KTP/KK',
                'identity_number' => '3603121201060001',
                'name' => 'Andi Pratama',
                'birth_place' => 'Tangerang',
                'birth_date' => '2006-01-12',
                'gender' => 'Laki-laki',
                'religion' => 'Islam',
                'address' => 'Balaraja, Kab. Tangerang',
                'occupation' => 'Pelajar',
                'phone' => '081200001001',
                'father_or_guardian_name' => 'Sutrisno',
                'belt' => 'Polos',
                'status' => 'active',
                'joined_at' => '2026-01-12',
                'photo_path' => null,
            ],
            [
                'organization_unit_code' => 'SUB-VILLA-BARAT',
                'ranting_code' => 'RAN-BALARAJA',
                'citizenship' => 'WNI',
                'identity_type' => 'KTP/KK',
                'identity_number' => '3603122002060002',
                'name' => 'Dewi Lestari',
                'birth_place' => 'Tangerang',
                'birth_date' => '2006-02-20',
                'gender' => 'Perempuan',
                'religion' => 'Islam',
                'address' => 'Balaraja, Kab. Tangerang',
                'occupation' => 'Pelajar',
                'phone' => '081200001002',
                'father_or_guardian_name' => 'Hendra Wijaya',
                'belt' => 'Jambon',
                'status' => 'active',
                'joined_at' => '2026-01-20',
                'photo_path' => null,
            ],
            [
                'organization_unit_code' => 'RAY-TALAGA',
                'ranting_code' => 'RAN-CIKUPA',
                'citizenship' => 'WNI',
                'identity_type' => 'KTP/KK',
                'identity_number' => '3603120302060003',
                'name' => 'Rizky Maulana',
                'birth_place' => 'Tangerang',
                'birth_date' => '2006-02-03',
                'gender' => 'Laki-laki',
                'religion' => 'Islam',
                'address' => 'Cikupa, Kab. Tangerang',
                'occupation' => 'Pelajar',
                'phone' => '081200001003',
                'father_or_guardian_name' => 'Ahmad Fauzi',
                'belt' => 'Hijau',
                'status' => 'inactive',
                'joined_at' => '2026-02-03',
                'photo_path' => null,
            ],
            [
                'organization_unit_code' => 'KOM-STAI',
                'ranting_code' => null,
                'citizenship' => 'WNI',
                'identity_type' => 'KTP/KK',
                'identity_number' => '3603121502060004',
                'name' => 'Siti Nurhaliza',
                'birth_place' => 'Tangerang',
                'birth_date' => '2006-02-15',
                'gender' => 'Perempuan',
                'religion' => 'Islam',
                'address' => 'Tigaraksa, Kab. Tangerang',
                'occupation' => 'Mahasiswa',
                'phone' => '081200001004',
                'father_or_guardian_name' => 'Mulyadi',
                'belt' => 'Putih',
                'status' => 'transferred',
                'joined_at' => '2026-02-15',
                'photo_path' => null,
            ],
            [
                'organization_unit_code' => 'RAY-BINONG',
                'ranting_code' => 'RAN-CURUG',
                'citizenship' => 'WNI',
                'identity_type' => 'KTP/KK',
                'identity_number' => '3603120103060005',
                'name' => 'Bagas Saputra',
                'birth_place' => 'Tangerang',
                'birth_date' => '2006-03-01',
                'gender' => 'Laki-laki',
                'religion' => 'Islam',
                'address' => 'Curug, Kab. Tangerang',
                'occupation' => 'Pelajar',
                'phone' => '081200001005',
                'father_or_guardian_name' => 'Bambang Saputra',
                'belt' => 'Putih',
                'status' => 'graduated',
                'joined_at' => '2026-03-01',
                'photo_path' => null,
            ],
        ];

        foreach ($students as $item) {
            $organizationUnit = $units[$item['organization_unit_code']] ?? null;

            if (! $organizationUnit) {
                continue;
            }

            Student::query()->updateOrCreate(
                ['identity_number' => $item['identity_number']],
                [
                    'organization_unit_id' => $organizationUnit->id,
                    'ranting_id' => $item['ranting_code'] ? ($units[$item['ranting_code']]->id ?? null) : null,
                    'citizenship' => $item['citizenship'],
                    'identity_type' => $item['identity_type'],
                    'identity_number' => $item['identity_number'],
                    'name' => $item['name'],
                    'birth_place' => $item['birth_place'],
                    'birth_date' => $item['birth_date'],
                    'gender' => $item['gender'],
                    'religion' => $item['religion'],
                    'address' => $item['address'],
                    'occupation' => $item['occupation'],
                    'phone' => $item['phone'],
                    'father_or_guardian_name' => $item['father_or_guardian_name'],
                    'belt' => $item['belt'],
                    'status' => $item['status'],
                    'joined_at' => $item['joined_at'],
                    'photo_path' => $item['photo_path'],
                ],
            );
        }
    }
}
