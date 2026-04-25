<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('Admin/Dashboard/Index', [
        'dashboardScope' => 'pusat',
    ]);
})->name('admin.dashboard');

Route::get('/admin/dashboard/{scope}', function (string $scope) {
    abort_unless(in_array($scope, ['cabang', 'ranting', 'rayon', 'sub-rayon', 'komisariat'], true), 404);

    return Inertia::render('Admin/Dashboard/Index', [
        'dashboardScope' => $scope,
    ]);
})->name('admin.dashboard.scope');
