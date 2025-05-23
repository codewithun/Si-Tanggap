<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JalurEvakuasi extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
        'koordinat',
        'jenis_bencana',
        'warna',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'koordinat' => 'array',
    ];

    /**
     * Get the user that owns the jalur evakuasi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
