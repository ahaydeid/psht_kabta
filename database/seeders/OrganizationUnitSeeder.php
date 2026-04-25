<?php

namespace Database\Seeders;

use App\Models\OrganizationUnit;
use Illuminate\Database\Seeder;

class OrganizationUnitSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $pusat = OrganizationUnit::query()->updateOrCreate(
            ['code' => 'PSHT-PUSAT'],
            [
                'name' => 'PSHT Pusat',
                'type' => 'pusat',
            ],
        );

        $cabang = OrganizationUnit::query()->updateOrCreate(
            ['code' => 'CAB-KABTA'],
            [
                'parent_id' => $pusat->id,
                'name' => 'Cabang Kabupaten Tangerang',
                'type' => 'cabang',
            ],
        );

        $ranting = OrganizationUnit::query()->updateOrCreate(
            ['code' => 'RAN-BALARAJA'],
            [
                'parent_id' => $cabang->id,
                'name' => 'Ranting Balaraja',
                'type' => 'ranting',
            ],
        );

        $rantingCikupa = OrganizationUnit::query()->updateOrCreate(
            ['code' => 'RAN-CIKUPA'],
            [
                'parent_id' => $cabang->id,
                'name' => 'Ranting Cikupa',
                'type' => 'ranting',
            ],
        );

        $rantingCurug = OrganizationUnit::query()->updateOrCreate(
            ['code' => 'RAN-CURUG'],
            [
                'parent_id' => $cabang->id,
                'name' => 'Ranting Curug',
                'type' => 'ranting',
            ],
        );

        $rayon = OrganizationUnit::query()->updateOrCreate(
            ['code' => 'RAY-VILLA'],
            [
                'parent_id' => $ranting->id,
                'name' => 'Rayon Villa',
                'type' => 'rayon',
            ],
        );

        OrganizationUnit::query()->updateOrCreate(
            ['code' => 'RAY-TALAGA'],
            [
                'parent_id' => $rantingCikupa->id,
                'name' => 'Rayon Talaga',
                'type' => 'rayon',
            ],
        );

        OrganizationUnit::query()->updateOrCreate(
            ['code' => 'RAY-BINONG'],
            [
                'parent_id' => $rantingCurug->id,
                'name' => 'Rayon Binong',
                'type' => 'rayon',
            ],
        );

        OrganizationUnit::query()->updateOrCreate(
            ['code' => 'SUB-VILLA-BARAT'],
            [
                'parent_id' => $rayon->id,
                'name' => 'Sub Rayon Villa Barat',
                'type' => 'sub_rayon',
            ],
        );

        OrganizationUnit::query()->updateOrCreate(
            ['code' => 'KOM-STAI'],
            [
                'parent_id' => $cabang->id,
                'name' => 'Komisariat STAI',
                'type' => 'komisariat',
            ],
        );
    }
}
