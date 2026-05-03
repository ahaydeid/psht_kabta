<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\OrganizationUnitController;
use App\Http\Controllers\Admin\StudentController;
use App\Support\AdminAccess;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('Home/Index');
})->name('home');
Route::get('/profil', function () {
    return Inertia::render('Home/Profil');
})->name('public.profile');
Route::get('/berita', function () {
    return Inertia::render('Home/Berita');
})->name('public.news');
Route::get('/jadwal', function () {
    return Inertia::render('Home/Jadwal');
})->name('public.schedule');
Route::get('/galeri', function () {
    return Inertia::render('Home/Galeri');
})->name('public.gallery');
Route::get('/kontak', function () {
    return Inertia::render('Home/Kontak');
})->name('public.contact');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/admin/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/admin/dashboard', function (Request $request) {
        abort_unless($request->user()?->can('dashboard.view'), 403);

        $scope = AdminAccess::defaultDashboardScope($request->user());

        if ($scope !== 'pusat') {
            return redirect()->route('admin.dashboard.scope', ['scope' => $scope]);
        }

        return Inertia::render('Admin/Dashboard/Index', [
            'dashboardScope' => $scope,
        ]);
    })->name('admin.dashboard');

    Route::get('/admin/dashboard/{scope}', function (Request $request, string $scope) {
        abort_unless($request->user()?->can('dashboard.view'), 403);
        abort_unless(in_array($scope, ['cabang', 'ranting', 'rayon', 'sub-rayon', 'komisariat'], true), 404);
        abort_unless(AdminAccess::canAccessDashboardScope($request->user(), $scope), 403);

        return Inertia::render('Admin/Dashboard/Index', [
            'dashboardScope' => $scope,
        ]);
    })->name('admin.dashboard.scope');

    Route::get('/admin/master-data/siswa', [StudentController::class, 'index'])->name('admin.master-data.siswa');
    Route::post('/admin/master-data/siswa', [StudentController::class, 'store'])->name('admin.master-data.siswa.store');
    Route::get('/admin/master-data/siswa/{student}', [StudentController::class, 'show'])->name('admin.master-data.siswa.show');
    Route::put('/admin/master-data/siswa/{student}', [StudentController::class, 'update'])->name('admin.master-data.siswa.update');
    Route::delete('/admin/master-data/siswa/{student}', [StudentController::class, 'destroy'])->name('admin.master-data.siswa.destroy');

    Route::get('/admin/master-data/warga', [MemberController::class, 'index'])->name('admin.master-data.warga');
    Route::post('/admin/master-data/warga', [MemberController::class, 'store'])->name('admin.master-data.warga.store');
    Route::get('/admin/master-data/warga/{member}', [MemberController::class, 'show'])->name('admin.master-data.warga.show');
    Route::put('/admin/master-data/warga/{member}', [MemberController::class, 'update'])->name('admin.master-data.warga.update');
    Route::delete('/admin/master-data/warga/{member}', [MemberController::class, 'destroy'])->name('admin.master-data.warga.destroy');

    Route::get('/admin/pengaturan/{scope}', [OrganizationUnitController::class, 'index'])
        ->where('scope', 'cabang|ranting|rayon|sub-rayon|komisariat')
        ->name('admin.pengaturan.organization-unit');
    Route::post('/admin/pengaturan/{scope}', [OrganizationUnitController::class, 'store'])
        ->where('scope', 'cabang|ranting|rayon|sub-rayon|komisariat')
        ->name('admin.pengaturan.organization-unit.store');
    Route::put('/admin/pengaturan/{scope}/{organizationUnit}', [OrganizationUnitController::class, 'update'])
        ->where('scope', 'cabang|ranting|rayon|sub-rayon|komisariat')
        ->whereNumber('organizationUnit')
        ->name('admin.pengaturan.organization-unit.update');
    Route::delete('/admin/pengaturan/{scope}/{organizationUnit}', [OrganizationUnitController::class, 'destroy'])
        ->where('scope', 'cabang|ranting|rayon|sub-rayon|komisariat')
        ->whereNumber('organizationUnit')
        ->name('admin.pengaturan.organization-unit.destroy');

    Route::get('/admin/profil-akun', [ProfileController::class, 'show'])->name('admin.profile');
    Route::put('/admin/profil-akun', [ProfileController::class, 'updateProfile'])->name('admin.profile.update');
    Route::put('/admin/profil-akun/password', [ProfileController::class, 'updatePassword'])->name('admin.profile.password');
});
