<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisasterData extends Model
{
    use HasFactory;

    protected $fillable = [
        'region_id',
        'flood_index',
        'landslide_index',
        'earthquake_index',
        'tsunami_index',
        'fire_index',
        'cyclone_index',
        'drought_index',
        'other_index'
    ];

    /**
     * Get the region that owns the disaster data
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
