<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'province',
        'geometry',
        'population',
        'area',
        'sub_districts_count'
    ];

    /**
     * Get the facilities data for the region
     */
    public function facilities()
    {
        return $this->hasOne(RegionFacility::class);
    }

    /**
     * Get the disaster data for the region
     */
    public function disasterData()
    {
        return $this->hasOne(DisasterData::class);
    }
}
