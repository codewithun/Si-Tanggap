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
        Schema::table('users', function (Blueprint $table) {
            $table->string('id_card_path')->nullable()->after('profile_photo_path');
            $table->string('organization')->nullable()->after('id_card_path');
            $table->text('experience')->nullable()->after('organization');
            $table->text('motivation')->nullable()->after('experience');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['id_card_path', 'organization', 'experience', 'motivation']);
        });
    }
};
