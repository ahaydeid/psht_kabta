<?php

namespace Tests\Feature\Admin;

use App\Models\OrganizationUnit;
use App\Models\User;
use Database\Seeders\OrganizationUnitSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrganizationUnitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('The pdo_sqlite driver is not available.');
        }

        parent::setUp();
    }

    public function test_admin_cabang_can_view_own_scope_settings(): void
    {
        $this->seedBaseData();
        $user = $this->adminFor('admin_cabang', 'CAB-KABTA');

        $this
            ->actingAs($user)
            ->get('/admin/pengaturan/cabang')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Pengaturan/OrganizationUnit/Index')
                ->where('scope', 'cabang')
                ->where('scopeLabel', 'Cabang')
                ->has('units.data'));
    }

    public function test_admin_cabang_cannot_view_descendant_scope_settings(): void
    {
        $this->seedBaseData();
        $user = $this->adminFor('admin_cabang', 'CAB-KABTA');

        $this
            ->actingAs($user)
            ->get('/admin/pengaturan/ranting')
            ->assertForbidden();
    }

    public function test_admin_ranting_cannot_view_descendant_scope_settings(): void
    {
        $this->seedBaseData();
        $user = $this->adminFor('admin_ranting', 'RAN-BALARAJA');

        $this
            ->actingAs($user)
            ->get('/admin/pengaturan/rayon')
            ->assertForbidden();
    }

    private function seedBaseData(): void
    {
        $this->seed([
            OrganizationUnitSeeder::class,
            RolesAndPermissionsSeeder::class,
        ]);
    }

    private function adminFor(string $role, string $organizationCode): User
    {
        $unit = OrganizationUnit::query()->where('code', $organizationCode)->firstOrFail();
        $user = User::factory()->create([
            'organization_unit_id' => $unit->id,
        ]);

        $user->assignRole($role);

        return $user;
    }
}
