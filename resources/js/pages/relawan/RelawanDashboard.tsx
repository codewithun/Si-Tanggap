import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import AddEvacuationAndShelter from './AddEvacuationAndShelter';
import BencanaMap from './BencanaMap';
import DisasterReportVerification from './DisasterReportVerification';
import EvacuationAndShelterMap from './EvacuationAndShelterMap';

export default function RelawanDashboard() {
    const [activeTab, setActiveTab] = useState('bencana-map');

    return (
        <div className="container mx-auto p-2 sm:p-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Relawan</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Pantau dan kelola informasi kebencanaan</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {' '}
                <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="bencana-map" className="text-xs sm:text-sm">
                        Peta Bencana
                    </TabsTrigger>
                    <TabsTrigger value="evacuation-map" className="text-xs sm:text-sm">
                        Jalur & Posko Evakuasi
                    </TabsTrigger>
                    <TabsTrigger value="add-evacuation" className="text-xs sm:text-sm">
                        Tambah Jalur & Posko
                    </TabsTrigger>
                    <TabsTrigger value="verification" className="text-xs sm:text-sm">
                        Verifikasi Laporan
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="bencana-map" className="space-y-4">
                    <BencanaMap />
                </TabsContent>
                <TabsContent value="evacuation-map" className="space-y-4">
                    <EvacuationAndShelterMap />
                </TabsContent>
                <TabsContent value="add-evacuation" className="space-y-4">
                    <AddEvacuationAndShelter />
                </TabsContent>
                <TabsContent value="verification" className="space-y-4">
                    <DisasterReportVerification />
                </TabsContent>
            </Tabs>

            <Toaster position="top-right" />
        </div>
    );
}
