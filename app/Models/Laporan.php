<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Laporan extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'judul',
        'jenis_bencana',
        'deskripsi',
        'latitude',
        'longitude',
        'lokasi',
        'foto',
        'status',
        'catatan_admin',
        'tingkat_bahaya',
    ];

    protected $casts = [
        'status' => 'string'
    ];

    // Tambahkan konstanta untuk status yang valid
    public const STATUS_MENUNGGU = 'menunggu';
    public const STATUS_DIVERIFIKASI = 'diverifikasi';
    public const STATUS_DITOLAK = 'ditolak';

    /**
     * Get the user that owns the laporan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
