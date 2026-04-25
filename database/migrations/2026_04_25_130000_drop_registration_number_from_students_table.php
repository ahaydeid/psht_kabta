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
        if (! Schema::hasColumn('students', 'registration_number')) {
            return;
        }

        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique('students_registration_number_unique');
            $table->dropColumn('registration_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('students', 'registration_number')) {
            return;
        }

        Schema::table('students', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->unique()->after('ranting_id');
        });
    }
};
