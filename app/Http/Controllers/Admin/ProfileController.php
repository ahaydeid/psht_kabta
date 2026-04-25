<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Admin/Profile/Index', [
            'profile' => [
                'name' => $request->user()?->name,
                'username' => $request->user()?->email,
                'roles' => $request->user()?->getRoleNames()->values() ?? [],
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()?->update([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Informasi akun berhasil diperbarui.');
    }

    /**
     * @throws ValidationException
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! $user || ! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Sandi sekarang tidak sesuai.',
            ]);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Kata sandi berhasil diperbarui.');
    }
}
