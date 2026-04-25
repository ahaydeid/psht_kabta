<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\StudentController;
use App\Support\AdminAccess;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', function (Request $request) {
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

    Route::get('/admin/profil-akun', [ProfileController::class, 'show'])->name('admin.profile');
    Route::put('/admin/profil-akun', [ProfileController::class, 'updateProfile'])->name('admin.profile.update');
    Route::put('/admin/profil-akun/password', [ProfileController::class, 'updatePassword'])->name('admin.profile.password');
});
