<?php

namespace Database\Seeders;

use App\Models\Laporan;
use Illuminate\Database\Seeder;

class UpdateLaporanRiskLevelSeeder extends Seeder
{
    /**
     * Run the database seeds to update risk levels.
     */
    public function run(): void
    {
        $this->command->info('Updating risk levels for existing reports...');

        $laporans = Laporan::whereNull('tingkat_bahaya')->get();

        foreach ($laporans as $laporan) {
            $riskLevel = $this->assessRiskLevel($laporan->jenis_bencana, $laporan->deskripsi);
            $laporan->tingkat_bahaya = $riskLevel;
            $laporan->save();

            $this->command->info("Updated laporan ID {$laporan->id} with risk level: {$riskLevel}");
        }

        $this->command->info('Risk level update completed!');
    }

    /**
     * Helper function to assess risk level based on disaster type and description
     */
    private function assessRiskLevel($jenisBencana, $deskripsi)
    {
        $deskripsi = strtolower($deskripsi ?? '');

        // Keywords indicating high risk
        $highRiskKeywords = ['parah', 'besar', 'darurat', 'kritis', 'evakuasi', 'korban', 'luka'];

        // High risk types
        $highRiskTypes = ['gempa', 'tsunami'];

        // Medium risk types
        $mediumRiskTypes = ['banjir', 'kebakaran', 'longsor'];

        // Check for high risk indicators
        if (in_array($jenisBencana, $highRiskTypes)) {
            return 'tinggi';
        }

        foreach ($highRiskKeywords as $keyword) {
            if (strpos($deskripsi, $keyword) !== false) {
                return 'tinggi';
            }
        }

        // Check for medium risk
        if (in_array($jenisBencana, $mediumRiskTypes)) {
            return 'sedang';
        }

        // Default to low risk
        return 'rendah';
    }
}
