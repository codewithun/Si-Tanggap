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
        Schema::create('poskos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nama');
            $table->text('deskripsi');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('alamat');
            $table->string('kontak')->nullable();
            $table->string('jenis_posko'); // Contoh: Kesehatan, Logistik, Evakuasi, dll
            $table->string('foto')->nullable();
            $table->string('status')->default('aktif'); // aktif atau tidak_aktif
            $table->integer('kapasitas')->default(0); // Kapasitas posko (jumlah orang)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poskos');
    }
};
