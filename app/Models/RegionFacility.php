<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegionFacility extends Model
{
    use HasFactory;

    protected $fillable = [
        'region_id',
        'schools',
        'hospitals',
        'health_centers'
    ];

    /**
     * Get the region that owns the facilities
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
