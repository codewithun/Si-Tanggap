<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

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

    protected function setKoordinatAttribute($value)
    {
        try {
            if (is_string($value)) {
                // Verify it's valid JSON before storing
                json_decode($value);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->attributes['koordinat'] = $value;
                } else {
                    $this->attributes['koordinat'] = '[]';
                }
            } else {
                $this->attributes['koordinat'] = json_encode($value) ?: '[]';
            }
        } catch (\Exception $e) {
            Log::error('Error encoding koordinat: ' . $e->getMessage());
            $this->attributes['koordinat'] = '[]';
        }
    }

    protected function getKoordinatAttribute($value)
    {
        try {
            if (is_string($value)) {
                $decoded = json_decode($value, true);
                return is_array($decoded) ? $decoded : [];
            }
            return is_array($value) ? $value : [];
        } catch (\Exception $e) {
            Log::error('Error decoding koordinat: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get the user that owns the jalur evakuasi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
