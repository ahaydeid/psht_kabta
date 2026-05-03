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
    'member_number',
    'name',
    'birth_place',
    'birth_date',
    'gender',
    'religion',
    'address',
    'occupation',
    'phone',
    'legalized_at',
    'legalization_place',
    'status',
    'photo_path',
])]
class Member extends Model
{
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'legalized_at' => 'date',
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
