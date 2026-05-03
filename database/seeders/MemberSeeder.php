<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\OrganizationUnit;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $units = OrganizationUnit::query()
            ->whereIn('code', ['CAB-KABTA', 'RAN-BALARAJA', 'RAY-VILLA', 'RAY-TALAGA', 'KOM-STAI'])
            ->get()
            ->keyBy('code');

        $members = [
            [
                'organization_code' => 'RAN-BALARAJA',
                'identity_number' => '3671010101900001',
                'member_number' => 'NIW-1999-001',
                'name' => 'Slamet Raharjo',
                'birth_place' => 'Tangerang',
                'birth_date' => '1990-01-01',
                'gender' => 'Laki-laki',
                'religion' => 'Islam',
                'address' => 'Balaraja, Kabupaten Tangerang',
                'occupation' => 'Wiraswasta',
                'phone' => '81200002001',
                'legalized_at' => '2009-08-20',
                'legalization_place' => 'Cabang Kabupaten Tangerang',
                'status' => 'active',
            ],
            [
                'organization_code' => 'RAY-VILLA',
                'identity_number' => '3671015202920002',
                'member_number' => 'NIW-2008-014',
                'name' => 'Rina Kartika',
                'birth_place' => 'Tangerang',
                'birth_date' => '1992-02-12',
                'gender' => 'Perempuan',
                'religion' => 'Islam',
                'address' => 'Villa Balaraja, Kabupaten Tangerang',
                'occupation' => 'Guru',
                'phone' => '81200002002',
                'legalized_at' => '2012-08-18',
                'legalization_place' => 'Cabang Kabupaten Tangerang',
                'status' => 'active',
            ],
            [
                'organization_code' => 'RAY-TALAGA',
                'identity_number' => '3671010103880003',
                'member_number' => 'NIW-2006-023',
                'name' => 'Dedi Hermawan',
                'birth_place' => 'Tangerang',
                'birth_date' => '1988-03-01',
                'gender' => 'Laki-laki',
                'religion' => 'Islam',
                'address' => 'Cikupa, Kabupaten Tangerang',
                'occupation' => 'Karyawan Swasta',
                'phone' => '81200002003',
                'legalized_at' => '2010-08-21',
                'legalization_place' => 'Cabang Kabupaten Tangerang',
                'status' => 'active',
            ],
            [
                'organization_code' => 'KOM-STAI',
                'identity_number' => '3671014404950004',
                'member_number' => 'NIW-2014-031',
                'name' => 'Nur Aisyah',
                'birth_place' => 'Tangerang',
                'birth_date' => '1995-04-04',
                'gender' => 'Perempuan',
                'religion' => 'Islam',
                'address' => 'Kampus STAI, Kabupaten Tangerang',
                'occupation' => 'Mahasiswa',
                'phone' => '81200002004',
                'legalized_at' => '2017-08-19',
                'legalization_place' => 'Cabang Kabupaten Tangerang',
                'status' => 'active',
            ],
        ];

        foreach ($members as $item) {
            $unit = $units->get($item['organization_code']);

            if (! $unit) {
                continue;
            }

            Member::query()->updateOrCreate(
                ['member_number' => $item['member_number']],
                [
                    'organization_unit_id' => $unit->id,
                    'ranting_id' => $this->rantingIdFor($unit),
                    'citizenship' => 'WNI',
                    'identity_type' => 'KTP/KK',
                    'identity_number' => $item['identity_number'],
                    'name' => $item['name'],
                    'birth_place' => $item['birth_place'],
                    'birth_date' => $item['birth_date'],
                    'gender' => $item['gender'],
                    'religion' => $item['religion'],
                    'address' => $item['address'],
                    'occupation' => $item['occupation'],
                    'phone' => $item['phone'],
                    'legalized_at' => $item['legalized_at'],
                    'legalization_place' => $item['legalization_place'],
                    'status' => $item['status'],
                ],
            );
        }
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
}
