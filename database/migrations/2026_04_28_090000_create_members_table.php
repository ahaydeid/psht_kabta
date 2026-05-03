<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_unit_id')->constrained('organization_units')->cascadeOnDelete();
            $table->foreignId('ranting_id')->nullable()->constrained('organization_units')->nullOnDelete();
            $table->string('citizenship', 10)->default('WNI');
            $table->string('identity_type', 20)->default('KTP/KK');
            $table->string('identity_number', 32)->nullable()->unique();
            $table->string('member_number', 64)->unique();
            $table->string('name');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 20);
            $table->string('religion', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('occupation')->nullable();
            $table->string('phone')->nullable();
            $table->date('legalized_at')->nullable();
            $table->string('legalization_place')->nullable();
            $table->string('status', 30)->default('active');
            $table->string('photo_path')->nullable();
            $table->timestamps();

            $table->index(['organization_unit_id', 'status']);
            $table->index(['ranting_id', 'status']);
            $table->index(['status', 'legalized_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
