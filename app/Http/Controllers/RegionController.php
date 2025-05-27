<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Region;
use App\Models\DisasterData;

class RegionController extends Controller
{
    /**
     * Get all regions with disaster risk data
     */
    public function index(Request $request)
    {
        // Get query parameters for filtering
        $disasterType = $request->input('disaster_type', 'banjir');

        // Get regions with their base data
        $regions = Region::with(['facilities', 'disasterData'])
            ->get()
            ->map(function ($region) use ($disasterType) {
                // Transform to the structure expected by the frontend
                return [
                    'id' => $region->id,
                    'name' => $region->name,
                    'province' => $region->province,
                    'geometry' => json_decode($region->geometry), // GeoJSON
                    'riskIndex' => $this->calculateRiskIndex($region, $disasterType),
                    'disasterData' => $this->getDisasterData($region),
                    'facilities' => [
                        'schools' => $region->facilities->schools ?? 0,
                        'hospitals' => $region->facilities->hospitals ?? 0,
                        'healthCenters' => $region->facilities->health_centers ?? 0,
                    ],
                    'population' => $region->population,
                    'area' => $region->area,
                    'affectedArea' => $this->calculateAffectedArea($region, $disasterType),
                    'subDistricts' => $region->sub_districts_count,
                ];
            });

        return response()->json($regions);
    }

    /**
     * Calculate risk index for a region based on disaster type
     */
    private function calculateRiskIndex($region, $disasterType)
    {
        if (!$region->disasterData) {
            return 0;
        }

        $data = $region->disasterData;
        switch ($disasterType) {
            case 'banjir':
                return $data->flood_index ?? 0;
            case 'longsor':
                return $data->landslide_index ?? 0;
            case 'gempa':
                return $data->earthquake_index ?? 0;
            case 'tsunami':
                return $data->tsunami_index ?? 0;
            case 'kebakaran':
                return $data->fire_index ?? 0;
            case 'angin_topan':
                return $data->cyclone_index ?? 0;
            case 'kekeringan':
                return $data->drought_index ?? 0;
            default:
                return $data->other_index ?? 0;
        }
    }

    /**
     * Get all disaster indices for a region
     */
    private function getDisasterData($region)
    {
        if (!$region->disasterData) {
            return [
                'banjir' => 0,
                'longsor' => 0,
                'gempa' => 0,
                'tsunami' => 0,
                'kebakaran' => 0,
                'angin_topan' => 0,
                'kekeringan' => 0,
                'lainnya' => 0,
            ];
        }

        $data = $region->disasterData;
        return [
            'banjir' => $data->flood_index ?? 0,
            'longsor' => $data->landslide_index ?? 0,
            'gempa' => $data->earthquake_index ?? 0,
            'tsunami' => $data->tsunami_index ?? 0,
            'kebakaran' => $data->fire_index ?? 0,
            'angin_topan' => $data->cyclone_index ?? 0,
            'kekeringan' => $data->drought_index ?? 0,
            'lainnya' => $data->other_index ?? 0,
        ];
    }

    /**
     * Calculate affected area based on disaster type and risk level
     */
    private function calculateAffectedArea($region, $disasterType)
    {
        // This would normally come from a more complex calculation based on
        // actual disaster models and geographical analysis
        $riskIndex = $this->calculateRiskIndex($region, $disasterType);

        // For demo purposes, we'll just use a percentage of the total area based on risk
        return round($region->area * $riskIndex * 0.8);
    }

    /**
     * Get details for a specific region
     */
    public function show($id)
    {
        $region = Region::with(['facilities', 'disasterData'])
            ->findOrFail($id);

        // Return detailed data for this specific region
        // Similar to index method transformation but with more detail

        return response()->json([
            'id' => $region->id,
            'name' => $region->name,
            // ... additional properties
        ]);
    }
}
