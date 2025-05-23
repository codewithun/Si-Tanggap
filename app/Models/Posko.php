<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Posko extends Model
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
        'latitude',
        'longitude',
        'alamat',
        'kontak',
        'jenis_posko',
        'foto',
        'status',
        'kapasitas',
    ];

    /**
     * Get the user that owns the posko.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
