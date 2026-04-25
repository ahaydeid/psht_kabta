<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'organization_unit_id',
    'ranting_id',
    'citizenship',
    'identity_type',
    'identity_number',
    'name',
    'birth_place',
    'birth_date',
    'gender',
    'religion',
    'address',
    'occupation',
    'phone',
    'father_or_guardian_name',
    'belt',
    'status',
    'joined_at',
    'photo_path',
])]
class Student extends Model
{
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'joined_at' => 'date',
        ];
    }

    public function organizationUnit(): BelongsTo
    {
        return $this->belongsTo(OrganizationUnit::class);
    }

    public function ranting(): BelongsTo
    {
        return $this->belongsTo(OrganizationUnit::class, 'ranting_id');
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->photo_path ? Storage::url($this->photo_path) : null);
    }
}
